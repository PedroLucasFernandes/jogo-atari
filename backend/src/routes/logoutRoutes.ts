
import { Router } from "express";
import { logout } from "../controllers/loginController";

const router: Router = Router();

router.post("/", logout);

export default router;
