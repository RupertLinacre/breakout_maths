import Block from './Block.js';
import { createMathProblem, getProblemExpression, getAnswer, validateAnswer, getPoints } from 'maths-game-problem-generator';
import { StandardBallReleaseStrategy, MultiBallReleaseStrategy, SuperSpecialBallReleaseStrategy } from '../../strategies/BallReleaseStrategy.js';
import Helpers from '../../utils/helpers.js';

/**
 * Block with a math problem
 * @extends Block
 */
export default class MathBlock extends Block {
    /**
     * Create a new math block
     * @param {Phaser.Scene} scene - The scene this block belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {object|string} options - Options object or difficulty string
     */
    constructor(scene, x, y, options = {}) {
        // Handle case where options is just a difficulty string (for backward compatibility)
        if (typeof options === 'string') {
            options = { difficulty: options };
        }

        // Default options
        const defaults = {
            difficulty: 'easy',
            texture: null,
            ballReleaseStrategy: new StandardBallReleaseStrategy(),
            specialEffect: null,
            scoreMultiplier: 1
        };

        // Merge provided options with defaults
        const config = { ...defaults, ...options };

        // Determine texture based on difficulty if not specified
        let texture = config.texture;
        if (!texture) {
            if (config.difficulty === 'hard') {
                texture = 'blockHard';
            } else if (config.difficulty === 'medium') {
                texture = 'blockMedium';
            } else {
                texture = 'blockEasy';
            }
        }

        super(scene, x, y, texture);

        this.problem = null;
        this.text = null;
        this.difficulty = config.difficulty;

        // Store strategies and behaviors
        this.ballReleaseStrategy = config.ballReleaseStrategy;
        this.specialEffect = config.specialEffect;
        this.scoreMultiplier = config.scoreMultiplier;

        // Set math problem based on difficulty
        this.setMathProblem(config.difficulty);
    }

    /**
     * Set a math problem for this block
     * @param {string} difficulty - The difficulty level ('easy', 'medium', or 'hard')
     */
    setMathProblem(difficulty) {
        // Create the appropriate math problem based on difficulty using the new API
        this.problem = createMathProblem(difficulty);

        // Create text display for the problem
        if (this.text) {
            this.text.destroy();
        }

        // Get the expression using the new API
        const expression = getProblemExpression(this.problem);

        this.text = this.scene.add.text(this.x, this.y, expression, {
            fontSize: '16px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setData('blockRef', this.sprite);

        // Store problem in the sprite for collision handling
        this.sprite.setData('problem', this.problem);
    }

    /**
     * Check if the answer matches this block's problem
     * @param {number} answer - The answer to check
     * @returns {boolean} Whether the answer is correct
     */
    checkAnswer(answer) {
        return this.problem && validateAnswer(this.problem, answer);
    }

    /**
     * Release balls according to the block's strategy
     * @returns {Array} Array of created balls
     */
    releaseBalls() {
        const paddleX = this.scene.paddle.getX();
        const paddleY = this.scene.paddle.getY();
        return this.ballReleaseStrategy.execute(this.scene, paddleX, paddleY, this.x, this.y);
    }

    /**
     * Apply special effect when block is hit
     * @param {Ball} ball - The ball that hit this block
     */
    applySpecialEffect(ball) {
        if (this.specialEffect) {
            this.specialEffect(this.scene, ball, this);
        }
    }

    /**
     * Get the column index of this block
     * @returns {number} Column index
     */
    getColumn() {
        return Helpers.getBlockColumn(this.x);
    }

    /**
     * Handle collision with a ball
     * @param {Ball} ball - The ball that hit this block
     * @returns {number} Score for destroying this block
     */
    onHit(ball) {
        // Apply any special effects
        this.applySpecialEffect(ball);

        // Clean up text when block is destroyed
        if (this.text) {
            this.text.destroy();
        }

        super.destroy();

        // Return score based on difficulty and multiplier using the new API
        return this.problem ?
            getPoints(this.problem) * this.scoreMultiplier :
            10 * this.scoreMultiplier;
    }

    /**
     * Destroy this block
     */
    destroy() {
        if (this.text) {
            this.text.destroy();
        }
        super.destroy();
    }
}