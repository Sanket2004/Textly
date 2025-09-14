import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: { type: String },
        isPrivate: { type: Boolean, default: false },
        password: { type: String },
        owner: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
)

roomSchema.pre("save", function (next) {
    if (this.isModified("password") && this.password) {
        this.password = bcrypt.hashSync(this.password, 10);
        this.isPrivate = true;
    }
    next();
})

roomSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return true; // No password required
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Room", roomSchema);