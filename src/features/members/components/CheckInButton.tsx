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
      className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded 
                 hover:bg-blue-100 active:scale-95 transition-all 
                 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-900/20 dark:text-blue-400"
    >
      {loading ? "LOGGING..." : "CHECK IN"}
    </button>
  );
}