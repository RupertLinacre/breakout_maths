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
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.onWorldBounds = true;
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
     * @param {number} [speedOverride] - Optional speed to use instead of the default.
     */
    shoot(targetXorDirection, targetY, speedOverride) {
        if (!this.sprite || !this.sprite.body) return; // Guard clause

        const effectiveSpeed = (typeof speedOverride === 'number' && speedOverride > 0) ? speedOverride : this.speed;

        if (typeof targetXorDirection === 'number' && typeof targetY === 'number') {
            // Shoot toward specific coordinates
            const angle = Phaser.Math.Angle.Between(
                this.sprite.x,
                this.sprite.y,
                targetXorDirection,
                targetY
            );
            this.scene.physics.velocityFromRotation(angle, effectiveSpeed, this.sprite.body.velocity);
        } else if (typeof targetXorDirection === 'object' && targetXorDirection !== null) {
            // Use provided direction vector
            const direction = targetXorDirection;
            const norm = Math.sqrt(direction.x * direction.x + direction.y * direction.y) || 1;
            this.sprite.setVelocity(
                (direction.x / norm) * effectiveSpeed,
                (direction.y / norm) * effectiveSpeed
            );
        } else {
            console.warn("Invalid arguments for Ball.shoot:", targetXorDirection, targetY);
            this.sprite.setVelocity(0, -effectiveSpeed); // Default upwards
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