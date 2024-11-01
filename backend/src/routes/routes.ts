import { Router } from "express";
import loginRouter from "../routes/loginRoutes"
import logoutRouter from "../routes/logoutRoutes"
import userRouter from "../routes/userRoutes"
import authRoutes from "./authRoutes";


const router = Router();

router.use("/login", loginRouter)
router.use("/auth", authRoutes)
router.use("/logout", logoutRouter)
router.use("/users", userRouter)



export default router;