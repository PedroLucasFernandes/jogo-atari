import * as leaderboardServices from "../services/leaderboardServices";
import { Request, Response } from "express";

export const getAllByQuery = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sortBy } = req.query; // Recebe o parâmetro de query "sortBy"

        if (sortBy !== "total_score" && sortBy !== "total_games_played") {
            res.status(400).json({ message: "Invalid sort parameter. Use 'total_score' or 'total_games_played'." });
            return;
        }

        const leaderboard = await leaderboardServices.getAllByQuery(sortBy as string);
        res.status(200).json({ success: true, data: leaderboard });
    } catch (error: any) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const getUserPosition = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const { sortBy } = req.query;

        if (sortBy !== "total_score" && sortBy !== "total_games_played") {
            res.status(400).json({ message: "Invalid sort parameter. Use 'total_score' or 'total_games_played'." });
            return;
        }

        if (!userId) {
            res.status(400).json({ message: "Parameter userId can not be empty." });
            return;
        }

        const userPosition = await leaderboardServices.getUserPosition(userId, sortBy);
        res.status(200).json({ success: true, data: userPosition });
    } catch (error: any) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const saveOrUpdateUserLeaderboardData = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const { statType } = req.query;

        if (statType !== "total_score" && statType !== "total_games_played") {
            res.status(400).json({ message: "Invalid sort parameter. Use 'total_score' or 'total_games_played'." });
            return;
        }

        // Chama o serviço que irá verificar se o usuário existe e irá salvar ou atualizar
        const result = await leaderboardServices.saveOrUpdateUserLeaderboardData(userId, statType as string);

        // Responde com o resultado adequado
        res.status(201).json({ success: true, message: "User leaderboard position updated", data: result });
    } catch (error) {
        console.error("Error saving or updating leaderboard data:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};