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
            if (val >= 4 && val <= 30) {
                const gameScene = game.scene.getScene('GameScene');
                if (gameScene && typeof gameScene.setNumColumnsAndRestart === 'function') {
                    gameScene.setNumColumnsAndRestart(val);
                }
            }
        });
    }
}, 100);