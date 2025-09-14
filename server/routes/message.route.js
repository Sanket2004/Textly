import express from "express"
import Message from "../models/message.model.js"


const router = express.Router();

// Get all messages of a room
router.get("/:roomId", async (req, res) => {
    try {
        const messages = await Message.find({ room: req.params.roomId })
            .sort({ createdAt: 1 });

        res.json({ ok: true, messages });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});


export default router