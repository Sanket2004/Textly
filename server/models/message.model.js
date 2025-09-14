import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        sender: {
            type: String,
            required: true,
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true
        },
    },
    {
        timestamps: true,
    }
)

messageSchema.index({ createdAt: -1 })

export default mongoose.model("Message", messageSchema);