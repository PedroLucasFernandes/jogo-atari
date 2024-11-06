import { Router } from "express";
import { auth } from "../middlewares/auth";
import * as leaderboardController from "../controllers/leaderboardController"

const router: Router = Router();


router.get("/", leaderboardController.getAllByQuery)
// Exemplo de uso: :
// Para buscar pelo total de pontos: GET /leaderboard?sortBy=total_score
// Para buscar pelo total de partidas jogadas: GET /leaderboard?sortBy=total_games_played

router.get("/:userId", leaderboardController.getUserPosition)
// Exemplo de uso: :
// Para buscar pelo total de pontos: GET /leaderboard/idDoUsuarioAqui?sortBy=total_score
// Para buscar pelo total de partidas jogadas: GET /leaderboard/idDoUsuarioAqui?sortBy=total_games_played

router.put("/:userId", leaderboardController.saveOrUpdateUserLeaderboardData);
// Tanto pra criar quanto pra atualizar é a mesma rota /leaderboard/idDoUsuarioAqui?sortBy=total_games_played


export default router;
