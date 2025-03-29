// src/entities/Ball.js
import GameConfig from '../config/gameConfig.js';

/**
 * Ball class for projectiles
 */
export default class Ball {
    /**
     * Create a new ball
     * @param {Phaser.Scene} scene - The scene this ball belongs to
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     */
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.balls.create(x, y, 'ball');
        this.sprite.setCollideWorldBounds(false); // We handle bounds manually mostly
        this.sprite.setBounce(1);
        this.speed = GameConfig.layout.ball.speed;

        // Store instance reference on sprite's data manager
        if (this.sprite) {
            this.sprite.setData('ballInstance', this);
        } else {
            console.error("Failed to create ball sprite at", x, y);
        }
    }

    /**
     * Shoot the ball in a specific direction
     * @param {number|object} targetXorDirection - Either target X coordinate or direction vector {x, y}
     * @param {number} [targetY] - Target Y coordinate (if first param is X)
     */
    shoot(targetXorDirection, targetY) {
        if (!this.sprite || !this.sprite.body) return; // Guard clause

        if (typeof targetXorDirection === 'number' && typeof targetY === 'number') {
            // Shoot toward specific coordinates
            const angle = Phaser.Math.Angle.Between(
                this.sprite.x,
                this.sprite.y,
                targetXorDirection,
                targetY
            );
            this.scene.physics.velocityFromRotation(angle, this.speed, this.sprite.body.velocity);
        } else if (typeof targetXorDirection === 'object' && targetXorDirection !== null) {
            // Use provided direction vector
            const direction = targetXorDirection;
            const norm = Math.sqrt(direction.x * direction.x + direction.y * direction.y) || 1;
            this.sprite.setVelocity(
                (direction.x / norm) * this.speed,
                (direction.y / norm) * this.speed
            );
        } else {
            console.warn("Invalid arguments for Ball.shoot:", targetXorDirection, targetY);
            this.sprite.setVelocity(0, -this.speed); // Default upwards
        }
    }

    /**
     * Update ball position and handle boundary collisions
     * Called BY GameScene's update loop FOR each ball instance.
     * @param {number} width - Game width
     * @param {number} height - Game height
     */
    update(width, height) {
        // Guard clause
        if (!this.sprite || !this.sprite.active || !this.sprite.body) {
            return;
        }

        // Handle manual wall collisions (top, left, right only)
        let bounced = false;
        if (this.sprite.x <= 0 && this.sprite.body.velocity.x < 0) {
            this.sprite.x = 1;
            this.sprite.body.velocity.x *= -1;
            bounced = true;
        } else if (this.sprite.x >= width - this.sprite.width && this.sprite.body.velocity.x > 0) {
            this.sprite.x = width - this.sprite.width - 1;
            this.sprite.body.velocity.x *= -1;
            bounced = true;
        }

        if (this.sprite.y <= 0 && this.sprite.body.velocity.y < 0) {
            this.sprite.y = 1;
            this.sprite.body.velocity.y *= -1;
            bounced = true;
        }

        // Destroy ball if it falls off bottom
        if (this.sprite.y > height) {
            this.destroy(); // Call Ball's own destroy method
        }
    }

    /**
     * Destroy this ball and clean up references
     */
    destroy() {
        // Guard clause: ensure sprite exists before trying to access its properties or methods
        if (!this.sprite) {
            return;
        }

        // --- Corrected Data Removal ---
        // Access the 'data' property to use the Data Manager's remove method
        if (this.sprite.data) { // Check if data manager exists (it should for sprites)
            this.sprite.data.remove('ballInstance');
        }
        // -----------------------------

        // Destroy the Phaser sprite if it's still active
        if (this.sprite.active) {
            this.sprite.destroy();
        }

        // Nullify the reference to help GC and prevent errors
        this.sprite = null;
    }
}