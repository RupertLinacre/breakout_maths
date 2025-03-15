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
        this.sprite.setCollideWorldBounds(false);
        this.sprite.setBounce(1);
        this.speed = GameConfig.layout.ball.speed;
    }

    /**
     * Shoot the ball in a specific direction
     * @param {number|object} targetXorDirection - Either target X coordinate or direction vector {x, y}
     * @param {number} [targetY] - Target Y coordinate (if first param is X)
     */
    shoot(targetXorDirection, targetY) {
        if (typeof targetXorDirection === 'number' && typeof targetY === 'number') {
            // Shoot toward specific coordinates
            const angle = Phaser.Math.Angle.Between(
                this.sprite.x,
                this.sprite.y,
                targetXorDirection,
                targetY
            );
            this.scene.physics.velocityFromRotation(angle, this.speed, this.sprite.body.velocity);
        } else {
            // Use provided direction vector
            const direction = targetXorDirection;
            const norm = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            this.sprite.setVelocity(
                direction.x / norm * this.speed,
                direction.y / norm * this.speed
            );
        }
    }

    /**
     * Update ball position and handle boundary collisions
     * @param {number} width - Game width
     * @param {number} height - Game height
     */
    update(width, height) {
        if (!this.sprite.active) return;

        // Handle manual wall collisions (top, left, right only)
        if (this.sprite.x <= 0) {
            this.sprite.x = 1;
            this.sprite.body.velocity.x = Math.abs(this.sprite.body.velocity.x);
        } else if (this.sprite.x >= width - this.sprite.width) {
            this.sprite.x = width - this.sprite.width - 1;
            this.sprite.body.velocity.x = -Math.abs(this.sprite.body.velocity.x);
        }

        if (this.sprite.y <= 0) {
            this.sprite.y = 1;
            this.sprite.body.velocity.y = Math.abs(this.sprite.body.velocity.y);
        }

        // Remove balls that fall off screen (no bounce at bottom)
        if (this.sprite.y > height) {
            this.destroy();
        }
    }

    /**
     * Destroy this ball
     */
    destroy() {
        if (this.sprite && this.sprite.active) {
            this.sprite.destroy();
        }
    }
}