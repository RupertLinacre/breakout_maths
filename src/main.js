import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import GameConfig from './config/gameConfig.js';
import UIScene from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: GameConfig.layout.gameWidth,
    height: GameConfig.layout.gameHeight,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene, UIScene] // Add UIScene back here
};

// Create the game instance locally
const game = new Phaser.Game(config);

// Wait for the canvas to be created, then set up focus and keyboard target
setTimeout(() => {
    const canvas = document.querySelector('#game-container canvas');
    if (canvas) {
        canvas.setAttribute('tabindex', '0');
        canvas.setAttribute('id', 'gameCanvas');
        // Set Phaser's keyboard/mouse target to the canvas
        if (game.input && game.input.keyboard) game.input.keyboard.target = canvas;
        if (game.input && game.input.mouse) game.input.mouse.target = canvas;
        // Focus canvas on click
        canvas.addEventListener('pointerdown', () => {
            canvas.focus();
        });
    }

    // Set up num columns input logic
    const numColumnsInput = document.getElementById('numColumnsInput');
    if (numColumnsInput) {
        // Set the initial value from GameConfig (programmatically)
        numColumnsInput.value = GameConfig.blockGrid.columns;
        // Focus/blur disables/enables Phaser keyboard input
        numColumnsInput.addEventListener('focus', () => {
            if (game.input && game.input.keyboard) game.input.keyboard.enabled = false;
        });
        numColumnsInput.addEventListener('blur', () => {
            if (game.input && game.input.keyboard) game.input.keyboard.enabled = true;
        });
        // On change, update columns and restart game
        numColumnsInput.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            if (val >= 2 && val <= 1000) {
                const gameScene = game.scene.getScene('GameScene');
                if (gameScene && typeof gameScene.setNumColumnsAndRestart === 'function') {
                    gameScene.setNumColumnsAndRestart(val);
                }
            }
        });
    }

    // Set up num rows input logic
    const numRowsInput = document.getElementById('numRowsInput');
    if (numRowsInput) {
        numRowsInput.value = GameConfig.blockGrid.rows;
        numRowsInput.addEventListener('focus', () => {
            if (game.input && game.input.keyboard) game.input.keyboard.enabled = false;
        });
        numRowsInput.addEventListener('blur', () => {
            if (game.input && game.input.keyboard) game.input.keyboard.enabled = true;
        });
        numRowsInput.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            if (val >= 1 && val <= 20) {
                const gameScene = game.scene.getScene('GameScene');
                if (gameScene && typeof gameScene.setNumRowsAndRestart === 'function') {
                    gameScene.setNumRowsAndRestart(val);
                }
            }
        });
    }

    // Set up top padding input logic
    const topPaddingInput = document.getElementById('topPaddingInput');
    if (topPaddingInput) {
        topPaddingInput.value = GameConfig.blockGrid.topPadding;
        topPaddingInput.addEventListener('focus', () => {
            if (game.input && game.input.keyboard) game.input.keyboard.enabled = false;
        });
        topPaddingInput.addEventListener('blur', () => {
            if (game.input && game.input.keyboard) game.input.keyboard.enabled = true;
        });
        topPaddingInput.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            if (val >= 0 && val <= 500) {
                const gameScene = game.scene.getScene('GameScene');
                if (gameScene && typeof gameScene.setTopPaddingAndRestart === 'function') {
                    gameScene.setTopPaddingAndRestart(val);
                }
            }
        });
    }

    // Set up side padding input logic
    const sidePaddingInput = document.getElementById('sidePaddingInput');
    if (sidePaddingInput) {
        sidePaddingInput.value = GameConfig.blockGrid.sidePadding;
        sidePaddingInput.addEventListener('focus', () => {
            if (game.input && game.input.keyboard) game.input.keyboard.enabled = false;
        });
        sidePaddingInput.addEventListener('blur', () => {
            if (game.input && game.input.keyboard) game.input.keyboard.enabled = true;
        });
        sidePaddingInput.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            if (val >= 0 && val <= 500) {
                const gameScene = game.scene.getScene('GameScene');
                if (gameScene && typeof gameScene.setSidePaddingAndRestart === 'function') {
                    gameScene.setSidePaddingAndRestart(val);
                }
            }
        });
    }

    // Set up difficulty selector logic
    const difficultySelector = document.getElementById('difficulty-selector');
    if (difficultySelector) {
        // Set initial value from localStorage or GameConfig
        const savedDifficulty = localStorage.getItem('mathGameDifficulty');
        const initialDifficulty = savedDifficulty || GameConfig.getDifficulty();
        difficultySelector.value = initialDifficulty;

        // On change, update localStorage, GameConfig, and restart game
        difficultySelector.addEventListener('change', (e) => {
            const selectedDifficulty = e.target.value;
            localStorage.setItem('mathGameDifficulty', selectedDifficulty);
            GameConfig.setDifficulty(selectedDifficulty);
            const gameScene = game.scene.getScene('GameScene');
            if (gameScene && typeof gameScene.setGameDifficulty === 'function') {
                gameScene.setGameDifficulty(selectedDifficulty);
                gameScene.restartGame();
            }
        });
    }
}, 100);