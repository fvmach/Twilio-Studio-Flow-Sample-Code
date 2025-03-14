require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

const ACCOUNT_SID = process.env.ACCOUNT_SID;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

const client = twilio(API_KEY, API_SECRET, { accountSid: ACCOUNT_SID });
const parametersPath = path.join(__dirname, 'sample-studio-trigger-parameters.json');
const parameters = JSON.parse(fs.readFileSync(parametersPath, 'utf8'));

async function createOrUpdateStudioFlow(flowSid, serviceSid, parameters) {
  try {
    console.log("Fetching Twilio Serverless Functions...");
    const functions = await client.serverless.v1.services(serviceSid).functions.list();
    const functionNames = functions.map(fn => fn.friendlyName);
    
    console.log('Functions found:', functionNames);

    const flowDefinition = {
      description: "Auto-generated Studio Flow",
      states: [],
      initial_state: "Trigger",
      flags: { allow_concurrent_calls: true }
    };

    console.log("Adding REST API Trigger...");
    flowDefinition.states.push({
      name: "Trigger",
      type: "trigger",
      properties: {
        trigger: "rest_api",
        variables: parameters
      },
      transitions: [{ next: "SetVariables" }]
    });

    console.log("Adding Set Variables Widget...");
    flowDefinition.states.push({
      name: "SetVariables",
      type: "set_variables",
      properties: {
        variables: Object.entries(parameters).map(([key, value]) => ({ key, value: `{{flow.data.${key}}}` }))
      },
      transitions: functionNames.length ? functionNames.map((fn, index) => ({ event: "next", next: `Split_${index}` })) : [{ event: "next", next: "END" }]
    });

    console.log("Adding Split Based On Widgets...");
    functionNames.forEach((fn, index) => {
      flowDefinition.states.push({
        name: `Split_${index}`,
        type: "split_based_on",
        properties: { input: `{{widgets.SetVariables.parsed.${fn}}}` },
        transitions: [{ event: "match", next: "END" }]
      });
    });

    console.log("Validating Studio Flow Definition...");
    const validationResponse = await fetch(`https://studio.twilio.com/v2/Flows/Validate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64")}`
      },
      body: JSON.stringify({ definition: flowDefinition })
    });
    
    const validationData = await validationResponse.json();
    console.log("Validation Response:", JSON.stringify(validationData, null, 2)); // 🔍 Added for debugging
    
    if (!validationData.valid) {
      console.error("Flow validation failed:", validationData.errors || "No error details provided.");
      return;
    }
    
    console.log("Flow definition is valid.");

    console.log("Creating or Updating the Studio Flow...");
    const url = flowSid
      ? `https://studio.twilio.com/v2/Flows/${flowSid}`
      : "https://studio.twilio.com/v2/Flows";
    
    const method = flowSid ? "POST" : "POST";
    const studioResponse = await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64")}`
      },
      body: JSON.stringify({
        friendly_name: `Studio Flow for ${serviceSid}`,
        status: "published",
        definition: flowDefinition
      })
    });
    
    const studioData = await studioResponse.json();
    console.log("Studio Flow Updated/Created Successfully:", studioData.sid);
    return studioData;
  } catch (error) {
    console.error("Error creating/updating Studio Flow:", error);
  }
}

(async () => {
  const flowSid = process.argv[2] || parameters.serviceSid || null;  // Optional Flow SID for updating an existing flow
  const serviceSid = process.argv[3] || parameters.serviceSid;
  
  if (!serviceSid) {
    console.error("Error: Service SID is required as the second argument.");
    process.exit(1);
  }

  console.log("Starting Studio Flow creation/update...");
  await createOrUpdateStudioFlow(flowSid, serviceSid, parameters);
  console.log("Process complete.");
})();
