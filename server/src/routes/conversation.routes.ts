import { Router } from "express";
import { body } from "express-validator";
import {
  getConversations,
  createConversation,
  getConversationById,
  markConversationRead,
} from "../controllers/conversation.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getConversations);
router.post(
  "/",
  validate([body("userId").notEmpty().withMessage("userId is required")]),
  createConversation
);
router.get("/:id", getConversationById);
router.post("/:id/read", markConversationRead);

export default router;
