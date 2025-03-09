import MathBlock from '../entities/blocks/MathBlock.js';
import { StandardBallReleaseStrategy, MultiBallReleaseStrategy, SuperSpecialBallReleaseStrategy, SprayBallReleaseStrategy } from '../strategies/BallReleaseStrategy.js';

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
     * @param {string} difficulty - Math difficulty ('reception', 'year1', 'year2', or 'year3')
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
            if (difficulty === 'year3') {
                // Year 3 blocks (purple) spray balls with delay
                options.texture = 'blockVeryHard'; // Ensure texture is set
                options.ballReleaseStrategy = new SprayBallReleaseStrategy(10, 200); // 10 balls with 200ms delay
            } else if (difficulty === 'year2') {
                // Year 2 blocks (red) spray balls
                options.texture = 'blockHard'; // Ensure texture is set
                options.ballReleaseStrategy = new SuperSpecialBallReleaseStrategy(5); // Standard spray amount
            } else if (difficulty === 'year1') {
                // Year 1 blocks (orange) shoot 3 balls
                options.texture = 'blockMedium'; // Ensure texture is set
                options.ballReleaseStrategy = new MultiBallReleaseStrategy();
            } else {
                // Reception blocks (green) shoot 1 ball
                options.texture = 'blockEasy'; // Ensure texture is set
                options.ballReleaseStrategy = new StandardBallReleaseStrategy();
            }
        }

        return new MathBlock(scene, x, y, options);
    }
}