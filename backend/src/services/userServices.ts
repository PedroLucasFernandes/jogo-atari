
import * as userRepository from "../repositories/userRepository";
import { IUser } from "../interfaces/user";
import {
    validateEmail,
    validatePassword
} from "../utils/validation";
import { hashPassword } from "../utils/hashPassword";


export const getAllUsers = async (): Promise<IUser[]> => {
    try {
        const users = await userRepository.getAllUsers();
        return users;
    } catch (error) {
        throw error;
    }
};


export const getUserById = async (userId: string) => {
    try {
        if (!userId) {
            throw new Error("User not registered")
        }
        const user = await userRepository.getUserById(userId);
        return user;
    } catch (error) {
        throw error;
    }
};

export const createUser = async (
    username: string,
    email: string,
    password: string,
) => {
    try {
        if (!username) {
            throw new Error("The username cannot be empty.");
        }

        if (!email) {
            throw new Error("Email cannot be empty.");
        }

        if (!validateEmail(email)) {
            throw new Error("Invalid email format. (example@example.com) ");
        }

        if (!password) {
            throw new Error("Password cannot be empty.");
        }

        const existingUser = await userRepository.getUserByUsername(username);
        if (existingUser.length > 0) {
            throw new Error("Username already registered!");
        }

        const existingEmail = await userRepository.getUserByEmail(email);
        if (existingEmail) {
            throw new Error("Email already registered.");
        }

        const hashedPassword = await hashPassword(password);

        if (!hashedPassword) {
            throw new Error("Error generating password hash.");
        }

        const user = await userRepository.createUser(
            username,
            email,
            hashedPassword,
        );
        return user;
    } catch (error: any) {
        throw error;
    }
};


export const deleteUser = async (userId: string): Promise<IUser> => {
    try {

        const currentUser: IUser | null = await userRepository.getUserById(userId);

        if (!currentUser) {
            throw new Error("User not registered");
        }

        const user = await userRepository.deleteUserById(userId);
        return user;
    } catch (error) {
        throw error;
    }
};

export const updateUser = async (userId: string, fields: Partial<IUser>): Promise<IUser> => {
    try {
        const currentUser: IUser | null = await userRepository.getUserById(userId);

        if (!currentUser) {
            throw new Error("User not registered");
        }

        const newUser: IUser = {
            username: fields.username || currentUser.username,
            email: fields.email || currentUser.email,
            password: fields.password || currentUser.password,
            id: currentUser.id,
        };

        const updatedUser = await userRepository.updateUser(userId, newUser);
        return updatedUser;
    } catch (error: any) {
        throw new Error(`Failed to update user data: ${error.message}`);
    }
};
