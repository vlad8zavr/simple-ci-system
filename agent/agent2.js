const http = require('http');
const request = require('request');

const HOST = '127.0.0.1';
const PORT = 8802;

const server = http.createServer((req, res) => {
    //console.log('request was made:' + req.url);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(`PORT = ${PORT}`);
    //res.end('Hey man!');
})

// const req = http.request('http://localhost:8800/notify_agent');

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


server.listen(PORT, '127.0.0.1', () => {
    console.log('yo dawgs, now listen to the port 8801 (agent) ...');
});