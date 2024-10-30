import { Router } from "express";
import { googleAuthenticate } from "../controllers/authController";

const router = Router();

router.post("/google", googleAuthenticate);

export default router;
