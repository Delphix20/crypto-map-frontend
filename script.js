(function() {
    const backendUrl = 'https://crypto-map-backend.onrender.com'; // Backend URL

    // Function to load purchased countries and mark them on the map
    async function loadPurchasedCountries() {
        try {
            const response = await fetch(`${backendUrl}/purchased-countries`);
            if (!response.ok) {
                throw new Error('Failed to fetch purchased countries');
            }
            const purchasedCountries = await response.json();
            purchasedCountries.forEach(country => {
                const countryElement = document.getElementById(country.countryId);
                if (countryElement) {
                    countryElement.classList.add('sold');
                }
            });
        } catch (error) {
            console.error('Error loading purchased countries:', error);
        }
    }

    // Function to handle map interactivity
    function initializeMap() {
        document.querySelectorAll('path').forEach(country => {
            country.addEventListener('click', function () {
                const countryId = this.id;
                const isSold = this.classList.contains('sold');

                // Show the pop-up
                const popup = document.getElementById('popup');
                const popupTitle = document.getElementById('popup-title');
                const popupStatus = document.getElementById('popup-status');
                const popupPrice = document.getElementById('popup-price');
                const purchaseButton = document.getElementById('purchase-btn');

                popup.style.display = 'block';
                popupTitle.textContent = countryId; // Replace with country name if available
                popupStatus.textContent = isSold ? 'Sold' : 'Available';
                popupStatus.style.color = isSold ? 'red' : 'green';
                popupPrice.textContent = isSold ? 'N/A' : '0.01 BTC'; // Replace with actual price

                purchaseButton.style.display = isSold ? 'none' : 'block'; // Hide button if sold

                // Add event listener for the purchase button
                purchaseButton.onclick = async function () {
                    try {
                        const response = await fetch(`${backendUrl}/purchase`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                countryId: countryId,
                                buyerAddress: '0x1234567890abcdef', // Replace with wallet logic
                                txHash: '0xabcdef1234567890' // Replace with actual transaction hash
                            })
                        });

                        if (response.ok) {
                            alert('Purchase successful!');
                            country.classList.add('sold');
                            popup.style.display = 'none';
                        } else {
                            alert('Purchase failed!');
                        }
                    } catch (error) {
                        console.error('Error processing purchase:', error);
                        alert('Purchase failed!');
                    }
                };
            });
        });
    }

    // Close the pop-up
    document.getElementById('close-btn').addEventListener('click', function () {
        document.getElementById('popup').style.display = 'none';
    });

    // Initialize everything when the page loads
    document.addEventListener('DOMContentLoaded', async function () {
        await loadPurchasedCountries(); // Load purchased countries
        initializeMap(); // Set up interactivity
    });
})();