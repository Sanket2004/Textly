import React, { useState } from "react";
import useAppStore from "../stores/useStore";
import { useNavigate } from "react-router-dom";

export default function CreateRoomModal({ isOpen, onClose }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [password, setPassword] = useState("");
    const { loading, createRoom } = useAppStore();
    const [isPrivate, setIsPrivate] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await createRoom({ name, description, password: isPrivate ? password : undefined });

        if (res.ok) {
            // Clear state
            setName("");
            setDescription("");
            setPassword("");
            setIsPrivate(false);

            // Close the modal
            onClose();

            // Navigate to the newly created room
            navigate(`/room/${res.room._id}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Create a Room</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Room Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-xl px-3 py-2 mt-1"
                            placeholder="Enter a room name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border rounded-xl px-3 py-2 mt-1"
                            placeholder="Enter a description ( optional )"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="private-checkbox"
                            checked={isPrivate}
                            onChange={() => setIsPrivate(!isPrivate)}
                        />
                        <label htmlFor="private-checkbox" className="text-sm">Make Private</label>
                    </div>

                    {isPrivate && (
                        <div>
                            <label className="block text-sm font-medium">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border rounded-xl px-3 py-2 mt-1"
                                required
                            />
                        </div>
                    )}

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => {
                                // Clear fields and close modal on cancel
                                setName("");
                                setDescription("");
                                setPassword("");
                                setIsPrivate(false);
                                onClose();
                            }}
                            className="px-4 py-2 rounded-xl bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-sky-500 text-white"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
