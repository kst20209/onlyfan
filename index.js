const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let globalFanState = "정지";
let lastUpdatedBy = "";

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ fanState: globalFanState, updatedBy: lastUpdatedBy }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        globalFanState = data.fanState;
        lastUpdatedBy = data.userName;

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ fanState: globalFanState, updatedBy: lastUpdatedBy }));
            }
        });
    });
});

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
