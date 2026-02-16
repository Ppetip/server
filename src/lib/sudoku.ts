export const isValidSudoku = (board: string[]): boolean => {
    // Check rows, cols, 3x3
    const rows = Array.from({ length: 9 }, () => new Set<string>());
    const cols = Array.from({ length: 9 }, () => new Set<string>());
    const boxes = Array.from({ length: 9 }, () => new Set<string>());

    for (let i = 0; i < 81; i++) {
        const val = board[i];
        if (val === "" || val === ".") continue;

        const row = Math.floor(i / 9);
        const col = i % 9;
        const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);

        if (rows[row].has(val) || cols[col].has(val) || boxes[box].has(val)) {
            return false;
        }

        rows[row].add(val);
        cols[col].add(val);
        boxes[box].add(val);
    }
    return true;
};

export const getConflicts = (board: string[]): number[] => {
    const conflicts = new Set<number>();
    const rows = Array.from({ length: 9 }, () => new Map<string, number[]>());
    const cols = Array.from({ length: 9 }, () => new Map<string, number[]>());
    const boxes = Array.from({ length: 9 }, () => new Map<string, number[]>());

    for (let i = 0; i < 81; i++) {
        const val = board[i];
        if (val === "" || val === ".") continue;

        const row = Math.floor(i / 9);
        const col = i % 9;
        const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);

        // Row check
        if (rows[row].has(val)) {
            conflicts.add(i);
            rows[row].get(val)?.forEach((idx) => conflicts.add(idx));
        } else {
            rows[row].set(val, [i]);
        }

        // Col check
        if (cols[col].has(val)) {
            conflicts.add(i);
            cols[col].get(val)?.forEach((idx) => conflicts.add(idx));
        } else {
            cols[col].set(val, [i]);
        }

        // Box check
        if (boxes[box].has(val)) {
            conflicts.add(i);
            boxes[box].get(val)?.forEach((idx) => conflicts.add(idx));
        } else {
            boxes[box].set(val, [i]);
        }
    }
    return Array.from(conflicts);
};

export const sudokuToString = (board: string[]): string => {
    return board.map(c => c === "" ? "." : c).join("");
};

export const stringToSudoku = (str: string): string[] => {
    return str.split("").map(c => c === "." ? "" : c);
};


export const solveSudoku = (board: string[]): string[] | null => {
    const solved = [...board];
    if (solveHelper(solved)) return solved;
    return null;
};

const solveHelper = (board: string[]): boolean => {
    const emptyIdx = board.indexOf("");
    if (emptyIdx === -1) return true; // Solved

    const row = Math.floor(emptyIdx / 9);
    const col = emptyIdx % 9;

    for (let num = 1; num <= 9; num++) {
        const char = num.toString();
        if (isValidMove(board, row, col, char)) {
            board[emptyIdx] = char;
            if (solveHelper(board)) return true;
            board[emptyIdx] = ""; // Backtrack
        }
    }
    return false;
};

const isValidMove = (board: string[], row: number, col: number, char: string): boolean => {
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 9; i++) {
        if (board[row * 9 + i] === char) return false; // Row
        if (board[i * 9 + col] === char) return false; // Col

        // Box
        const r = boxRow + Math.floor(i / 3);
        const c = boxCol + (i % 3);
        if (board[r * 9 + c] === char) return false;
    }
    return true;
};

export const isSolvable = (board: string[]): boolean => {
    // Quick pre-check
    if (!isValidSudoku(board)) return false;
    // Clone to avoid mutation
    return solveSudoku([...board]) !== null;
};


export const normalizeGrid = (board: string[]): string => {
    // For the "Sudoku Hunt", we treat the exact 81-char string as the unique identifier.
    // Rotations are considered "different" puzzles to allow more volume.
    return board.map(c => c === "" || c === "." ? "." : c).join("");
};

export const generateSudokuHash = async (gridString: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(gridString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();

    // Format: 418392-ABCD-XV92 (Mocking the ID part with the first few chars of hash for now)
    // In real backend, ID comes from DB. Here we return the raw SHA part for verification.
    return hashHex;
};

export const formatHash = (id: number, shaHash: string): string => {
    // Format: ID - First 4 of Hash - Last 4 of Hash
    const part1 = shaHash.substring(0, 4);
    const part2 = shaHash.substring(shaHash.length - 4);
    return `${id}-${part1}-${part2}`;
};
