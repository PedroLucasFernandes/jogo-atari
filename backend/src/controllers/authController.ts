import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/userRepository";
import { SECRET_KEY } from "../config";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthenticate = async (req: Request, res: Response) => {
    const { token } = req.body;

    try {
        // Verifica o token com Google
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

        // Verifica se o usuário já existe no banco
        let user = await userRepository.getUserByEmail(email);

        // Se o usuário não existir, cria um novo
        if (!user) {
            user = await userRepository.createUser(name, email, null, "google", sub);
        }

        // Cria um token JWT
        const jwtToken = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            SECRET_KEY,
            { expiresIn: "5d" }
        );

        res.status(200).json({ auth: true, token: jwtToken, user });
    } catch (error) {
        console.error("Erro na autenticação com Google:", error);
        res.status(500).json({ error: "Failed to authenticate with Google" });
    }
};
