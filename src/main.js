import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1250,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene, UIScene],
};

// Create the game instance and expose it to the window object
window.game = new Phaser.Game(config);