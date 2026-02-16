"use client";

import { useEffect, useState, useRef } from "react";
import { getConflicts } from "@/lib/sudoku";
import { clsx } from "clsx";

interface SudokuGridProps {
    grid: string[];
    onChange: (grid: string[]) => void;
    readOnly?: boolean;
    isValid?: boolean;
}

export default function SudokuGrid({ grid, onChange, readOnly = false, isValid = true }: SudokuGridProps) {
    // We calculate conflicts on the fly based on the passed grid
    const [conflicts, setConflicts] = useState<number[]>([]);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const newConflicts = getConflicts(grid);
        setConflicts(newConflicts);
    }, [grid]);

    const handleChange = (index: number, value: string) => {
        if (readOnly) return;
        const val = value.slice(-1); // Only take last char
        if (!/^[1-9]$/.test(val) && val !== "") return;

        const newGrid = [...grid];
        newGrid[index] = val;
        onChange(newGrid);
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (readOnly) return;

        // Arrow keys navigation
        let nextIndex = index;
        if (e.key === "ArrowRight") nextIndex = index + 1;
        if (e.key === "ArrowLeft") nextIndex = index - 1;
        if (e.key === "ArrowDown") nextIndex = index + 9;
        if (e.key === "ArrowUp") nextIndex = index - 9;

        // Backspace / Delete
        if (e.key === "Backspace" || e.key === "Delete") {
            handleChange(index, "");
            return;
        }

        if (nextIndex >= 0 && nextIndex < 81 && nextIndex !== index) {
            e.preventDefault();
            inputsRef.current[nextIndex]?.focus();
        }
    };

    return (
        <div className={clsx(
            "grid grid-cols-9 gap-[1px] bg-[#00d4ff] border-2 border-[#00d4ff] p-[1px] w-fit mx-auto",
            !isValid && "border-red-500"
        )}>
            {grid.map((cell, i) => (
                <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={cell}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className={clsx(
                        "w-10 h-10 text-center text-lg font-bold outline-none transition-all",
                        "bg-[#0f2023] text-white focus:bg-[#00d4ff]/20",
                        // 3x3 Borders logic handled by grid gap + background, but we can enable specific borders if needed.
                        // For Stitch look, the gap check is sufficient if background is 'grid-line' color.
                        // Conflicts
                        conflicts.includes(i) && "bg-red-500/20 text-red-400 font-black",
                        readOnly && "cursor-not-allowed opacity-50"
                    )}
                    disabled={readOnly}
                />
            ))}
        </div>
    );
}
