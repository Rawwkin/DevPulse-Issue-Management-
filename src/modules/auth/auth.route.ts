import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/signup", authController.registerUSer);
router.post("/login", authController.loginUSer)


export const authRoute = router;