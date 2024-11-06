import { pool } from "../database/connection";

export const getAllByQuery = async (sortBy: string) => {
    const query = `
        SELECT u.id AS user_id, u.username, l.total_score, l.total_games_played,
               ROW_NUMBER() OVER (ORDER BY l.${sortBy} DESC) AS position
        FROM leaderboard l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.${sortBy} DESC
        LIMIT 10
    `;
    try {
        const { rows } = await pool.query(query);
        return rows.map(row => ({
            user_id: row.user_id,
            username: row.username,
            total_score: row.total_score,
            total_games_played: row.total_games_played,
            position: row.position,
        }));
    } catch (error: any) {
        console.error("Error fetching leaderboard data:", error);
        throw new Error(error);
    }
};

export const getUserPosition = async (userId: string, sortBy: string) => {
    const query = `
        SELECT 
            user_id, 
            ${sortBy},
            ROW_NUMBER() OVER (ORDER BY ${sortBy} DESC) as position
        FROM leaderboard
    `;

    try {
        const { rows } = await pool.query(query);

        // Encontra a posição do usuário específico
        const user = rows.find(row => row.user_id === userId);
        if (!user) {
            throw new Error("User not found in the leaderboard");
        }

        return user;
    } catch (error) {
        console.error("Error fetching user position:", error);
        throw new Error("Database query failed");
    }
};

// Verifica se o usuário já existe
export const getUserById = async (userId: string) => {
    const query = `SELECT * FROM leaderboard WHERE user_id = $1`;
    try {
        const { rows } = await pool.query(query, [userId]);
        return rows[0]; // Retorna o registro do usuário ou undefined se não existir
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw new Error("Database query failed while fetching user by ID."); // Repropaga o erro
    }
};

// Atualiza os dados do usuário no leaderboard
export const updateUserLeaderboardData = async (userId: string, statType: string) => {
    try {
        // Verifica se o statType é 'total_score' ou 'total_games_played'
        if (statType === "total_score") {
            // Se for total_score, atualiza ambos: pontuação e quantidade de jogos jogados
            const query = `
                UPDATE leaderboard 
                SET total_score = total_score + 1, total_games_played = total_games_played + 1 
                WHERE user_id = $1
            `;
            await pool.query(query, [userId]);
        } else if (statType === "total_games_played") {
            // Se for total_games_played, atualiza apenas a quantidade de jogos
            const query = `
                UPDATE leaderboard 
                SET total_games_played = total_games_played + 1 
                WHERE user_id = $1
            `;
            await pool.query(query, [userId]);
        }

        // Seleciona o registro atualizado do leaderboard
        const querySelect = `SELECT user_id, total_score, total_games_played FROM leaderboard WHERE user_id = $1`;
        const { rows } = await pool.query(querySelect, [userId]);

        return rows[0]; // Retorna o registro atualizado
    } catch (error) {
        console.error("Error updating user leaderboard data:", error);
        throw new Error("Database query failed while updating user leaderboard data.");
    }
};

// Cria um novo registro de leaderboard se o usuário não existir
export const createUserLeaderboardData = async (userId: string, statType: string) => {
    try {
        if (statType === "total_score") {
            // Se for total_score, cria com incremento de 1 em total_score e total_games_played
            const query = `INSERT INTO leaderboard (user_id, total_score, total_games_played) VALUES ($1, 1, 1)`;
            const { rows } = await pool.query(query, [userId]);
            return rows[0];
        } else if (statType === "total_games_played") {
            // Se for total_games_played, cria com incremento apenas de total_games_played
            const query = `INSERT INTO leaderboard (user_id, total_score, total_games_played) VALUES ($1, 0, 1)`;
            const { rows } = await pool.query(query, [userId]);
            return rows[0];
        }
    } catch (error) {
        console.error("Error creating user leaderboard data:", error);
        throw new Error("Database query failed while creating user leaderboard data.");
    }
};