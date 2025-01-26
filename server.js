const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5001; // Use the PORT provided by Render or default to 5001

app.use(express.json());
app.use(cors());

// Rate limiting for security
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Path to the JSON file
const purchasedFilePath = path.join(__dirname, 'purchased_countries.json');

// Initialize the JSON file if it doesn't exist
if (!fs.existsSync(purchasedFilePath)) {
    fs.writeFileSync(purchasedFilePath, '[]');
}

// POST endpoint to record purchases
app.post('/purchase', (req, res) => {
    const { countryId, buyerAddress, txHash } = req.body;

    if (!countryId || !buyerAddress || !txHash) {
        return res.status(400).json({ error: 'Invalid purchase data' });
    }

    fs.readFile(purchasedFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to process purchase' });
        }

        const purchases = JSON.parse(data);
        const newPurchase = {
            countryId,
            buyerAddress,
            txHash,
            timestamp: new Date().toISOString(),
        };

        purchases.push(newPurchase);

        fs.writeFile(purchasedFilePath, JSON.stringify(purchases, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Failed to save purchase' });
            }

            res.status(200).json({ message: 'Purchase recorded successfully!' });
        });
    });
});

// GET endpoint to retrieve purchased countries
app.get('/purchased-countries', (req, res) => {
    fs.readFile(purchasedFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to load purchased countries' });
        }

        res.status(200).json(JSON.parse(data));
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});