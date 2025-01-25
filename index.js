const express = require('express');
const app = express();
const port = 3000;

const RATE_TIME = 30000; // 30 seconds
const RATE_LIMIT = 5; // 5 requests in 30 seconds

const requestLogs = new Map();

const rateLimiter = (req, res, next) => {
    const currentTime = Date.now();
    const clientIP = req.ip;

    if (requestLogs.has(clientIP)) {
        const userData = requestLogs.get(clientIP);

        // Check if the time window has not expired
        if (currentTime - userData.timestamp < RATE_TIME) {
            if (userData.count >= RATE_LIMIT) {
                return res.status(429).send('Too many requests'); // Stop further processing
            }
            userData.count += 1; // Increment the request count
        } else {
            // Reset the request count if the time window has expired
            userData.count = 1;
            userData.timestamp = currentTime;
        }

        requestLogs.set(clientIP, userData); // Update the map with updated data
    } else {
        // Add new user to the map
        requestLogs.set(clientIP, { count: 1, timestamp: currentTime });
    }

    next(); // Proceed to the next middleware/route handler
};

// Middleware
app.use('/api',rateLimiter);

// Routes
app.get('/api', (req, res) => {
    res.send('Hello World');
});

// Endpoint to get request logs
app.get('/getlog', (req, res) => {
    // Convert Map to an object for serialization
    const logs = Object.fromEntries(requestLogs);
    res.json(logs);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});
