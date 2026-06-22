import { Router } from "express";
import { body } from "express-validator";
import { getMessages, createMessage } from "../controllers/message.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/:conversationId", getMessages);
router.post(
  "/",
  validate([
    body("conversationId").notEmpty().withMessage("conversationId is required"),
    body("content").trim().notEmpty().withMessage("content is required"),
  ]),
  createMessage
);

export default router;
