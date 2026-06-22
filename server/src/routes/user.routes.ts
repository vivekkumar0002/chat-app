import { Router } from "express";
import { body } from "express-validator";
import { getUsers, getUserById, updateProfile } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.use(authMiddleware); // all user routes require authentication

router.get("/", getUsers); // ?search=term
router.get("/:id", getUserById);
router.patch(
  "/me",
  validate([
    body("name").optional().trim().isLength({ min: 1, max: 100 }),
    body("avatar").optional().isString(),
  ]),
  updateProfile
);

export default router;
