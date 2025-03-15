import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameConfig from './config/gameConfig.js';

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
};

// Create the game instance and expose it to the window object
window.game = new Phaser.Game(config);