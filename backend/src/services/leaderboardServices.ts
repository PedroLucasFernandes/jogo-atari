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

export const saveOrUpdateUserLeaderboardData = async (userId: string, statType: string) => {
    try {
        // Verifica se o registro do usuário já existe
        const existingRecord = await leaderboardRepository.getUserById(userId);

        if (existingRecord) {
            // Se o registro existe, atualiza
            const userData = await leaderboardRepository.updateUserLeaderboardData(userId, statType);
            return userData;
        } else {
            // Se não existe, cria um novo registro
            const userData = await leaderboardRepository.createUserLeaderboardData(userId, statType);
            return userData;
        }
    } catch (error) {
        throw error; // Repropaga o erro para o controller tratar
    }
};