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
      console.log("Attendance logged:", result.name);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleCheckIn}
      disabled={loading}
      /* * 🏛️ ARCHITECTURE UPDATE (Responsive Fix): 
       * 1. w-full: Forces the button to fill the flex container, eliminating dead space.
       * 2. py-2.5: Increases the touch target height for better 'gym floor' usability.
       * 3. focus:ring: Added focus indicators for accessibility compliance.
       */
      className="w-full text-[10px] font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40 uppercase tracking-widest"
    >
      {loading ? "LOGGING..." : "CHECK IN"}
    </button>
  );
}