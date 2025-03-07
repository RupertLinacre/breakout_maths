/**
 * Math Breakout Game - Main Initialization
 *
 * This file initializes the Phaser game instance and configures the game.
 */

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 650,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene, UIScene]
};

// Start game
const game = new Phaser.Game(config);