import { Router } from "express";
import { body } from "express-validator";
import { register, login, getMe, logout } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate([
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
    body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ]),
  register
);

router.post(
  "/login",
  authLimiter,
  validate([
    body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ]),
  login
);

router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

export default router;
