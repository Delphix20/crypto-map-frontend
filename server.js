
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5001; // Change the port if necessary

app.use(express.json()); // Middleware to parse JSON request bodies

// Path to the JSON file for purchased countries
const purchasedFilePath = path.join(__dirname, 'purchased_countries.json');

// Initialize the JSON file if it doesn't exist
if (!fs.existsSync(purchasedFilePath)) {
    fs.writeFileSync(purchasedFilePath, '[]'); // Create an empty array in the JSON file
}

// Endpoint to save a purchased country
app.post('/purchase', (req, res) => {
    const { countryId, buyerAddress, txHash } = req.body;

    if (!countryId || !buyerAddress || !txHash) {
        return res.status(400).json({ error: 'Invalid purchase data' });
    }

    // Read the current JSON file
    fs.readFile(purchasedFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to process purchase' });
        }

        const purchases = JSON.parse(data); // Parse existing purchases
        const newPurchase = {
            countryId,
            buyerAddress,
            txHash,
            timestamp: new Date().toISOString(),
        };

        // Add the new purchase
        purchases.push(newPurchase);

        // Save the updated JSON
        fs.writeFile(purchasedFilePath, JSON.stringify(purchases, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Failed to save purchase' });
            }

            res.status(200).json({ message: 'Purchase recorded successfully!' });
        });
    });
});

// Endpoint to retrieve all purchased countries
app.get('/purchased-countries', (req, res) => {
    fs.readFile(purchasedFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to load purchased countries' });
        }

        const purchases = JSON.parse(data);
        res.status(200).json(purchases);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
