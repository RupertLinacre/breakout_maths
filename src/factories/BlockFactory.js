import MathBlock from '../entities/blocks/MathBlock.js';

/**
 * Factory for creating different types of blocks
 */
export default class BlockFactory {
    /**
     * Create a math block with specific properties
     * @param {Phaser.Scene} scene - The scene this block belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} blockType - Type of block to create ('standard', 'multi', 'super', etc.)
     * @param {string} difficulty - Math difficulty ('easy', 'medium', or 'hard')
     * @returns {MathBlock} The created block
     */
    static createMathBlock(scene, x, y, blockType, difficulty) {
        let options = {
            difficulty: difficulty
        };

        // Configure block based on type and difficulty
        if (blockType === 'super') {
            // Super special blocks always spray balls
            options.texture = 'blockSuper';
            options.ballReleaseStrategy = new SuperSpecialBallReleaseStrategy();
        } else {
            // For standard blocks, assign strategy based on difficulty
            if (difficulty === 'hard') {
                // Hard blocks (purple) spray balls
                options.texture = 'blockHard'; // Ensure texture is set
                options.ballReleaseStrategy = new SuperSpecialBallReleaseStrategy();
            } else if (difficulty === 'medium') {
                // Medium blocks (red) shoot 3 balls
                options.texture = 'blockMedium'; // Ensure texture is set
                options.ballReleaseStrategy = new MultiBallReleaseStrategy();
            } else {
                // Easy blocks (green) shoot 1 ball
                options.texture = 'blockEasy'; // Ensure texture is set
                options.ballReleaseStrategy = new StandardBallReleaseStrategy();
            }
        }

        return new MathBlock(scene, x, y, options);
    }
}