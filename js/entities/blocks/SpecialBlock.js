/**
 * Base class for special blocks with unique behaviors
 * @extends Block
 */
class SpecialBlock extends Block {
    /**
     * Create a new special block
     * @param {Phaser.Scene} scene - The scene this block belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} texture - Texture key to use
     */
    constructor(scene, x, y, texture = 'blockEasy') {
        super(scene, x, y, texture);
        this.specialEffect = 'none';
    }

    /**
     * Apply special effect when block is hit
     * @param {Ball} ball - The ball that hit this block
     */
    applySpecialEffect(ball) {
        // To be implemented by subclasses
        console.log('Special effect applied');
    }

    /**
     * Handle collision with a ball
     * @param {Ball} ball - The ball that hit this block
     * @returns {number} Score for destroying this block
     */
    onHit(ball) {
        this.applySpecialEffect(ball);
        return super.onHit(ball);
    }
}

/**
 * Example of how to extend SpecialBlock for future implementations
 * This is a placeholder for demonstration purposes
 */
/*
class PowerUpBlock extends SpecialBlock {
    constructor(scene, x, y) {
        super(scene, x, y, 'blockPowerUp');
        this.specialEffect = 'powerUp';
    }

    applySpecialEffect(ball) {
        // Example: Create multiple balls, increase paddle size, etc.
        console.log('Power-up activated!');
    }
}
*/