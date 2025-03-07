/**
 * Paddle (player-controlled) class
 */
class Paddle {
    /**
     * Create a new paddle
     * @param {Phaser.Scene} scene - The scene this paddle belongs to
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     */
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.image(x, y, 'paddle').setImmovable(true);
        this.speed = 7;
        this.minX = 40;
        this.maxX = 610;
    }

    /**
     * Update paddle position based on input
     * @param {Phaser.Input.Keyboard.CursorKeys} cursors - Cursor keys for input
     */
    update(cursors) {
        if (cursors.left.isDown) {
            this.moveLeft();
        } else if (cursors.right.isDown) {
            this.moveRight();
        }

        // Keep paddle in bounds
        this.sprite.x = Phaser.Math.Clamp(this.sprite.x, this.minX, this.maxX);
    }

    /**
     * Move paddle left
     */
    moveLeft() {
        this.sprite.x -= this.speed;
    }

    /**
     * Move paddle right
     */
    moveRight() {
        this.sprite.x += this.speed;
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
}