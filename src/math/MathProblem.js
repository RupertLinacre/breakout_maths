/**
 * Base class for math problems
 */
export default class MathProblem {
    /**
     * Create a new math problem
     * @param {string} difficulty - The difficulty level ('easy' or 'hard')
     */
    constructor(difficulty = 'easy') {
        this.difficulty = difficulty;
        this.expression = '';
        this.answer = 0;
        this.generate();
    }

    /**
     * Generate a math problem
     * This method should be overridden by subclasses
     */
    generate() {
        console.warn('MathProblem.generate() called on base class - should be overridden');
    }

    /**
     * Validate if the provided answer is correct
     * @param {number} userAnswer - The user's answer to check
     * @returns {boolean} Whether the answer is correct
     */
    validate(userAnswer) {
        return userAnswer === this.answer;
    }

    /**
     * Get the point value for this problem
     * @returns {number} Points for solving this problem
     */
    getPoints() {
        switch (this.difficulty) {
            case 'hard':
                return 50;
            case 'medium':
                return 30;
            default:
                return 20;
        }
    }

    /**
     * Factory method to create a math problem of the specified difficulty
     * @param {string} difficulty - The difficulty level ('easy', 'medium', or 'hard')
     * @returns {MathProblem} A new math problem instance
     */
    static create(difficulty) {
        // We'll use dynamic imports to avoid circular dependencies
        if (difficulty === 'hard') {
            // We'll handle this in MathBlock.js instead
            console.log("Creating hard math problem");
            return null; // This will be handled in MathBlock.js
        } else if (difficulty === 'medium') {
            console.log("Creating medium math problem");
            return null; // This will be handled in MathBlock.js
        } else {
            console.log("Creating easy math problem");
            return null; // This will be handled in MathBlock.js
        }
    }
}