import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/userRepository";
import { SECRET_KEY } from "../config";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthenticate = async (req: Request, res: Response) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID as string, // Força a tipagem aqui
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.name || !payload.sub) {
            res.status(401).json({ error: "Invalid token or missing information" });
            return;
        }

        const { sub, email, name } = payload;

        let user = await userRepository.getUserByEmail(email);

        if (!user) {
            user = await userRepository.createUser(name, email, null, "google", sub);
        }

        const jwtToken = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            SECRET_KEY,
            { expiresIn: "5d" }
        );


        const maxAge = 10 * 24 * 60 * 60 * 1000; // 10 dias em milissegundos
        res.cookie("session_id", jwtToken, { maxAge, httpOnly: true });

        res.status(200).json({ auth: true, data: req.user, message: "User successfully authenticated with Google!" });
    } catch (error) {
        console.error("Erro na autenticação com Google:", error);
        res.status(500).json({ error: "Failed to authenticate with Google" });
    }
};
