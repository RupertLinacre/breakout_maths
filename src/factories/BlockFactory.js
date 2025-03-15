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

        // Configure block based on difficulty
        // Higher year levels get more powerful ball release strategies
        if (difficulty === 'year6') {
            // Year 6 blocks (purple) spray many balls with short delay
            options.texture = 'blockVeryHard';
            options.ballReleaseStrategy = new SprayBallReleaseStrategy(15, 150); // 15 balls with 150ms delay
        } else if (difficulty === 'year5') {
            // Year 5 blocks (purple) spray many balls
            options.texture = 'blockVeryHard';
            options.ballReleaseStrategy = new SprayBallReleaseStrategy(12, 180); // 12 balls with 180ms delay
        } else if (difficulty === 'year4') {
            // Year 4 blocks (purple) spray balls with delay
            options.texture = 'blockVeryHard';
            options.ballReleaseStrategy = new SprayBallReleaseStrategy(10, 200); // 10 balls with 200ms delay
        } else if (difficulty === 'year3') {
            // Year 3 blocks (red) spray balls in an arc
            options.texture = 'blockHard';
            options.ballReleaseStrategy = new ArcBallReleaseStrategy(7); // 7 balls in an arc
        } else if (difficulty === 'year2') {
            // Year 2 blocks (red) spray fewer balls in an arc
            options.texture = 'blockHard';
            options.ballReleaseStrategy = new ArcBallReleaseStrategy(5); // 5 balls in an arc
        } else if (difficulty === 'year1') {
            // Year 1 blocks (orange) shoot 3 balls
            options.texture = 'blockMedium';
            options.ballReleaseStrategy = new MultiBallReleaseStrategy();
        } else {
            // Reception blocks (green) shoot 1 ball
            options.texture = 'blockEasy';
            options.ballReleaseStrategy = new StandardBallReleaseStrategy();
        }

        return new MathBlock(scene, x, y, options);
    }
}