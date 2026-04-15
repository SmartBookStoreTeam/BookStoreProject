import express from "express";
import { chatbotMessage } from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/message", chatbotMessage);

export default router;
