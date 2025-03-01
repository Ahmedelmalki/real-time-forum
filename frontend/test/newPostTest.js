const http = require('http');

// Test parameters
const requestsPerBatch = 20;  // Number of simultaneous requests
const totalBatches = 5;       // Number of batches to send
const delayBetweenBatches = 1000; // Delay between batches in ms

function makeRequest() {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            title: "U are coked",
            content: "This is a test post content.",
            categories: ["tech"] // Make sure this is an array
        });

        const options = {
            hostname: "localhost",
            port: 3000,
            path: "/newPost",
            method: "POST",
            headers: {
                "Content-Type": "application/json",  // ✅ Change to JSON
                "Content-Length": Buffer.byteLength(data),
                "Cookie": "forum_session=1e5a8afa-1c98-434e-a4b7-d2f07636eb17"
            }
        };

        const req = http.request(options, (res) => {
            resolve(res.statusCode);
        });

        req.on("error", (error) => {
            resolve(error.code);
        });

        req.write(data);
        req.end();
    });
}


async function runTest() {
    for (let batch = 0; batch < totalBatches; batch++) {
        console.log(`Sending batch ${batch + 1}/${totalBatches}`);

        const promises = Array(requestsPerBatch).fill()
            .map(() => makeRequest());

        const results = await Promise.all(promises);

        // Count status codes
        const counts = results.reduce((acc, code) => {
            acc[code] = (acc[code] || 0) + 1;
            return acc;
        }, {});

        console.log('Results:', counts);

        // Wait before next batch
        if (batch < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
    }
}

runTest();