// Get references to DOM elements
const gameBoard = document.getElementById('gameBoard');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('resetButton');
const cells = document.querySelectorAll('.cell'); // NodeList of all cell elements
const strikeLine = document.getElementById('strikeLine'); // Reference to the strike line element

// Game state variables
let board = ['', '', '', '', '', '', '', '', '']; // Represents the Tic Tac Toe board
let currentPlayer = 'X'; // 'X' or 'O'
let gameActive = true; // True if the game is ongoing, false if won or drawn

// Winning conditions: combinations of cell indices that result in a win
const winningConditions = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal from top-left
    [2, 4, 6] // Diagonal from top-right
];

/**
 * Handles a cell click event.
 * @param {Event} clickedCellEvent - The click event object.
 */
function handleCellClick(clickedCellEvent) {
    // Get the clicked HTML element
    const clickedCell = clickedCellEvent.target;
    // Get the data-cell-index attribute to identify the cell's position
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    // If the cell is already filled or the game is not active, do nothing
    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    // Update the game board and the UI
    board[clickedCellIndex] = currentPlayer;
    // Use Font Awesome icons for X and O
    if (currentPlayer === 'X') {
        // Ensure Font Awesome classes are correctly applied for 'X'
        clickedCell.innerHTML = '<i class="fas fa-times"></i>';
        clickedCell.classList.add('player-x'); // Add class for X-specific styling
    } else {
        // Ensure Font Awesome classes are correctly applied for 'O'
        clickedCell.innerHTML = '<i class="far fa-circle"></i>';
        clickedCell.classList.add('player-o'); // Add class for O-specific styling
    }

    // Check for game outcome
    handleResultValidation();
}

/**
 * Checks if the current player has won or if the game is a draw.
 */
function handleResultValidation() {
    let roundWon = false;
    let winCondition = null; // Variable to store the winning condition

    // Iterate through all winning conditions
    for (let i = 0; i < winningConditions.length; i++) {
        const condition = winningConditions[i];
        let a = board[condition[0]];
        let b = board[condition[1]];
        let c = board[condition[2]];

        // If any of the cells in the current condition are empty, skip
        if (a === '' || b === '' || c === '') {
            continue;
        }
        // If all three cells match, the current player has won
        if (a === b && b === c) {
            roundWon = true;
            winCondition = condition; // Store the winning condition
            break; // Exit loop as a win is found
        }
    }

    // If a player has won
    if (roundWon) {
        statusDisplay.innerHTML = `<span class="text-green-500 font-bold">Player ${currentPlayer} has won!</span>`;
        gameActive = false; // End the game

        // --- Strike-through Effect ---
        strikeLine.classList.remove('hidden'); // Make the strike line visible

        // Get the first and last winning cells to calculate the line's position
        const firstCell = cells[winCondition[0]];
        const lastCell = cells[winCondition[2]];

        // Get the bounding rectangles of the cells and the game board relative to the viewport
        const firstRect = firstCell.getBoundingClientRect();
        const lastRect = lastCell.getBoundingClientRect();
        const boardRect = gameBoard.getBoundingClientRect();

        // Calculate center points of the first and last cells relative to the gameBoard
        // This ensures the line's position is correct even if the board moves
        const startX = (firstRect.left + firstRect.right) / 2 - boardRect.left;
        const startY = (firstRect.top + firstRect.bottom) / 2 - boardRect.top;
        const endX = (lastRect.left + lastRect.right) / 2 - boardRect.left;
        const endY = (lastRect.top + lastRect.bottom) / 2 - boardRect.top;

        // Calculate distance between the two points (this will be the width of the line)
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

        // Calculate angle in radians using atan2 (handles all quadrants correctly)
        const angleRad = Math.atan2(endY - startY, endX - startX);
        const angleDeg = angleRad * (180 / Math.PI); // Convert radians to degrees

        // Position the strike line
        strikeLine.style.width = `${distance}px`;
        // Set the line's position to the midpoint between the start and end cells
        strikeLine.style.left = `${(startX + endX) / 2}px`;
        strikeLine.style.top = `${(startY + endY) / 2}px`;
        // Use translate(-50%, -50%) to center the line's own midpoint at the calculated (left, top)
        // Then apply the rotation
        strikeLine.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;

        // --- Celebration Effect ---
        document.body.classList.add('celebrate-win'); // Add class to trigger animation

        return; // Game over, no more actions
    }

    // If there are no empty cells and no one has won, it's a draw
    let roundDraw = !board.includes('');
    if (roundDraw) {
        statusDisplay.innerHTML = `<span class="text-blue-400 font-bold">Game ended in a draw!</span>`;
        gameActive = false; // End the game
        return;
    }

    // If the game is still active, switch to the next player
    handlePlayerChange();
}

/**
 * Switches the current player from 'X' to 'O' or vice versa.
 */
function handlePlayerChange() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.innerHTML = `<span class="text-green-400">Player ${currentPlayer}'s Turn</span>`;
}

/**
 * Resets the game to its initial state.
 */
function handleResetGame() {
    board = ['', '', '', '', '', '', '', '', '']; // Clear the board array
    gameActive = true; // Set game to active
    currentPlayer = 'X'; // Start with Player X
    statusDisplay.innerHTML = `<span class="text-green-400">Player ${currentPlayer}'s Turn</span>`; // Update status

    // Clear the content and remove player classes from all cells
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('player-x', 'player-o');
    });

    // --- Reset Strike-through and Celebration Effects ---
    strikeLine.classList.add('hidden'); // Hide the strike line again
    document.body.classList.remove('celebrate-win'); // Remove celebration effect class
}

// Event Listeners
// Add click event listener to each cell
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
// Add click event listener to the reset button
resetButton.addEventListener('click', handleResetGame);

// Initial status display when the page loads
statusDisplay.innerHTML = `<span class="text-green-400">Player ${currentPlayer}'s Turn</span>`;