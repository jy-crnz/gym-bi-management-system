"use client";

import { useState } from "react";
import { logAttendance } from "../actions";

/**
 * ENGINEERING STANDARD: 
 * Always build Hover, Active, Focus, and Loading states.
 * This component handles the "Event" data for our BI Pulse.
 */
export function CheckInButton({ memberId }: { memberId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);

    // Call the Server Action we defined in actions.ts
    const result = await logAttendance(memberId);

    if (result.error) {
      alert(result.error);
    } else {
      // Logic for a successful check-in
      console.log("Attendance logged:", result.data);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleCheckIn}
      disabled={loading}
      /* 🏛️ FIX: Stripped light mode. Locked to bg-blue-900/20 with a subtle hover boost */
      className="text-[10px] font-bold px-4 py-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-900/20 text-blue-400 hover:bg-blue-900/40"
    >
      {loading ? "LOGGING..." : "CHECK IN"}
    </button>
  );
}