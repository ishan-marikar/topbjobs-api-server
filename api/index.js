const express = require('express');
const redis = require('redis');
let app = express();

let client = redis.createClient(6379, process.env.REDIS_URL || 'localhost');

app.get('/', (request, response) => {
    return response
        .status(200)
        .json({
            name: 'Unofficial topjobs.lk API',
            version: '0.1',
            author: 'Ishan Marikar <ishan@imarikar.com>'
        });
});

app.get('/jobs', (request, response) => {
    client.get('topjobs-scraper:response', (error, reply) => {
        if (error) {
            return response
                .status(500)
                .json({
                    success: false,
                    error: 'server-error'
                });
        }
        let jobs = JSON.parse(reply);
        return response
            .status(200)
            .json({
                success: true,
                numberOfRecords: jobs.length,
                payload: jobs
            });
    });
});

client.on('connect', () => {
    console.log('Connected to redis');
    app.listen(8080, () => {
        console.log('Listening on port 8080');
    });
});