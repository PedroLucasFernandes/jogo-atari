
import { Router } from "express";
import { authenticate } from "../controllers/loginController";

const router: Router = Router();

router.post("/", authenticate);

export default router;
