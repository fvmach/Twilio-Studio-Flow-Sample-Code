const express = require('express');
const bodyParser = require('body-parser');
const xml2js = require('xml2js');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse text/xml requests
app.use(bodyParser.text({ type: 'text/xml' }));

// Mocked travel offers
const mockOffers = {
    "user_123": {
        offerId: "offer_001",
        destination: "Paris, France",
        pointsRequired: 50000,
        expirationDate: "2025-12-31",
        airline: "Air Twilio"
    },
    "user_456": {
        offerId: "offer_002",
        destination: "Tokyo, Japan",
        pointsRequired: 75000,
        expirationDate: "2025-06-30",
        airline: "Twilio Airlines"
    }
};

app.post('/soap-offer', async (req, res) => {
    try {
        // Parse XML request
        const parser = new xml2js.Parser({ explicitArray: false });
        const requestBody = await parser.parseStringPromise(req.body);

        const userId = requestBody?.Envelope?.Body?.GetOfferRequest?.User_ID;
        if (!userId) {
            return res.status(400).send('<?xml version="1.0"?><Error>Missing User_ID</Error>');
        }

        const offer = mockOffers[userId] || {
            offerId: "offer_999",
            destination: "New York, USA",
            pointsRequired: 60000,
            expirationDate: "2025-09-30",
            airline: "Global Rewards Airways"
        };

        // Construct SOAP response
        const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetOfferResponse>
            <OfferId>${offer.offerId}</OfferId>
            <Destination>${offer.destination}</Destination>
            <PointsRequired>${offer.pointsRequired}</PointsRequired>
            <ExpirationDate>${offer.expirationDate}</ExpirationDate>
            <Airline>${offer.airline}</Airline>
          </GetOfferResponse>
        </soap:Body>
      </soap:Envelope>`;

        res.set('Content-Type', 'text/xml');
        res.send(responseXml);
    } catch (error) {
        console.error("Error processing SOAP request:", error);
        res.status(500).send('<?xml version="1.0"?><Error>Internal Server Error</Error>');
    }
});

app.listen(port, () => {
    console.log(`Mock SOAP Travel Offer API running on port ${port}`);
});

/*       The script above creates a simple Express server that listens for POST requests on the  /soap-offer  endpoint. The server expects the request body to be in XML format and parses it using the  xml2js  library. It then extracts the  User_ID  from the request body and uses it to look up a travel offer from a hardcoded list of offers. If the user ID is not found, the server returns a default offer. Finally, the server constructs a SOAP response in XML format and sends it back to the client. 
 *       To run the script, save it as  sample-soap-api.js  in the  scripts/sample_apis  directory and start the server by running the following command: 
 *       node scripts/sample_apis/sample-soap-api.js
 *    
 *       The server should now be running on  http://localhost:3000 . 
 *       Testing the SOAP API 
 *       To test the SOAP API, you can use a tool like  Postman or  cURL to send a POST request to the  /soap-offer  endpoint with a sample SOAP request. 
 *       Here's an example of a SOAP request that you can use to test the API: 
 *       POST /soap-offer HTTP/1.1  */