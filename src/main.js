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