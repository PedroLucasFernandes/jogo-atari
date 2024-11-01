import { Request, Response } from "express";
import { Router } from "express";
import { googleAuthenticate } from "../controllers/authController";
import { auth } from "../middlewares/auth";

const router: Router = Router();

router.post("/validate", auth, async (req: Request, res: Response) => {
    res.status(200).json({ message: "Session is valid", data: req.user });
});

router.post("/google", googleAuthenticate);

export default router;
