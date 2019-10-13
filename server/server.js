
// const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const request = require('request');
const { HtmlPart1, HtmlPart2 } = require('../html/htmlParts.js');

const configFile = require('./config.json');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const HOST = '127.0.0.1';
const PORT = configFile.port;
const REPO = configFile.repository;
const agentList = [];
let BUILDCODE = 10000;


// draw html
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: path.join(__dirname, '../html')});
})

app.get('/build/:id', (req, res) => {
    const { id } = req.params;
    res.sendFile(`${id}.html`, {root: path.join(__dirname, `../html/build`)});
})

// agent registration
app.post('/notify_agent', (req, res) => {
    console.log(req.body);
    let isRegistered = registerAgent(req.body);
    if (isRegistered) res.send(true);
    else res.send(false);

    console.log('agentList\n', agentList);
});

app.post('/build_request', (req, res) => {
    console.log('Build request received');
    console.log(req.body);

    // here we send build request to a free agent
    // цикл for чтобы можно было выйти break
    for (let i = 0, length = agentList.length; i < length; i++) {
        if (agentList[i].isFree === true) {
            agentList[i].isFree = false;
            //sendBuildRequest(agent, req);
            buildCommandProcess(agentList[i], req, res);
            break;
        }
    }
    console.log('after send agentList\n', agentList);
});

app.listen(PORT, HOST, () => {
    console.log('Server - listen to the port 8800 ...');
    console.log('configFile\n', configFile);
});

function registerAgent(info) {
    if (info.host && info.port) {
        agentList.push({ host: info.host, port: info.port, isFree: true });
        return true;
    }
    else return false;
}

function buildCommandProcess(agent, clientReq, clientRes) {
    sendBuildRequest(agent, clientReq);

    // receive build info
    app.post('/notify_build_result', (req, res) => {
        console.log('{/notify_build_result}');
        console.log(req.body);

        for (let i = 0, length = agentList.length; i < length; i++) {
            if (agentList[i].host === agent.host && agentList[i].port === agent.port) {
                agentList[i].isFree = true;
            }
        }

        console.log('agentList after receive\n', agentList);

        BUILDCODE++;

        const htmlDoc = `
        ${HtmlPart1}
            <div>Код сборки: ${BUILDCODE}</div>
            <div>code: ${req.body.code}</div>
            <hr>
            <div>Время начала: <strong>${req.body.timeStart}</strong></div>
            <div>Время окончания: <strong>${req.body.timeEnd}</strong></div>
            <hr>
            <div><strong>Результат</strong></div>
            <div>${req.body.result}</div>
        ${HtmlPart2}
        `;

        const newFilePath = path.join(__dirname, `../html/build/${BUILDCODE}.html`)

        fs.writeFile(newFilePath, htmlDoc, (error) => {
            if(error) console.log('fs writefile error\n', error);
            console.log("Асинхронная запись файла завершена.");
        });

        clientRes.json({ buildReview: { buildCode: BUILDCODE, code: req.body.code }});
        clientRes.end();
        return res.end('OK');
    })
}

function sendBuildRequest(agent, req) {
    const requestToAgent = request.post(
        `http://${agent.host}:${agent.port}/build`, {
            json: {
                repo: REPO,
                hash: req.body.hash,
                command: req.body.command
            }
        }, (error, res, body) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log(res.statusCode, body);
            }
        })
}
