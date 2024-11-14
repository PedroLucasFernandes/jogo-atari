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

        if (user) {
            const matchPassword = await comparePassword(password, user.password);

            if (matchPassword) {
                const token = jwt.sign({
                    id: user.id,
                    username: user.username,
                    email: user.email,

                }, SECRET_KEY, {
                    expiresIn: "5d",
                });
                const data = {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }

                return { auth: true, token, user: data };
            }
        }
        return { auth: false, error: "Invalid username and/or password." };
    } catch (error) {
        console.log(error);
        throw new Error("User authentication failed.");
    }
};