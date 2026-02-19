// -----------------------------
// Constants & Game State
// -----------------------------
const SIZE = 16;
const TYPES = ["circle", "triangle", "square", "pentagon"];

let board = [];
let selectedA = null; // first selection
let selectedB = null; // second selection
let matches = [];     // array to store matched squares

const gameBoard = document.getElementById("gameBoard");

// -----------------------------
// Initialize Board State
// -----------------------------
for (let r = 0; r < SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < SIZE; c++) {
        board[r][c] = TYPES[Math.floor(Math.random() * TYPES.length)];
    }
}

// -----------------------------
// Render Board Function
// -----------------------------
function renderBoard() {
    gameBoard.innerHTML = "";

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const square = document.createElement("div");
            square.className = "square";
            square.dataset.row = r;
            square.dataset.col = c;

            // Highlight first and second selections
            if (selectedA && selectedA.row === r && selectedA.col === c) {
                square.classList.add("highlighted-first");
            }
            if (selectedB && selectedB.row === r && selectedB.col === c) {
                square.classList.add("highlighted-second");
            }

            // Highlight matches
            if (matches.some(m => m.row === r && m.col === c)) {
                square.classList.add("matched");
            }

            // Add shape image
            const img = document.createElement("img");
            img.className = board[r][c];
            img.src = `./${board[r][c]}.png`;
            img.alt = board[r][c];
            img.draggable = false;
            img.style.pointerEvents = "none";
            square.appendChild(img);

            gameBoard.appendChild(square);
        }
    }
}

// -----------------------------
// Find Matches
// -----------------------------
function findMatches() {
    matches = [];

    // Horizontal
    for (let r = 0; r < SIZE; r++) {
        let count = 1;
        for (let c = 1; c < SIZE; c++) {
            if (board[r][c] === board[r][c - 1]) {
                count++;
            } else {
                if (count >= 4) {
                    for (let k = 0; k < count; k++) {
                        matches.push({ row: r, col: c - 1 - k });
                    }
                }
                count = 1;
            }
        }
        if (count >= 4) {
            for (let k = 0; k < count; k++) {
                matches.push({ row: r, col: SIZE - 1 - k });
            }
        }
    }

    // Vertical
    for (let c = 0; c < SIZE; c++) {
        let count = 1;
        for (let r = 1; r < SIZE; r++) {
            if (board[r][c] === board[r - 1][c]) {
                count++;
            } else {
                if (count >= 4) {
                    for (let k = 0; k < count; k++) {
                        matches.push({ row: r - 1 - k, col: c });
                    }
                }
                count = 1;
            }
        }
        if (count >= 4) {
            for (let k = 0; k < count; k++) {
                matches.push({ row: SIZE - 1 - k, col: c });
            }
        }
    }
}

// -----------------------------
// Collapse Board Function
// -----------------------------
function collapseBoard() {
    for (let c = 0; c < SIZE; c++) {
        for (let r = SIZE - 1; r >= 0; r--) {
            if (matches.some(m => m.row === r && m.col === c)) {
                board[r][c] = null;
            }
        }

        // Drop pieces
        for (let r = SIZE - 1; r >= 0; r--) {
            if (board[r][c] === null) {
                let rAbove = r - 1;
                while (rAbove >= 0 && board[rAbove][c] === null) rAbove--;
                if (rAbove >= 0) {
                    board[r][c] = board[rAbove][c];
                    board[rAbove][c] = null;
                } else {
                    board[r][c] = TYPES[Math.floor(Math.random() * TYPES.length)];
                }
            }
        }
    }
}

// -----------------------------
// Attempt Swap with Match Validation
// -----------------------------
function attemptSwap(a, b) {
    // Swap
    const temp = board[a.row][a.col];
    board[a.row][a.col] = board[b.row][b.col];
    board[b.row][b.col] = temp;

    findMatches();
    if (matches.length === 0) {
        // Swap back if no match
        board[b.row][b.col] = board[a.row][a.col];
        board[a.row][a.col] = temp;
        return false;
    }
    return true;
}

// -----------------------------
// Handle Cascades
// -----------------------------
function processCascades() {
    findMatches();
    if (matches.length > 0) {
        renderBoard();
        setTimeout(() => {
            collapseBoard();
            processCascades();
        }, 200); // small delay for visual effect
    } else {
        renderBoard();
    }
}

// -----------------------------
// Handle Clicks
// -----------------------------
gameBoard.addEventListener("click", function(event) {
    const square = event.target.closest(".square");
    if (!square) return;

    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    // Prevent clicking the same square twice
    if (selectedA && selectedA.row === row && selectedA.col === col) return;

    // --- First Selection ---
    if (!selectedA) {
        selectedA = { row, col };
        selectedB = null;
        renderBoard();
        return;
    }

    // --- Second Selection ---
    if (!selectedB) {
        const row1 = selectedA.row;
        const col1 = selectedA.col;

        // Only allow orthogonal adjacency
        const isContiguous =
            (Math.abs(row1 - row) === 1 && col1 === col) || 
            (Math.abs(col1 - col) === 1 && row1 === row);

        if (isContiguous) {
            selectedB = { row, col };

            if (attemptSwap(selectedA, selectedB)) {
                // Swap successful, handle cascades
                selectedA = null;
                selectedB = null;
                processCascades();
            } else {
                // Invalid swap (no match)
                console.log("Swap did not create match");
                selectedA = null;
                selectedB = null;
                renderBoard();
            }
        } else {
            square.classList.add("invalid-click");
            setTimeout(() => square.classList.remove("invalid-click"), 200);
        }
    }
});

// -----------------------------
// Initial Render
// -----------------------------
renderBoard();
