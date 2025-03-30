import Helpers from '../../utils/helpers.js';

/**
 * Base class for all block types
 */
export default class Block {
    /**
     * Create a new block
     * @param {Phaser.Scene} scene - The scene this block belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} texture - Texture key to use
     */
    constructor(scene, x, y, texture = 'blockEasy') {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.texture = texture;
        this.sprite = null;
        this.create();
    }

    /**
     * Create the block sprite
     */
    create() {
        this.sprite = this.scene.blocks.create(this.x, this.y, this.texture);
        return this.sprite;
    }

    /**
     * Handle collision with a ball
     * @param {Ball} ball - The ball that hit this block
     */
    onHit(ball) {
        this.destroy();
        return 10; // Base score for destroying a block
    }

    /**
     * Destroy this block
     */
    destroy() {
        // Guard clause: Only proceed if sprite exists
        if (!this.sprite) {
            return;
        }
        // Destroy the sprite if it's active
        if (this.sprite.active) {
            this.sprite.destroy();
        }
        // Nullify the reference to help GC and prevent future errors
        this.sprite = null;
    }

    /**
     * Get the column index of this block
     * @returns {number} Column index
     */
    getColumn() {
        return Helpers.getBlockColumn(this.x);
    }
}