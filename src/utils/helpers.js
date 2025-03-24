import GameConfig from '../config/gameConfig.js';

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
        const startX = GameConfig.layout.blockGrid.startX;
        const spacing = GameConfig.layout.blockGrid.spacing;
        return Math.floor((x - startX) / spacing);
    },
};

export default Helpers;