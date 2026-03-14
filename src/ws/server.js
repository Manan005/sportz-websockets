import {WebSocket, WebSocketServer} from "ws";

function sendJson(socket , payload){
if (socket.readyState != WebSocket.OPEN) return;

socket.send(JSON.stringify(payload));   
}

function broadcast(wss , payload){
if (wss.readyState != WebSocket.OPEN) return;

wss.send(JSON.stringify(payload));    
}

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