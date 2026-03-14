import {WebSocket, WebSocketServer} from "ws";

/**
 * Send a JSON-encoded payload over a WebSocket if the socket is open.
 * If the socket is not in the `OPEN` state, the function returns without sending.
 * @param {WebSocket} socket - The WebSocket to send the payload on.
 * @param {*} payload - The value to serialize to JSON and send.
 */
function sendJson(socket , payload){
if (socket.readyState != WebSocket.OPEN) return;

socket.send(JSON.stringify(payload));   
}

/**
 * Broadcasts a JSON-serializable payload through the provided WebSocket server when it is open.
 * @param {import('ws').WebSocketServer} wss - The WebSocketServer instance to send the payload from.
 * @param {*} payload - The value to JSON-serialize and send to connected clients.
 */
function broadcast(wss , payload){
if (wss.readyState != WebSocket.OPEN) return;

wss.send(JSON.stringify(payload));    
}

/**
 * Attach a WebSocket server to an existing HTTP server and expose a broadcaster for match creation events.
 *
 * The attached WebSocket server listens on the "/ws" path with a 1 MB max payload and sends a `{ type: "welcome" }`
 * message to clients when they connect.
 * @param {import('http').Server} server - The existing HTTP server to attach the WebSocket server to.
 * @returns {{ broadcastMatchCreated: (match: any) => void }} An object exposing `broadcastMatchCreated(match)`, which broadcasts a `{ type: "match-created", data: match }` message to all connected clients.
 */
export function attachWebSocketServer(server){
    const wss = new WebSocketServer({
        server, 
        payload:"/ws",
        maxPayload:1024*1024
    }); 
    wss.on("connection" , (socket)=>{
        sendJson(socket , {type: "welcome"});
        socket.on("error",console.error);
    });
    function broadcastMatchCreated(match){
        broadcast(wss,{type:"match-created",data:match});
    }
    return{broadcastMatchCreated}

}