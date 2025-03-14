const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(express.json());

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

app.post('/get-offer', (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ success: false, error: "Missing required parameter: user_id" });
  }

  const offer = mockOffers[user_id] || {
    offerId: "offer_999",
    destination: "New York, USA",
    pointsRequired: 60000,
    expirationDate: "2025-09-30",
    airline: "Global Rewards Airways"
  };

  res.json({ success: true, offer });
});

app.listen(port, () => {
  console.log(`Mock Travel Offer API running on port ${port}`);
});

/* The sample REST API is a simple Express.js server that listens for POST requests to the /get-offer endpoint. 
 * The endpoint expects a JSON body with a user_id field. 
 * If the user_id is found in the mockOffers object, the API responds with a JSON object containing the offer details. 
 * If the user_id is not found, the API responds with a default offer object. 
 * 
 * The API is started by calling app.listen() with the specified port number.
 * The server can be started by running node sample-rest-api.js in the terminal.
 * The server will then listen for incoming requests on the specified port. */