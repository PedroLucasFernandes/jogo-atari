import * as userServices from "../services/userServices";
import { IUser } from "../interfaces/user";
import { IAPIResponse } from "../interfaces/api";
import { Request, Response } from "express";

export const getAllUsers = async (
    req: Request,
    res: Response
): Promise<void> => {
    const response: IAPIResponse<IUser[]> = { success: false };
    try {
        const users: IUser[] = await userServices.getAllUsers();
        response.data = users;
        response.success = true;
        response.message = "Users retrieved successfully";
        res.status(200).json(response);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ data: null, error: "Erro interno do servidor" });
    }
};

export const getUserById = async (
    req: Request,
    res: Response
): Promise<void> => {
    const response: IAPIResponse<IUser> = { success: false };
    try {
        const userId = req.params.userId;

        const user: IUser = await userServices.getUserById(userId);
        response.data = user;
        response.success = true;
        response.message = "User retrieved successfully";
        res.status(200).json(response);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ data: null, error: "Erro interno do servidor" });
    }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const response: IAPIResponse<IUser> = { success: false };
    try {
        const { username, email, password } = req.body;

        const user = await userServices.createUser(
            username,
            email,
            password,
        );
        response.data = user;
        response.success = true;
        response.message = "User successfully registered!";
        res.status(201).json(response);
    } catch (error: any) {
        response.error = error.message;
        response.message = "Falha no registro do usuário!";
        res.status(400).json(response);
    }
};

export const deleteUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    const response: IAPIResponse<IUser> = { success: false };
    try {
        const userId = req.params.userId;
        const user: IUser = await userServices.deleteUser(userId);
        response.data = user;
        response.success = true;
        response.message = "Usuário deletado com sucesso!";
        res.status(200).json(response);
    } catch (error: any) {
        console.error(error);
        response.message = "Não é possível deletar usuário";
        res.status(500).json({ data: null, error: "Internal server erro" });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const response: IAPIResponse<IUser> = { success: false };
    try {
        const userId = req.params.userId;
        const fields: Partial<IUser> = req.body;

        const updatedUser: IUser = await userServices.updateUser(userId, fields);
        response.data = updatedUser;
        response.success = true;
        response.message = "User updated successfully!";
        res.json(response);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Unable to complete the operation" });
    }
};