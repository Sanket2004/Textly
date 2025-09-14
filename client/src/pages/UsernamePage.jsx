import { useState } from 'react'
import useAppStore from '../stores/useStore';

export default function UsernamePage() {
    const { setUserName } = useAppStore();
    const [tempUser, setTempUser] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!tempUser.trim()) return;
        setUserName(tempUser.trim());
    };
    return (
        <section className="min-h-screen">
            <div className="grid grid-cols-1 gap-y-8 md:gap-x-8 md:grid-cols-2 items-center justify-center p-6">
                <div className="space-y-8 w-full max-w-md mx-auto">
                    <div className="space-y-2">
                        <h1 className="font-black text-3xl">Let's Get Started</h1>
                        <p className="text-gray-500">Enter username to get started</p>
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <label htmlFor="username" className="text-sm font-medium">Username</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Enter your username"
                            value={tempUser}
                            onChange={(e) => setTempUser(e.target.value)}
                            className="w-full text-sm p-3 border border-gray-400 rounded-xl outline-0 ring-0"
                        />
                        <button className="bg-black text-white text-sm font-medium p-3.5 rounded-xl mt-4 cursor-pointer" onClick={handleSubmit}>Let's Begin</button>
                    </div>
                </div>
                <div className="bg-black w-full min-h-[calc(100vh-64px)] flex items-end rounded-xl">
                    <div className="p-8 space-y-4">
                        <h1 className="text-white font-black text-3xl">Text Room - sharing made easy</h1>
                        <p className="text-neutral-400">Join now and start text with your friends</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
