import dotenv from "dotenv";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/routes";
import cors from 'cors';
import { initializeWebSocket } from './websocket/webSocketConfig';

dotenv.config();

const PORT = process.env.PORT;
const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api", routes);

const server = app.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`);
});

// Iniciar o WebSocket
initializeWebSocket(server);
