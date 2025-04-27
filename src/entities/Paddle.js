import GameConfig from '../config/gameConfig.js';

/**
 * Paddle (player-controlled) class
 */
export default class Paddle {
    /**
     * Create a new paddle
     * @param {Phaser.Scene} scene - The scene this paddle belongs to
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     */
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.image(x, y, 'paddle')
            .setCollideWorldBounds(true); // let Phaser keep it inside
        this.speed = GameConfig.layout.paddle.speed * 50;
        // Removed minX/maxX and manual bounds logic
    }

    /**
     * Update paddle position based on input
     * @param {Phaser.Input.Keyboard.CursorKeys} cursors - Cursor keys for input
     */
    update(cursors) {
        // apply velocity so world-bounds block works for us
        if (cursors.left.isDown) this.sprite.setVelocityX(-this.speed);
        else if (cursors.right.isDown) this.sprite.setVelocityX(this.speed);
        else this.sprite.setVelocityX(0);
    }

    /**
     * Get current X position
     * @returns {number} Current X position
     */
    getX() {
        return this.sprite.x;
    }

    /**
     * Get current Y position
     * @returns {number} Current Y position
     */
    getY() {
        return this.sprite.y;
    }

    /**
     * Destroy the paddle sprite
     */
    destroy() {
        if (this.sprite && this.sprite.active) {
            this.sprite.destroy();
        }
    }
}