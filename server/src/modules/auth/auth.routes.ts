import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.getMe);

// Password reset (public)
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Email change confirm (public — uses token, not JWT)
router.post("/confirm-email-change", authController.confirmEmailChange);

// Account changes (authenticated)
router.post("/change-password", authenticate, authController.changePassword);
router.post("/change-email", authenticate, authController.changeEmail);

export default router;
