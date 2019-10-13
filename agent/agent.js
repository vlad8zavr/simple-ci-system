//const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const HOST = '127.0.0.1';
const PORT = 8801;

const req = request.post(
    'http://localhost:8800/notify_agent', {
        json: {
            host: HOST,
            port: PORT
        }
    }, (error, res, body) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log(res.statusCode, body);
        }
    })


app.post('/build', (req, res) => {
    console.log('build request');
    console.log(req.body);
})


app.listen(PORT, HOST, () => {
    console.log('yo dawgs, now listen to the port 8801 (agent) ...');
});