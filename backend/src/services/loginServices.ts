import jwt from "jsonwebtoken"
import { comparePassword } from "../utils/comparePassword"
import { SECRET_KEY } from "../config"
import * as userRepository from "../repositories/userRepository"

export const getUser = async (email: string) => {
    try {
        const user = await userRepository.getUserByEmail(email);
        if (user.length < 0) {
            throw new Error("User not registered.");
        }

        return user[0];
    } catch (error) {
        throw error;
    }
}

export const authenticateUser = async (email: string, password: string) => {
    try {
        const user = await userRepository.getUserByEmail(email);

        if (user && user.length > 0) {
            const matchPassword = await comparePassword(password, user[0].password);

            if (matchPassword) {
                const token = jwt.sign({
                    id: user[0].id,
                    username: user[0].username,
                    email: user[0].email,

                }, SECRET_KEY, {
                    expiresIn: "5d",
                });
                // Vou retornar os dados do usuário direto no login pra apagar aquela rota auth
                return { auth: true, token, user };
            }
        }
        return { auth: false, error: "Invalid username and/or password." };
    } catch (error) {
        console.log(error);
        throw new Error("User authentication failed.");
    }
};