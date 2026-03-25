import express from "express";
import { matchRouter } from "./routes/matches.js";
import http from "http";
import { attachWebSocketServer } from "./ws/server.js";
import {securityMiddleware} from "./arcjet.js";

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0" ;
const app = express();

// JSON middleware
app.use(express.json());

const server = http.createServer(app);
// Root GET route
app.get("/", (req, res) => {
  res.send("Hello from express");
});

app.use(securityMiddleware());


app.use("/matches", matchRouter);

const {broadcastMatchCreated} = attachWebSocketServer(server);
// Start server
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT,HOST,()=>{
  const baseUrl = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server running on ${baseUrl}`);
  console.log(`Websocket Server is running on ${baseUrl.replace("http", "ws")}/ws`);
});


