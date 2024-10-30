import { pool } from "../database/connection";
import { IUser } from "../interfaces/user";

export const getAllUsers = async (): Promise<IUser[]> => {
    try {
        const { rows } = await pool.query(`
          SELECT 
            id, 
            username, 
            email
          FROM users
        `);
        return rows;
    } catch (error: any) {
        console.log(error);
        throw new Error("Error fetching users");
    }
};

export const createUser = async (
    username: string,
    email: string,
    password: string,
) => {
    const query =
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email";
    try {
        const result = await pool.query(query, [
            username,
            email,
            password,
        ]);
        return result.rows[0];
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user.");
    }
};

export const getUserByEmail = async (email: string) => {
    const query = "SELECT * FROM users WHERE email=$1";
    try {
        const result = await pool.query(query, [email]);
        return result.rows;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to locate the user by email.");
    }
};

export const getUserByUsername = async (username: string) => {
    const query = "SELECT * FROM users WHERE username=$1";
    try {
        const result = await pool.query(query, [username]);
        return result.rows;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to locate the user by username.");
    }
};

export const getUserById = async (userId: string): Promise<IUser> => {
    try {
        const result = await pool.query(`
        SELECT 
          id, 
          username, 
          email
        FROM users WHERE id = $1
      `, [userId]);

        if (result.rows.length === 0) {
            throw new Error(`User with ID ${userId} not found.`);
        }
        return result.rows[0] as IUser;
    } catch (error) {
        console.error("Error while fetching user by ID:", error);
        throw new Error("Failed to retrieve user by ID.");
    }
};

export const updateUser = async (userId: string, updatedUser: IUser): Promise<IUser> => {
    try {
        const { username, email } = updatedUser;
        const query = `
        UPDATE users 
        SET 
          username = $1, 
          email = $2
        WHERE id = $3
        RETURNING *
      `;
        const result = await pool.query(query, [username, email, userId]);

        if (result.rows.length === 0) {
            throw new Error(`Failed to update user with ID ${userId}.`);
        }

        return result.rows[0] as IUser;
    } catch (error) {
        console.error("Error while updating user:", error);
        throw new Error("Failed to update user.");
    }
};

export const deleteUserById = async (userId: string): Promise<IUser> => {
    try {
        const userResult = await pool.query(`
        SELECT 
          id, 
          username, 
          email 
        FROM users WHERE id = $1
      `, [userId]);

        if (userResult.rows.length === 0) {
            throw new Error(`User with ID ${userId} not found.`);
        }

        const user = userResult.rows[0] as IUser;

        const deleteResult = await pool.query(`
        DELETE FROM users WHERE id = $1
      `, [userId]);

        if (deleteResult.rowCount === 0) {
            throw new Error(`Failed to delete user with ID ${userId}.`);
        }

        return user;
    } catch (error) {
        console.error("Error while deleting user by ID:", error);
        throw new Error("Failed to delete user by ID.");
    }
};