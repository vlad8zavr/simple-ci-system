
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8800;
const agentsList = [];

// global.pathToRep = process.argv[2];

app.post('/notify_agent', (req, res) => {
    console.log(req.body);
});

app.listen(PORT, '127.0.0.1', () => {
    console.log('yo dawgs, now listen to the port 8800 (server) ...');
});