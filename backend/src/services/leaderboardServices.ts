import * as leaderboardRepository from "../repositories/leaderBoardRepository";

export const getAllByQuery = async (sortBy: string) => {
    try {
        const results = await leaderboardRepository.getAllByQuery(sortBy as string);
        return results;
    } catch (error) {
        throw error;
    }
};

export const getUserPosition = async (userId: string, sortBy: string) => {
    try {
        const results = await leaderboardRepository.getUserPosition(userId, sortBy);
        return results;
    } catch (error) {
        throw error;
    }
};

export const incrementUserStat = async (userId: string, statType: string) => {
    try {
        if (statType === "total_score") {
            const results = await leaderboardRepository.incrementPoints(userId);
            return results;
        } else if (statType === "total_games_played") {
            const results = await leaderboardRepository.incrementPlayedGames(userId);
            return results;
        }
    } catch (error) {
        throw error;
    }
};

export const saveOrUpdateUserLeaderboardData = async (userId: string, sortBy: string) => {
    try {
        // Verifica se o registro do usuário já existe
        const existingRecord = await leaderboardRepository.getUserById(userId);

        if (existingRecord) {
            // Se o registro existe, atualiza
            const userData = await leaderboardRepository.updateUserLeaderboardData(userId, sortBy);
            return userData;
        } else {
            // Se não existe, cria um novo registro
            const userData = await leaderboardRepository.createUserLeaderboardData(userId, sortBy);
            return userData;
        }
    } catch (error) {
        throw error; // Repropaga o erro para o controller tratar
    }
};