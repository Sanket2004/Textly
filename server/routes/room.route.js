import express from "express";
import Room from "../models/room.model.js";

const router = express.Router();

// Get all public rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find()
            .select('-password')
            .sort({ createdAt: -1 });
        res.json({ ok: true, rooms });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// create room
router.post("/create", async (req, res) => {

    const { name, description, password, owner } = req.body;

    if (req.body === undefined) {
        return res.status(400).json({ ok: false, message: "Bad request" });
    }

    if (!name) {
        return res.status(400).json({ ok: false, message: "Room name is required" });
    }

    if (!owner) {
        return res.status(400).json({ ok: false, message: "Room owner is required" });
    }

    try {
        const room = await Room.create({
            name,
            description,
            password,
            owner
        })

        delete room.password

        return res.status(200).json({ ok: true, room })


    } catch (error) {
        console.log(error)
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
})


// join room
router.post("/:id/join", async (req, res) => {

    try {
        const { password } = req.body;
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ ok: false, message: "Room not found" });
        }

        if (room.isPrivate) {
            const isPasswordValid = await room.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({ ok: false, message: "Invalid password" });
            }
        }

        const roomResponse = room.toObject();
        delete roomResponse.password;

        return res.status(200).json({ ok: true, room: roomResponse })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
})

export default router