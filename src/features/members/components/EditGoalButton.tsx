"use client";

import { useState } from "react";
import { Settings2, Check, X } from "lucide-react";
import { updateRevenueGoal } from "../actions";

export function EditGoalButton({ currentGoal }: { currentGoal: number }) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(currentGoal.toString());

    const handleSave = async () => {
        await updateRevenueGoal(Number(value));
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-24 px-2 py-1 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 border-none rounded outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                />
                <button onClick={handleSave} className="text-emerald-500 hover:scale-110 transition-transform">
                    <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setIsEditing(false)} className="text-zinc-400">
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-zinc-600"
        >
            <Settings2 className="w-3.5 h-3.5" />
        </button>
    );
}