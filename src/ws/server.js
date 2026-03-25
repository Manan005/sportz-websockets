import {WebSocket, WebSocketServer} from 'ws';
import {wsArcjet} from '../arcjet.js';
function sendJson(socket, payload) {
    if(socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
    for (const client of wss.clients)  {
        if(client.readyState !== WebSocket.OPEN) continue;

        client.send(JSON.stringify(payload));
    }
}

export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
    wsArcjet.protect(req, (err) => {
        if (err) {
            socket.destroy(); // Close the socket if protection fails
        } else {
            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit('connection', ws, req);
            });
        }
    });
});

    wss.on('connection', async(socket,req) => {
        if(wsArcjet) {
            try {
                const decision = await  wsArcjet.protect(req);
                if(decision.isDenied()){
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;    
                    const reason = decision.reason.isRateLimit() ? 'Rate limit exceeded':'Access denied';
                    socket.close(code,reason);
                    return;
                    }
            } catch (e) {
               console.log('WS connection error',e);        
               socket.close(1011 , 'Internal Server Error');
               return;
                
            }

        }
        socket.isAlive = true;
        socket.on('pong', () => { socket.isAlive = true; });

        sendJson(socket, { type: 'welcome' });

        socket.on('error', console.error);
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        })}, 30000);

    wss.on('close', () => clearInterval(interval));

    function broadcastMatchCreated(match) {
        broadcast(wss, { type: 'match_created', data: match });
    }

    return { broadcastMatchCreated }
}