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

    // Game layout configuration
    layout: (function () {
        // Define base block grid parameters
        const blockGridBase = {
            columns: 30,
            rows: 10,
            blockWidth: 70,
            blockHeight: 30,
            spacing: 74,
            rowSpacing: 40,
            sidePadding: 35,  // Explicit padding on left and right sides
        };

        // Compute gameWidth and startX
        const gameWidth = 2 * blockGridBase.sidePadding +
            (blockGridBase.columns - 1) * blockGridBase.spacing +
            blockGridBase.blockWidth;
        const startX = blockGridBase.sidePadding + blockGridBase.blockWidth / 2;

        // Return the complete layout configuration
        return {
            // Game dimensions - gameWidth is now dynamically computed
            gameWidth: gameWidth,
            gameHeight: 600,

            // Block grid configuration
            blockGrid: {
                ...blockGridBase,
                startX: startX,  // Computed startX based on sidePadding
                startY: 50,
            },

            // Paddle configuration
            paddle: {
                width: 100,
                height: 20,
                initialY: 480,
                speed: 7,
                cornerRadius: 10
            },

            // Ball configuration
            ball: {
                size: 20,
                speed: 300
            },

            // UI element positions
            ui: {
                scoreText: {
                    x: 20,
                    yOffsetFromBottom: 70
                },
                messageText: {
                    xFactor: 0.5, // Center horizontally
                    yOffsetFromBottom: 40
                },
                answerInput: {
                    xFactor: 0.5, // Center horizontally
                    yOffsetFromBottom: 70,
                    width: 100,
                    padding: 10,
                    borderWidth: 120,
                    borderHeight: 44
                }
            },

            // Block colors
            blockColors: {
                reception: 0x2ecc71, // Green
                year1: 0xf39c12,     // Orange
                year2: 0xe74c3c,     // Red
                year3: 0x9b59b6      // Purple
            }
        };
    })(),

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