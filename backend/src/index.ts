import dotenv from "dotenv";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/routes";
import cors from 'cors';
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import createGame from "./services/game";
import { IGame, IGameMessage, IGameState } from "./interfaces/game";
import WebSocketService from "./services/webSocketServices";

dotenv.config();

const PORT = process.env.PORT;
const app: Express = express();

const corsOptions = {
	origin: "http://localhost:3000",
	credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/api", routes);

const server = app.listen(PORT, () => {
	console.log(`Server running on: http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });
const webSocketService = new WebSocketService(wss);
export default { getClient: webSocketService.getClient.bind(webSocketService) };
