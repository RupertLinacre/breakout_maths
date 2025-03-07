/**
 * Utility functions for the Math Breakout Game
 */
const Helpers = {
    /**
     * Generate a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    getRandomInt: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Calculate column index from x position
     * @param {number} x - X position
     * @returns {number} Column index
     */
    getBlockColumn: function (x) {
        return Math.floor((x - 65) / 74);
    },

    /**
     * Get a random difficulty based on probability
     * @param {number} mediumProbability - Probability of getting a medium problem (0-1)
     * @param {number} hardProbability - Probability of getting a hard problem (0-1)
     * @returns {string} 'easy', 'medium', or 'hard'
     */
    getRandomDifficulty: function (mediumProbability = 0.2, hardProbability = 0.05) {
        const rand = Math.random();
        if (rand < hardProbability) {
            return 'hard';
        } else if (rand < hardProbability + mediumProbability) {
            return 'medium';
        } else {
            return 'easy';
        }
    }
};