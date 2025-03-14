const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const xml2js = require('xml2js');

exports.handler = async function (context, event, callback) {
  console.log('SOAP Function triggered with event:', event);

  try {
    // Validate input
    const { endpoint, soapAction, soapBody } = event;
    if (!endpoint || !soapAction || !soapBody) {
      console.log('Missing required parameters: endpoint, soapAction, or soapBody');
      return callback(null, { success: false, error: 'Missing required parameters: endpoint, soapAction, or soapBody' });
    }

    console.log('Preparing SOAP request to:', endpoint);
    
    // Construct SOAP request
    const headers = {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': soapAction,
    };

    const requestOptions = {
      method: 'POST',
      headers,
      body: soapBody,
    };

    // Make the SOAP request
    console.log('Sending SOAP request...');
    const response = await fetch(endpoint, requestOptions);
    console.log('Received response with status:', response.status);
    
    const responseText = await response.text();
    console.log('Response body:', responseText);

    // Parse SOAP response to JSON
    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedResponse = await parser.parseStringPromise(responseText);
    console.log('Parsed SOAP response:', parsedResponse);
    
    // Extract GetOfferResponse to simplify response for Studio
    const offerData = parsedResponse["soap:Envelope"]["soap:Body"]["GetOfferResponse"];
    console.log('Extracted offer data:', offerData);

    // Return API response to Studio
    return callback(null, { success: true, data: offerData });
  } catch (error) {
    console.error('Error calling SOAP API:', error);
    return callback(null, { success: false, error: error.message || 'Internal Server Error' });
  }
};
