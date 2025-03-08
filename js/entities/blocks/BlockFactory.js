/**
 * Factory for creating different types of blocks
 */
class BlockFactory {
    /**
     * Create a math block with appropriate behavior based on difficulty
     * @param {Phaser.Scene} scene - The scene this block belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} difficulty - Difficulty level
     * @returns {MathBlock} The created block
     */
    static createMathBlock(scene, x, y, difficulty = 'easy') {
        const options = { difficulty };

        // Configure behavior based on difficulty
        switch (difficulty) {
            case 'easy':
                options.ballReleaseStrategy = new StandardBallReleaseStrategy();
                options.scoreMultiplier = 1;
                options.specialEffect = null;
                break;

            case 'medium':
                options.ballReleaseStrategy = new MultiBallReleaseStrategy(3);
                options.scoreMultiplier = 1.5;
                options.specialEffect = SpecialEffectStrategy.increaseBallSpeed(1.1);
                break;

            case 'hard':
                options.ballReleaseStrategy = new MultiBallReleaseStrategy(5);
                options.scoreMultiplier = 2;
                // Combine multiple special effects for hard blocks
                options.specialEffect = SpecialEffectStrategy.combine(
                    SpecialEffectStrategy.increaseBallSpeed(1.2),
                    SpecialEffectStrategy.increasePaddleWidth(10)
                );
                break;

            default:
                // Default to easy if unknown difficulty
                options.ballReleaseStrategy = new StandardBallReleaseStrategy();
                options.scoreMultiplier = 1;
                options.specialEffect = null;
        }

        return new MathBlock(scene, x, y, options);
    }

    /**
     * Create a standard block with no special behavior
     * @param {Phaser.Scene} scene - The scene this block belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} texture - Optional texture key
     * @returns {Block} The created block
     */
    static createStandardBlock(scene, x, y, texture = 'block') {
        return new Block(scene, x, y, texture);
    }

    /**
     * Create a custom math block with specific behaviors
     * @param {Phaser.Scene} scene - The scene this block belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {object} options - Custom options for the block
     * @returns {MathBlock} The created block
     */
    static createCustomMathBlock(scene, x, y, options) {
        return new MathBlock(scene, x, y, options);
    }
}