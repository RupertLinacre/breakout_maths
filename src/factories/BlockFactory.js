import MathBlock from '../entities/blocks/MathBlock.js';
import { StandardBallReleaseStrategy, MultiBallReleaseStrategy, ArcBallReleaseStrategy, SprayBallReleaseStrategy } from '../strategies/BallReleaseStrategy.js';
import GameConfig from '../config/gameConfig.js';

/**
 * Factory for creating different types of blocks
 */
export default class BlockFactory {
    /**
     * Create a math block with specific properties
     * @param {Phaser.Scene} scene - The scene this block belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} difficulty - Math difficulty ('reception', 'year1', 'year2', etc.)
     * @returns {MathBlock} The created block
     */
    static createMathBlock(scene, x, y, difficulty) {
        let options = {
            difficulty: difficulty
        };

        // Get the current year range to determine the relative position of this difficulty
        const yearRange = GameConfig.getYearRange();
        const difficultyIndex = yearRange.indexOf(difficulty);

        // Configure block based on the position in the difficulty distribution
        // rather than the specific year level
        if (difficultyIndex === 0) {
            // Easiest level (50% spawn rate) - green blocks with 1 ball
            options.texture = 'blockEasy';
            options.ballReleaseStrategy = new StandardBallReleaseStrategy();
        } else if (difficultyIndex === 1) {
            // Medium level (25% spawn rate) - orange blocks with 3 balls
            options.texture = 'blockMedium';
            options.ballReleaseStrategy = new MultiBallReleaseStrategy();
        } else if (difficultyIndex === 2) {
            // Hard level (15% spawn rate) - red blocks with arc balls
            options.texture = 'blockHard';
            options.ballReleaseStrategy = new ArcBallReleaseStrategy(5);
        } else if (difficultyIndex === 3) {
            // Very hard level (10% spawn rate) - purple blocks with spray balls
            options.texture = 'blockVeryHard';
            options.ballReleaseStrategy = new SprayBallReleaseStrategy(10, 200);
        } else {
            // Fallback for any other difficulty - use the easiest level
            options.texture = 'blockEasy';
            options.ballReleaseStrategy = new StandardBallReleaseStrategy();
        }

        return new MathBlock(scene, x, y, options);
    }
}