const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let globalFanState = "정지";
let lastUpdatedBy = "";

const ipRequestTimes = {};

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;

    ws.send(JSON.stringify({ fanState: globalFanState, updatedBy: lastUpdatedBy }));

    ws.on('message', (message) => {
        const now = Date.now();

        if (ipRequestTimes[ip] && (now - ipRequestTimes[ip] < 100)) {
            ws.send(JSON.stringify({ error: '너무 잦은 요청' }));
            return;
        }

        ipRequestTimes[ip] = now;

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
