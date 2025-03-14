# Studio Flow Automation Project

## Overview
This project automates the creation and update of **Twilio Studio Flows** using **Twilio Serverless Functions** and **Twilio REST API**. It enables dynamic workflow generation based on parameters, integrating external REST and SOAP APIs for personalized customer interactions.

## Features
- Generate and update Twilio Studio Flows dynamically.
- Handle REST & SOAP API interactions via Twilio Functions.
- Sync data using Twilio Sync Service for state management.
- Deploy Twilio Serverless Functions automatically.
- Validate Twilio Studio Flow definitions before publishing.

## Project Structure
```
├── functions/                # Twilio Serverless Functions
│   ├── make-http-request.js  # Function to make HTTP requests
│   ├── make-soap-request.js  # Function to handle SOAP requests
│   ├── sync-object-handler.js # Function to create/update Sync Objects
│   ├── get-sync-object.js    # Function to retrieve Sync Objects
├── scripts/                  # Utility scripts
│   ├── Generate_Update_Studio_Flow.js  # Script to create/update Studio Flow
│   ├── sample_apis/          # Mock APIs for testing
├── assets/                   # Static assets (if needed)
├── .env                      # Environment variables (ignored by Git)
├── package.json              # Project dependencies
├── README.md                 # Project documentation
```

## Prerequisites
Ensure you have the following installed:
- Node.js (v18+)
- Twilio CLI (`npm install -g twilio-cli`)
- Twilio Serverless Plugin (`twilio plugins:install @twilio-labs/plugin-serverless`)
- Environment Variables (stored in `.env` file):
  ```
  ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  API_KEY=SKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  API_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  SYNC_SERVICE_SID=ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  ```

## Setup & Installation
```sh
# Clone the repository
git clone https://github.com/your-repo/studio-serverless-functions.git
cd studio-serverless-functions

# Install dependencies
npm install
```

## Running the Project
### Deploy Twilio Serverless Functions
```sh
twilio serverless:deploy
```

### Run the Studio Flow Generator Script
Create or update a Studio Flow dynamically:
```sh
node scripts/Generate_Update_Studio_Flow.js "" "ZSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```
Replace `ZSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` with your Twilio Serverless Service SID.
- To update an existing Studio Flow, provide the Flow SID as the first argument.

You can also run the script **without** providing the Serverless Service SID, if it has already been included in the `sample-studio-trigger-parameters.json`.
```sh
node scripts/Generate_Update_Studio_Flow.js
```

## Using Sample Functions and APIs
This project includes sample functions and mock APIs to serve as a reference when developing additional functions and integrating external services.

### Sample Functions
- `make-http-request.js`: A function that makes an HTTP request to an external REST API and returns the response to Twilio Studio.
- `make-soap-request.js`: A function that makes a SOAP-based request to an external service and parses the response.
- `sync-object-handler.js`: A function to create or update Sync Objects.
- `get-sync-object.js`: A function to retrieve Sync Objects and return relevant data to Twilio Studio.

These functions can be used as templates to develop custom Twilio Functions for integrating third-party APIs, processing data, and enhancing Studio Flow capabilities.

### Sample APIs
- `sample-rest-api.js`: A mock REST API that receives a `user_id` and returns a travel offer using loyalty points.
- `sample-soap-api.js`: A mock SOAP API that receives a `user_id` and returns a structured XML response with travel-related data.

These mock APIs serve as examples of how to structure API endpoints that Twilio Functions can interact with. When integrating with external services, ensure API endpoints are properly formatted, include authentication as required, and handle error cases gracefully.

## Testing the Functions
### Make a REST API Call via Function
```sh
curl -X POST "http://localhost:2000/make-http-request" \
     -H "Content-Type: application/json" \
     -d '{
           "endpoint": "http://localhost:3000/get-offer",
           "method": "POST",
           "headers": "{ \"Content-Type\": \"application/json\" }",
           "body": "{ \"user_id\": \"user_123\" }"
         }'
```

### Make a SOAP API Call via Function
```sh
curl -X POST "http://localhost:2000/make-soap-request" \
     -H "Content-Type: application/json" \
     -d '{
           "endpoint": "http://localhost:3000/soap-offer",
           "soapAction": "GetOffer",
           "soapBody": "<Envelope xmlns=\"http://schemas.xmlsoap.org/soap/envelope/\"><Body><GetOfferRequest><User_ID>user_123</User_ID></GetOfferRequest></Body></Envelope>"
         }'
```

## Debugging & Logging
- Check Twilio Function Logs:
  ```sh
  twilio serverless:logs --tail
  ```
- Add debug logs in Twilio Console → Monitor → Debugger.

## Troubleshooting
| Issue | Solution |
|--------|----------|
| `.env` variables not loading | Run `export $(grep -v '^#' .env | xargs)` before running the script |
| `Error: username is required` | Ensure Twilio credentials (`ACCOUNT_SID`, `API_KEY`, `API_SECRET`) are correctly set in `.env` |
| `Flow validation failed` | Log validation response (`JSON.stringify(validationData, null, 2)`) to debug issues |
| `Serverless deployment failed` | Install a compatible `@twilio/runtime-handler` version (`npm install @twilio/runtime-handler@2.0.1` and update package.json to specific version (e.g., replace `^2.0.1` with `2.0.1`)) |

## Twilio Studio CI/CD
For a more advanced management of Studio Flows and Serverless Functions, refer to the official guide:
[Twilio Code Exchange - Studio GitHub Actions](https://www.twilio.com/code-exchange/studio-github-actions)

## License
This project is licensed under the MIT License.

