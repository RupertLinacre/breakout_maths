/**
 * Central configuration for the Breakout Maths Game
 * Contains difficulty settings and year ranges for math problems
 */
const GameConfig = {
    // Default difficulty level
    difficulty: 'year1',

    // Year ranges for each difficulty tier
    // These map to the problem difficulty levels in the maths-game-problem-generator
    yearRanges: {
        reception: ['reception', 'reception', 'year1', 'year2'],
        year1: ['reception', 'year1', 'year2', 'year3'],
        year2: ['year1', 'year2', 'year3', 'year4'],
        year3: ['year2', 'year3', 'year4', 'year5'],
        year4: ['year3', 'year4', 'year5', 'year6'],
    },

    // Single spawn rate distribution - always the same pattern
    // The actual year levels will be mapped based on the selected difficulty tier
    spawnRateDistribution: [0.60, 0.15, 0.15, 0.10],

    // Methods to access configuration
    getDifficulty: function () {
        return this.difficulty;
    },

    setDifficulty: function (newDifficulty) {
        if (this.yearRanges[newDifficulty]) {
            this.difficulty = newDifficulty;
            return true;
        }
        return false;
    },

    getYearRange: function (difficultyTier) {
        const tier = difficultyTier || this.difficulty;
        return this.yearRanges[tier] || this.yearRanges.year1;
    },

    getSpawnRates: function (difficultyTier) {
        const tier = difficultyTier || this.difficulty;
        const yearRange = this.getYearRange(tier);

        // Create a spawn rates object that maps each year level to its probability
        const rates = {};
        yearRange.forEach((yearLevel, index) => {
            // Convert year level to uppercase for consistency with existing code
            const key = yearLevel.toUpperCase();
            rates[key] = this.spawnRateDistribution[index] || 0;
        });

        return rates;
    }
};

export default GameConfig;