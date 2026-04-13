"use client";

import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isToday,
    startOfWeek,
    endOfWeek
} from "date-fns";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { useState } from "react";

interface AttendanceCalendarProps {
    attendance: { checkIn: string }[];
}

export function AttendanceCalendar({ attendance }: AttendanceCalendarProps) {
    // 1. STATE: Manage which month is currently being viewed
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // 2. LOGIC: Calculate the grid boundaries
    // We include start/end of week to ensure the calendar is a perfect grid (padding)
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
    });

    // 3. OPTIMIZATION: Use a Set for O(1) lookups during the map loop
    const visitedDates = new Set(
        attendance.map(log => format(new Date(log.checkIn), 'yyyy-MM-dd'))
    );

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">

            {/* --- HEADER: MONTH NAVIGATION --- */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-tighter text-slate-900 dark:text-white">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-all active:scale-90"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-all active:scale-90"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* --- WEEKDAY LABELS --- */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <span key={i} className="text-[10px] font-black text-zinc-400 text-center uppercase tracking-widest">
                        {day}
                    </span>
                ))}
            </div>

            {/* --- THE CALENDAR GRID --- */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const hasVisited = visitedDates.has(dateStr);
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

                    return (
                        <div
                            key={i}
                            className={`
                                relative aspect-square flex items-center justify-center text-[10px] font-bold rounded-lg transition-all duration-300
                                ${!isCurrentMonth ? 'opacity-10 scale-90' : 'opacity-100'}
                                ${hasVisited
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 z-10'
                                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600'
                                }
                                ${isToday(day) && !hasVisited ? 'ring-1 ring-blue-500 text-blue-500' : ''}
                            `}
                        >
                            {format(day, 'd')}

                            {/* --- INDICATOR: VISUAL REWARD DOT --- */}
                            {hasVisited && (
                                <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full opacity-60" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* --- SUMMARY: BI DATA STORY --- */}
            <div className="mt-6 flex flex-col items-center gap-1">
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest text-center italic">
                    {visitedDates.size} workouts tracked in your history
                </p>
                {/* Motivation Badge */}
                {visitedDates.size >= 12 && (
                    <span className="text-[8px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full uppercase">
                        Elite Consistency
                    </span>
                )}
            </div>
        </div>
    );
}