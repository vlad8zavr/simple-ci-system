
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

let RESCLIENT = null;
let CURRENTAGENT = null;

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

app.post('/notify_build_result', (reqAgent, resAgent) => {
    console.log('{/notify_build_result}');
    console.log(reqAgent.body);
    console.log('==================================================================');

    BUILDCODE++;
    releaseCurrentAgent(CURRENTAGENT);
    createNewHTMLFile(reqAgent);
    
    resAgent.end('[SERVER] CLOSED POST /notufy_build_result');

    // RESCLIENT.json({ buildReview: { buildCode: BUILDCODE, code: reqAgent.body.code }});

    RESCLIENT.end(JSON.stringify({ buildReview: { buildCode: BUILDCODE, code: reqAgent.body.code, time: reqAgent.body.timeEnd }}));
    RESCLIENT = null;
    CURRENTAGENT = null;
    
})

app.post('/build_request', (reqClient, resClient) => {
    console.log('Build request received');

    let countBusyAgents = 0;

    for (let i = 0, length = agentList.length; i < length; i++) {
        if (agentList[i].isFree === true) {
            agentList[i].isFree = false;

            let agent = agentList[i];
            const url = `http://${agent.host}:${agent.port}/build`;
            const json = { repo: REPO, hash: reqClient.body.hash, command: reqClient.body.command };
            sendPostRequest(url, json);

            RESCLIENT = resClient;
            CURRENTAGENT = agent;

            // resClient = null;
            break;
        }
        else countBusyAgents++;
    }

    if (countBusyAgents === agentList.length) {
        resClient.end(JSON.stringify({ agentFilled: true }));
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

function releaseCurrentAgent(agent) {
    for (let i = 0, length = agentList.length; i < length; i++) {
        if (agentList[i].host === agent.host && agentList[i].port === agent.port) {
            agentList[i].isFree = true;
        }
    }
}

function createNewHTMLFile(req) {
    const htmlDoc = buildHtml(req);
    const newFilePath = path.join(__dirname, `../html/build/${BUILDCODE}.html`)
    fs.writeFile(newFilePath, htmlDoc, (error) => {
        if(error) console.log('fs writefile error\n', error);
        console.log("Асинхронная запись файла завершена.");
    });
}

function buildHtml(req) {
    return `
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
}

function sendPostRequest(url, json) {
    request.post(
        url, {
            json: json
        }, (error, res, body) => {
            if (error) {
                console.log('request ERROR\n', error);
            }
            else {
                console.log(res.statusCode, body);
            }
        })
}