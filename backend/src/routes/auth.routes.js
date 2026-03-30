import { Router } from "express";
import {
  getmeController,
  loginController,
  logoutController,
  registerController,
} from "../controllers/auth.controller.js";
import {
  loginValidator,
  registerValidator,
} from "../validators/auth.validator.js";
import { authUser } from "../middlewares/auth.middleware.js";

const authRouter = Router();

// full routes => /api/auth
authRouter.post("/register", registerValidator, registerController);
authRouter.post("/login", loginValidator, loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/get-me",authUser,getmeController)

export default authRouter;
