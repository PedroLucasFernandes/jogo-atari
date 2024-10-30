import { Router } from "express";
import * as userController from "../controllers/userController";
import { auth } from "../middlewares/auth";

const router: Router = Router();

router.get("/", auth, userController.getAllUsers);
router.get("/:userId", auth, userController.getUserById);
router.post("/", userController.createUser);
router.put("/:userId", auth, userController.updateUser);
router.delete("/:userId", auth, userController.deleteUser);


export default router;