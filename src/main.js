import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameConfig from './config/gameConfig.js';
import uiController from './ui/uiController.js'; // Import the controller

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
    scene: [GameScene, UIScene],
    // Make uiController accessible to scenes
    uiController: uiController
};

// Create the game instance locally
const game = new Phaser.Game(config);

// Wait for the Phaser game instance to be ready before initializing UI
game.events.on('ready', () => {
    console.log('Phaser Game instance is ready.');

    const gameScene = game.scene.getScene('GameScene');
    const uiScene = game.scene.getScene('UIScene');

    if (gameScene && uiScene) {
        // Initialize the UI controller, passing scene references
        uiController.initialize(gameScene, uiScene);
    } else {
        console.error("Failed to get scene references after game ready!");
    }
});