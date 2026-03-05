// Load environment variables (needed for local dev, Vercel handles this in production)
require('dotenv').config();

// Import necessary modules
const express = require('express');
const Retell = require('retell-sdk').default; // Use default import for SDK >= v2.0.0
const cors = require('cors');

// Initialize Express app
const app = express();

// --- Configuration ---
const retellApiKey = process.env.RETELL_API_KEY;

// Check if API key is provided
if (!retellApiKey) {
  console.error("Error: RETELL_API_KEY environment variable not set.");
  // Don't exit in serverless, let requests fail cleanly
  // process.exit(1); 
}

// Initialize Retell client (only if API key exists)
let retellClient;
if (retellApiKey) {
  try {
    retellClient = new Retell({
      apiKey: retellApiKey,
    });
    console.log("Retell client initialized successfully.");
  } catch (error) {
    console.error("Error initializing Retell client:", error);
    retellClient = null; // Ensure client is null if init fails
  }
} else {
  retellClient = null;
  console.warn("Retell client not initialized because API key is missing.");
}


// --- Middleware ---
// Enable CORS for all origins (adjust in production for security if needed)
app.use(cors());
// Parse JSON request bodies (though not strictly needed for this GET request)
app.use(express.json());


// --- API Endpoint ---
app.get('/api/calls', async (req, res) => {
  console.log("Received request for /api/calls");

  if (!retellClient) {
    console.error("Retell client is not initialized. Cannot fetch calls.");
    return res.status(500).json({ error: 'Retell client not initialized. Check API key.' });
  }

  try {
    console.log("Fetching calls from Retell API...");
    // Use the Retell SDK to list calls
    const callResponses = await retellClient.call.list();
    console.log(`Successfully fetched ${callResponses.length} calls.`);
    // Send the data back to the frontend
    res.status(200).json(callResponses);
  } catch (error) {
    console.error('Error fetching calls from Retell API:', error);
    res.status(500).json({ error: 'Failed to fetch calls', details: error.message });
  }
});

// --- Vercel Export ---
// Export the Express app for Vercel's serverless environment
module.exports = app;

// --- Local Development Only (Vercel ignores this part) ---
// Only run the server locally if this file is executed directly
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Backend server (for local dev) listening at http://localhost:${PORT}`);
  });
}
