/**
 * Collection of special effect strategies for blocks
 */
class SpecialEffectStrategy {
    /**
     * No special effect (default)
     * @param {Phaser.Scene} scene - The game scene
     * @param {Ball} ball - The ball that hit the block
     * @param {Block} block - The block that was hit
     */
    static none(scene, ball, block) {
        // No effect
    }

    /**
     * Increase ball speed
     * @param {number} speedMultiplier - How much to multiply the ball's speed
     * @returns {Function} The special effect function
     */
    static increaseBallSpeed(speedMultiplier = 1.2) {
        return (scene, ball, block) => {
            ball.increaseSpeed(speedMultiplier);
        };
    }

    /**
     * Increase paddle width
     * @param {number} widthIncrease - How many pixels to add to paddle width
     * @returns {Function} The special effect function
     */
    static increasePaddleWidth(widthIncrease = 20) {
        return (scene, ball, block) => {
            scene.paddle.increaseWidth(widthIncrease);
        };
    }

    /**
     * Add a power-up at the block's position
     * @param {string} powerUpType - Type of power-up to add
     * @returns {Function} The special effect function
     */
    static addPowerUp(powerUpType = 'extraLife') {
        return (scene, ball, block) => {
            if (scene.addPowerUp) {
                scene.addPowerUp(block.x, block.y, powerUpType);
            }
        };
    }

    /**
     * Combine multiple special effects
     * @param {...Function} effects - Special effect functions to combine
     * @returns {Function} The combined special effect function
     */
    static combine(...effects) {
        return (scene, ball, block) => {
            effects.forEach(effect => effect(scene, ball, block));
        };
    }
}