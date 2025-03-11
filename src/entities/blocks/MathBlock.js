import Block from './Block.js';
import { generateProblem, checkAnswer, YEAR_LEVELS } from 'maths-game-problem-generator';
import { StandardBallReleaseStrategy, MultiBallReleaseStrategy, ArcBallReleaseStrategy } from '../../strategies/BallReleaseStrategy.js';
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
            difficulty: 'reception',
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
            if (config.difficulty === 'year3') {
                texture = 'blockVeryHard';
            } else if (config.difficulty === 'year2') {
                texture = 'blockHard';
            } else if (config.difficulty === 'year1') {
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
     * @param {string} difficulty - The difficulty level ('reception', 'year1', 'year2', or 'year3')
     */
    setMathProblem(difficulty) {
        // Create the appropriate math problem based on difficulty using the new API
        this.problem = generateProblem({ yearLevel: difficulty });

        // Create text display for the problem
        if (this.text) {
            this.text.destroy();
        }

        // Get the expression from the problem object
        const expression = this.problem.expression;
        console.log(expression);
        if (expression.includes('undefined')) {
            debugger;
        }

        // Handle text that might be too big for blocks
        let displayText = expression;
        let fontSize = '16px';

        // Check if expression is too long (more than 7 characters)
        if (displayText.length > 7) {
            // First try removing spaces
            displayText = displayText.replace(/\s+/g, '');

            // If it's still too long, reduce font size
            if (displayText.length > 7) {
                fontSize = '14px';
            }
        }

        this.text = this.scene.add.text(this.x, this.y, displayText, {
            fontSize: fontSize,
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
        return this.problem && checkAnswer(this.problem, answer);
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

        // Return score based on difficulty and multiplier
        return this.problem ?
            (this.problem.answer * 10) * this.scoreMultiplier :
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