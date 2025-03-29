// src/ui/uiController.js
import GameConfig from '../config/gameConfig.js';

// --- Module State ---
let gameSceneRef = null;
let uiSceneRef = null;
let isInitialized = false;

// --- DOM Elements (cache them) ---
let difficultySelector, blockInfoDiv, answerInput, columnsInput, rowsInput, sidePaddingInput, topPaddingInput, paddleDeflectionCheckbox;

// --- UI Functions ---

function cacheDOMElements() {
    difficultySelector = document.getElementById('difficulty-selector');
    blockInfoDiv = document.getElementById('block-info');
    answerInput = document.getElementById('answer-input');
    columnsInput = document.getElementById('columns');
    rowsInput = document.getElementById('rows');
    sidePaddingInput = document.getElementById('sidePadding');
    topPaddingInput = document.getElementById('topPadding');
    paddleDeflectionCheckbox = document.getElementById('paddle-deflection');
}

function updateBlockInfo(difficulty) {
    const yearRange = GameConfig.getYearRange(difficulty);
    const difficultyName = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    blockInfoDiv.innerHTML = `
        <div class="difficulty-name">Current difficulty: ${difficultyName}</div>
        <div><span class="block-color green"></span> Green blocks: ${yearRange[0]} level (1 ball)</div>
        <div><span class="block-color orange"></span> Orange blocks: ${yearRange[1]} level (3 balls)</div>
        <div><span class="block-color red"></span> Red blocks: ${yearRange[2]} level (5 balls in arc)</div>
        <div><span class="block-color purple"></span> Purple blocks: ${yearRange[3]} level (10 balls spray)</div>
    `;
}

function handleDifficultyChange() {
    const selectedDifficulty = difficultySelector.value;
    localStorage.setItem('mathGameDifficulty', selectedDifficulty);
    GameConfig.setDifficulty(selectedDifficulty);
    updateBlockInfo(selectedDifficulty);

    if (gameSceneRef) {
        gameSceneRef.setGameDifficulty(selectedDifficulty); // Tell game scene directly
        gameSceneRef.restartGame();
    }
}

function handleLayoutChange() {
    let columns = parseInt(columnsInput.value) || 16;
    let rows = parseInt(rowsInput.value) || 7;
    let sidePadding = parseInt(sidePaddingInput.value) || 50;
    let topPadding = parseInt(topPaddingInput.value) || 50;

    // Validate inputs
    if (columns < 1) columns = 1;
    if (rows < 1) rows = 1;
    if (sidePadding < 0) sidePadding = 0;
    if (topPadding < 0) topPadding = 0;

    // Update GameConfig directly
    GameConfig.blockGrid.columns = columns;
    GameConfig.blockGrid.rows = rows;
    GameConfig.blockGrid.sidePadding = sidePadding;
    GameConfig.blockGrid.topPadding = topPadding;
    GameConfig.updateLayout();

    if (gameSceneRef) {
        // Resize Phaser game canvas directly
        const game = gameSceneRef.game; // Get game reference from the scene
        const newWidth = GameConfig.layout.gameWidth;
        const newHeight = GameConfig.layout.gameHeight;

        game.scale.resize(newWidth, newHeight);
        // Trigger resize event for scenes like UIScene
        game.events.emit('resize', newWidth, newHeight);

        // Add a small delay before restarting scene
        setTimeout(() => {
            if (gameSceneRef) {
                gameSceneRef.restartGame();
                // Ensure UI Scene updates layout too if needed after restart
                uiSceneRef?.resize(newWidth, newHeight); // Call resize explicitly
                focusInput(); // Refocus after restart
            }
        }, 100);
    }
}

function handlePaddleDeflectionChange() {
    GameConfig.layout.paddle.deflectsBalls = paddleDeflectionCheckbox.checked;
    if (gameSceneRef) {
        // Need to restart the game for this setting to take effect
        gameSceneRef.restartGame();
    }
}

function handleAnswerSubmit(event) {
    if (event.key === 'Enter' && !answerInput.disabled && uiSceneRef) {
        const answer = answerInput.value;
        // Pass the answer to the UIScene to handle
        uiSceneRef.submitAnswer(answer);
        answerInput.value = '';
        event.preventDefault();
    }
}

function disableInput(isDisabled) {
    if (answerInput) {
        answerInput.disabled = isDisabled;
    }
}

function focusInput() {
    if (answerInput && !answerInput.disabled) {
        // Use a small timeout to ensure focus works after potential DOM/state changes
        setTimeout(() => answerInput.focus(), 50);
    }
}

// --- Initialization ---
function initialize(gameScene, uiScene) {
    if (isInitialized) return; // Prevent double initialization

    console.log("UI Controller Initializing...");
    gameSceneRef = gameScene;
    uiSceneRef = uiScene;

    cacheDOMElements(); // Find DOM elements once

    // --- Initial State Setup ---
    const savedDifficulty = localStorage.getItem('mathGameDifficulty') || 'year1';
    difficultySelector.value = savedDifficulty;
    GameConfig.setDifficulty(savedDifficulty);
    updateBlockInfo(savedDifficulty);

    columnsInput.value = GameConfig.blockGrid.columns;
    rowsInput.value = GameConfig.blockGrid.rows;
    sidePaddingInput.value = GameConfig.blockGrid.sidePadding;
    topPaddingInput.value = GameConfig.blockGrid.topPadding;
    paddleDeflectionCheckbox.checked = GameConfig.layout.paddle.deflectsBalls;

    // --- Add Event Listeners ---
    difficultySelector.addEventListener('change', handleDifficultyChange);
    columnsInput.addEventListener('change', handleLayoutChange);
    rowsInput.addEventListener('change', handleLayoutChange);
    sidePaddingInput.addEventListener('change', handleLayoutChange);
    topPaddingInput.addEventListener('change', handleLayoutChange);
    paddleDeflectionCheckbox.addEventListener('change', handlePaddleDeflectionChange);
    answerInput.addEventListener('keydown', handleAnswerSubmit);

    focusInput(); // Initial focus

    isInitialized = true;
    console.log("UI Controller Initialized.");
}

// Export the necessary functions
export default {
    initialize,
    disableInput,
    focusInput
};