// State management
const state = {
    grid: Array(9).fill(null).map(() => Array(9).fill(0)),
    domains: Array(9).fill(null).map(() => Array(9).fill(null).map(() => [1,2,3,4,5,6,7,8,9])),
    fixedCells: Array(9).fill(null).map(() => Array(9).fill(false)),
    selectedCell: null,
    steps: 0,
    speed: 500,
    solving: false
};

const puzzleLibrary = {
    beginner: [[5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],[8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],[0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]],
    intermediate: [[0,0,0,2,6,0,7,0,1],[6,8,0,0,7,0,0,9,0],[1,9,0,0,0,4,5,0,0],[8,2,0,1,0,0,0,4,0],[0,0,4,6,0,2,9,0,0],[0,5,0,0,0,3,0,2,8],[0,0,9,3,0,0,0,7,4],[0,4,0,0,5,0,0,3,6],[7,0,3,0,1,8,0,0,0]],
    advanced: [[0,2,0,6,0,8,0,0,0],[5,8,0,0,0,9,7,0,0],[0,0,0,0,4,0,0,0,0],[3,7,0,0,0,0,5,0,0],[6,0,0,0,0,0,0,0,4],[0,0,8,0,0,0,0,1,3],[0,0,0,0,2,0,0,0,0],[0,0,9,8,0,0,0,3,6],[0,0,0,3,0,6,0,9,0]],
    expert: [[0,0,0,0,0,5,0,0,0],[0,0,0,1,0,9,0,0,3],[0,0,0,0,0,0,0,0,0],[1,9,0,0,0,0,6,0,0],[0,0,8,0,2,0,3,0,0],[0,0,2,0,0,0,0,8,4],[0,0,0,0,0,0,0,0,0],[3,0,0,5,0,1,0,0,0],[0,0,0,0,9,0,0,0,0]],
    extreme: [[8,0,0,0,0,0,0,0,0],[0,0,3,6,0,0,0,0,0],[0,7,0,0,9,0,2,0,0],[0,5,0,0,0,7,0,0,0],[0,0,0,0,4,5,7,0,0],[0,0,0,1,0,0,0,3,0],[0,0,1,0,0,0,0,6,8],[0,0,8,5,0,0,0,1,0],[0,9,0,0,0,0,4,0,0]]
};

// Initialize grid
function buildGrid() {
    const grid = document.getElementById('puzzleGrid');
    grid.innerHTML = '';
    
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            if (state.fixedCells[r][c]) {
                cell.classList.add('fixed-cell');
                cell.textContent = state.grid[r][c];
            } else {
                cell.contentEditable = true;
                cell.textContent = state.grid[r][c] || '';
                
                cell.addEventListener('input', (e) => {
                    handleInput(r, c, e.target.textContent);
                });
                
                cell.addEventListener('click', () => {
                    selectCell(r, c);
                });
            }
            
            grid.appendChild(cell);
        }
    }
}

function selectCell(r, c) {
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('active-cell');
    });
    
    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    cell.classList.add('active-cell');
    state.selectedCell = {r, c};
    
    updateDomainDisplay(r, c);
}

function updateDomainDisplay(r, c) {
    const container = document.getElementById('domainValues');
    const possibleVals = computeValidDomain(r, c);
    
    container.innerHTML = '';
    possibleVals.forEach(val => {
        const badge = document.createElement('span');
        badge.className = 'domain-value';
        badge.textContent = val;
        container.appendChild(badge);
    });
    if (possibleVals.length === 0 && state.grid[r][c] === 0) {
        container.innerHTML = '<span style="color: #c62828;">No possible values left!</span>';
    }
    if (state.grid[r][c] !== 0) {
        container.innerHTML = `<span class="domain-value" style="border-color: #52c41a; color: #52c41a;">Assigned: ${state.grid[r][c]}</span>`;
    }
}

function handleInput(r, c, val) {
    const num = parseInt(val);
    const cellElement = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);

    if (num >= 1 && num <= 9) {
        state.grid[r][c] = num;
        cellElement.classList.remove('error-cell');
    } else {
        state.grid[r][c] = 0;
        // Optionally clear text content if invalid input, but keep current logic for single digit focus
        // cellElement.textContent = ''; 
    }
    cellElement.textContent = state.grid[r][c] || '';
    
    updateConstraints();
    refreshDisplay();
}

function checkClash(r, c, val, tempGrid) {
    // Check row and column
    for (let i = 0; i < 9; i++) {
        if (i !== c && tempGrid[r][i] === val) return true; // Row clash
        if (i !== r && tempGrid[i][c] === val) return true; // Column clash
    }

    // Check 3x3 box
    const startRow = Math.floor(r / 3) * 3;
    const startCol = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const curR = startRow + i;
            const curC = startCol + j;
            if (curR !== r || curC !== c) {
                if (tempGrid[curR][curC] === val) return true; // Box clash
            }
        }
    }
    return false;
}

function computeValidDomain(r, c) {
    if (state.grid[r][c] !== 0) return [];
    
    const valid = [];
    for (let n = 1; n <= 9; n++) {
        // Temporarily assign 'n' to check if it causes a clash with existing fixed numbers
        state.grid[r][c] = n; 
        if (!checkClash(r, c, n, state.grid)) {
            valid.push(n);
        }
    }
    state.grid[r][c] = 0; // Reset
    
    return valid;
}

function updateConstraints() {
    // This function is for user-mode: it recalculates domains but doesn't strictly update state.domains
    // in the same way AC-3 does, as Sudoku's constraints are naturally enforced.
    // However, it's used to update the domain display on cell click.
}

function loadPuzzle(difficulty) {
    const puzzle = puzzleLibrary[difficulty];
    if (!puzzle) return;
    
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            state.grid[r][c] = puzzle[r][c];
            state.fixedCells[r][c] = puzzle[r][c] !== 0;
            // Reset domains to full for the solver to start fresh
            state.domains[r][c] = [1,2,3,4,5,6,7,8,9];
        }
    }
    
    updateConstraints(); // This currently does little in this implementation but should be called
    buildGrid();
    logActivity('Puzzle loaded', 'propagation');
    updateStats();
}

function initializeCustomPuzzle() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            state.grid[r][c] = 0;
            state.fixedCells[r][c] = false;
            state.domains[r][c] = [1,2,3,4,5,6,7,8,9];
        }
    }
    buildGrid();
    logActivity('Custom puzzle mode activated (enter values and run solver)', 'propagation');
    updateStats();
}

// --- Solver Logic (Simplified AC-3 as requested by the original code structure) ---

async function executeSolver() {
    if (state.solving) return;
    state.solving = true;
    state.steps = 0;
    
    // Reset any non-fixed cells
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (!state.fixedCells[r][c]) {
                state.grid[r][c] = 0;
            }
            state.domains[r][c] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        }
    }
    
    // Initialize domains based on fixed cells
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (state.grid[r][c] !== 0) {
                 // For fixed cells, the domain is just the value
                state.domains[r][c] = [state.grid[r][c]]; 
            } else {
                 // For empty cells, initialize domain based on current grid state
                 state.domains[r][c] = computeValidDomain(r, c);
            }
        }
    }
    
    const strategy = document.getElementById('strategySelector').value;
    logActivity(`Starting ${strategy} solver`, 'propagation');
    
    // The original code only implemented a very simplified Forward Checking/Naked Singles approach.
    // For simplicity and adherence to the spirit of the provided function, we will continue 
    // with this simplified propagation loop which finds single-domain variables (Naked Singles) 
    // and updates the grid based on the current grid state (which acts like a basic Forward Check).

    let changed = true;
    let iterations = 0;
    const maxIterations = 100;

    while (changed && iterations < maxIterations) {
        changed = false;
        iterations++;

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (state.grid[r][c] === 0) {
                    const domain = computeValidDomain(r, c); // Re-calculate domain based on *current* grid
                    
                    if (domain.length === 0) {
                        logActivity(`Inconsistency found at [${r+1},${c+1}]. Backtracking needed! (Not implemented in this simple loop)`, 'backtrack');
                        state.solving = false;
                        document.querySelector(`[data-row="${r}"][data-col="${c}"]`).classList.add('error-cell');
                        return;
                    }

                    if (domain.length === 1) {
                        state.grid[r][c] = domain[0];
                        markSolved(r, c);
                        await delay();
                        logActivity(`Value ${domain[0]} assigned at [${r+1},${c+1}] (Naked Single)`, 'assignment');
                        updateStats();
                        changed = true;
                    }
                    // For the sake of the visualization, we can show a domain reduction step even if it's just a computation:
                    else if (domain.length < state.domains[r][c].length) {
                        highlightCell(r, c);
                        await delay(state.speed / 2); // Shorter delay for visual
                        logActivity(`Domain reduced at [${r+1},${c+1}]: ${domain.length} values remaining`, 'propagation');
                        state.domains[r][c] = domain;
                    }
                }
            }
        }
    }
    
    state.solving = false;
    logActivity('Solver process finished.', 'assignment');
    if (checkIfSolved()) {
        logActivity('🎉 Puzzle solved successfully!', 'assignment');
    } else {
        logActivity('⚠️ Could not find a full solution with simple propagation. Requires advanced search (Backtracking).', 'backtrack');
    }
    refreshDisplay();
}

// --- Helper Functions ---

function checkIfSolved() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (state.grid[r][c] === 0) return false;
            if (checkClash(r, c, state.grid[r][c], state.grid)) return false; // Check for errors in the final state
        }
    }
    return true;
}

function highlightCell(r, c) {
    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    cell.classList.add('highlighted');
    setTimeout(() => cell.classList.remove('highlighted'), 400);
}

function markSolved(r, c) {
    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    cell.classList.add('solved-cell');
    cell.textContent = state.grid[r][c];
}

function delay() {
    const speed = 1100 - parseInt(document.getElementById('speedControl').value);
    return new Promise(resolve => setTimeout(resolve, speed));
}

function logActivity(message, type) {
    const log = document.getElementById('activityLog');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `
        <div>${message}</div>
        <div class="log-time">Step ${++state.steps}</div>
    `;
    log.insertBefore(entry, log.firstChild);
    
    if (log.children.length > 50) {
        log.removeChild(log.lastChild);
    }
    updateStats();
}

function updateStats() {
    document.getElementById('stepCount').textContent = state.steps;
    let filled = 0;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (state.grid[r][c] !== 0) filled++;
        }
    }
    document.getElementById('cellsFilled').textContent = filled;
}

function refreshDisplay() {
    buildGrid();
    updateStats();
    if (state.selectedCell) {
        selectCell(state.selectedCell.r, state.selectedCell.c);
    }
}

function resetPuzzle() {
    state.steps = 0;
    state.solving = false;
    const difficulty = document.getElementById('difficultySelector').value;
    
    // Clear log and reload puzzle
    document.getElementById('activityLog').innerHTML = '';
    if (difficulty) {
        loadPuzzle(difficulty);
    } else {
        initializeCustomPuzzle();
    }
    logActivity('Puzzle reset', 'propagation');
}

function clearSelectedCell() {
    if (state.selectedCell) {
        const {r, c} = state.selectedCell;
        if (!state.fixedCells[r][c]) {
            state.grid[r][c] = 0;
            state.domains[r][c] = computeValidDomain(r,c); // Recalculate domain
            refreshDisplay();
            logActivity(`Cell [${r+1},${c+1}] cleared`, 'backtrack');
        }
    }
}

// Event Listeners
document.getElementById('difficultySelector').addEventListener('change', (e) => {
    if (e.target.value) loadPuzzle(e.target.value);
});

// Initial call to set up an empty grid or a default puzzle
buildGrid();
updateStats();              