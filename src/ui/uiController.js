// src/ui/uiController.js
import GameConfig from '../config/gameConfig.js';

// --- Module State ---
let gameSceneRef = null;
let uiSceneRef = null;
let isInitialized = false;

// --- DOM Elements (cache them) ---
let answerInput;

// --- UI Functions ---

function cacheDOMElements() {
    answerInput = document.getElementById('answer-input');
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
    GameConfig.setDifficulty('year1');

    if (answerInput) {
        answerInput.addEventListener('keydown', handleAnswerSubmit);
    } else {
        console.warn("Answer input element not found during initialization.");
    }

    focusInput(); // Initial focus

    isInitialized = true;
    console.log("UI Controller Initialized (Simplified).\n");
}

// Export the necessary functions
export default {
    initialize,
    disableInput,
    focusInput
};