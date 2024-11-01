import { Router } from "express";
import loginRouter from "../routes/loginRoutes"
import logoutRouter from "../routes/logoutRoutes"
import userRouter from "../routes/userRoutes"
import authGoogle from "../routes/authGoogle"
import gameRouter from "../routes/gameRoutes"


const router = Router();

router.use("/login", loginRouter)
router.use("/auth", authGoogle)
router.use("/logout", logoutRouter)
router.use("/users", userRouter)
router.use("/game", gameRouter)



export default router;