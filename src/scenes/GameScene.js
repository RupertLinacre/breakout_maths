import Phaser from 'phaser';
import Paddle from '../entities/Paddle.js';
import Ball from '../entities/Ball.js';
import Block from '../entities/blocks/Block.js';
import MathBlock from '../entities/blocks/MathBlock.js';
import BlockFactory from '../factories/BlockFactory.js';

/**
 * Main game scene for gameplay logic
 */
export default class GameScene extends Phaser.Scene {
    /**
     * Default block difficulty spawn rates
     * These constants control the base probability of each difficulty level
     * and are used for initialization and resets
     */
    static DEFAULT_SPAWN_RATES = {
        EASY: 0.60,    // 60% chance for easy blocks
        MEDIUM: 0.30,  // 30% chance for medium blocks
        HARD: 0.10,    // 10% chance for hard blocks
        SUPER: 0.05    // 5% chance for super special blocks (independent of difficulty)
    };

    /**
     * Current block difficulty spawn rates
     * These values can change during gameplay to adjust difficulty
     */
    static BLOCK_SPAWN_RATES = {
        // Initialize from DEFAULT_SPAWN_RATES instead of duplicating values
        EASY: 0,    // Will be set in constructor
        MEDIUM: 0,
        HARD: 0,
        SUPER: 0
    };

    /**
     * Create a new game scene
     */
    constructor() {
        super({ key: 'GameScene', active: true });

        // Initialize BLOCK_SPAWN_RATES from DEFAULT_SPAWN_RATES
        // This avoids redundancy and ensures values are only defined once
        this.resetDifficulty();

        this.gameInProgress = true;
        this.blockGrid = [];
        this.mathBlocks = [];
    }

    /**
     * Preload game assets
     */
    preload() {
        // Generate textures on the fly
        this.generateTextures();

        // Add a console log to verify scene loading
        console.log("Game Scene Loaded");
    }

    /**
     * Generate game textures
     */
    generateTextures() {
        // Create paddle graphic
        let g = this.add.graphics();
        g.fillStyle(0x3498db);
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(80, 0);
        g.lineTo(64, 20);
        g.lineTo(16, 20);
        g.closePath();
        g.fillPath();
        g.generateTexture('paddle', 80, 20);
        g.clear();

        // Create ball
        g.fillStyle(0x2ecc71);
        g.fillCircle(9, 9, 9);
        g.generateTexture('ball', 18, 18);
        g.clear();

        // Create blocks - make them wider (70px instead of 60px)
        // Easy blocks - green
        g.fillStyle(0x2ecc71);
        g.fillRect(0, 0, 70, 30);
        g.generateTexture('blockEasy', 70, 30);
        g.clear();

        // Medium blocks - red
        g.fillStyle(0xe74c3c);
        g.fillRect(0, 0, 70, 30);
        g.generateTexture('blockMedium', 70, 30);
        g.clear();

        // Hard blocks - purple
        g.fillStyle(0x9b59b6);
        g.fillRect(0, 0, 70, 30);
        g.generateTexture('blockHard', 70, 30);
        g.clear();

        // Create super special block - darker purple
        g.fillStyle(0x8e44ad);
        g.fillRect(0, 0, 70, 30);

        // Add some decoration to make it look special
        // g.fillStyle(0xf1c40f); // Yellow decorations

        // // Draw decorative circles instead of stars
        // g.fillCircle(15, 15, 5);
        // g.fillCircle(35, 15, 5);
        // g.fillCircle(55, 15, 5);

        g.generateTexture('blockSuper', 70, 30);
        g.destroy();
    }

    /**
     * Create game objects
     */
    create() {
        // Reset difficulty to initial values at the start of a new game
        this.resetDifficulty();

        // Setup game groups
        this.blocks = this.physics.add.staticGroup();
        this.balls = this.physics.add.group();

        // Create paddle - center it horizontally based on game width
        const gameWidth = this.game.config.width;
        this.paddle = new Paddle(this, gameWidth / 2, 480);

        // Create blocks grid (16x5)
        this.createBlockGrid();

        // Input handling
        this.cursors = this.input.keyboard.createCursorKeys();

        // Setup collisions
        this.physics.add.collider(this.balls, this.blocks, this.handleBallBlockCollision, null, this);

        // Get reference to UI scene
        this.uiScene = this.scene.get('UIScene');
    }

    /**
     * Create the block grid
     */
    createBlockGrid() {
        const blockWidth = 70;
        const spacing = 74;
        const startX = 65;
        const startY = 50;
        const cols = 16;
        const rows = 5;

        // Clear existing blocks
        this.blockGrid = Array(cols).fill().map(() => Array(rows).fill(null));
        this.mathBlocks = [];

        // Create blocks
        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                const x = startX + col * spacing;
                const y = startY + row * 40;

                // Create a regular block
                const block = new Block(this, x, y);
                this.blockGrid[col][row] = block;
            }
        }

        // Assign math problems to the bottom row
        this.updateMathProblems();
    }

    /**
     * Update math problems on blocks
     */
    updateMathProblems() {
        if (!this.gameInProgress) return;

        // Clear all existing math blocks
        this.mathBlocks.forEach(block => {
            if (block && block.sprite && block.sprite.active) {
                block.destroy();
            }
        });
        this.mathBlocks = [];

        // Assign problems to the lowest block in each column
        for (let col = 0; col < this.blockGrid.length; col++) {
            // We no longer force specific difficulties for columns
            // All difficulty distribution is handled by the spawn rate constants
            this.assignMathProblemToColumn(col, null);
        }
    }

    /**
     * Assign a math problem to the lowest block in a specific column
     * @param {number} column - Column index
     * @param {string|null} forcedDifficulty - Optional forced difficulty
     */
    assignMathProblemToColumn(column, forcedDifficulty) {
        if (!this.gameInProgress) return;

        // Find the lowest active block in this column
        const blocksInColumn = this.blockGrid[column].filter(block =>
            block && block.sprite && block.sprite.active
        );

        // If no blocks left in this column, nothing to do
        if (blocksInColumn.length === 0) return;

        // Sort by y position (descending) to find the lowest block
        blocksInColumn.sort((a, b) => b.y - a.y);
        const lowestBlock = blocksInColumn[0];

        // Replace the regular block with a math block
        const x = lowestBlock.x;
        const y = lowestBlock.y;

        // Determine difficulty based on spawn rates or forced difficulty
        let difficulty;
        if (forcedDifficulty) {
            difficulty = forcedDifficulty;
        } else {
            // Use spawn rate constants for probability distribution
            const rand = Math.random();
            const rates = GameScene.BLOCK_SPAWN_RATES;

            if (rand < rates.EASY) {
                difficulty = 'easy';
            } else if (rand < rates.EASY + rates.MEDIUM) {
                difficulty = 'medium';
            } else {
                difficulty = 'hard';
            }
        }

        // Determine if this should be a super special block
        // Use the SUPER spawn rate constant
        let blockType = Math.random() < GameScene.BLOCK_SPAWN_RATES.SUPER ? 'super' : 'standard';

        // Destroy the regular block
        lowestBlock.destroy();

        // Create a math block using the factory
        const mathBlock = BlockFactory.createMathBlock(this, x, y, blockType, difficulty);

        // Update the grid reference
        const row = Math.floor((y - 50) / 40);
        this.blockGrid[column][row] = mathBlock;

        // Add to math blocks array for tracking
        this.mathBlocks.push(mathBlock);
    }

    /**
     * Update game state
     */
    update() {
        if (!this.gameInProgress) return;

        // Update paddle
        this.paddle.update(this.cursors);

        // Update all balls
        const gameWidth = this.game.config.width;
        const gameHeight = this.game.config.height;

        this.balls.getChildren().forEach(ballSprite => {
            if (ballSprite.active) {
                // Find the Ball instance for this sprite
                const ball = this.findBallBySprite(ballSprite);
                if (ball) {
                    ball.update(gameWidth, gameHeight);
                }
            }
        });

        // Check if we need to initialize math problems
        if (this.gameInProgress && this.blocks.countActive() > 0) {
            const hasProblems = this.mathBlocks.some(block =>
                block && block.sprite && block.sprite.active
            );

            if (!hasProblems) {
                this.updateMathProblems();

                // Potentially increase difficulty when new problems are generated
                // This creates a progressive difficulty curve as the player advances
                if (this.score && this.score.getScore) {
                    const currentScore = this.score.getScore();

                    // Increase difficulty at certain score thresholds
                    // For example, every 1000 points
                    if (currentScore > 0 && currentScore % 1000 < 100) {
                        this.increaseDifficulty();
                    }
                }
            }
        }

        // Check for victory
        if (this.blocks.countActive() === 0) {
            this.victory();
        }
    }

    /**
     * Find a Ball instance by its sprite
     * @param {Phaser.Physics.Arcade.Sprite} sprite - The sprite to find
     * @returns {Ball|null} The Ball instance or null
     */
    findBallBySprite(sprite) {
        // This is a simplified approach - in a real implementation,
        // you might want to maintain a mapping of sprites to Ball instances
        return {
            sprite: sprite,
            update: (width, height) => {
                // Handle manual wall collisions (top, left, right only)
                if (sprite.x <= 0) {
                    sprite.x = 1;
                    sprite.body.velocity.x = Math.abs(sprite.body.velocity.x);
                } else if (sprite.x >= width - sprite.width) {
                    sprite.x = width - sprite.width - 1;
                    sprite.body.velocity.x = -Math.abs(sprite.body.velocity.x);
                }

                if (sprite.y <= 0) {
                    sprite.y = 1;
                    sprite.body.velocity.y = Math.abs(sprite.body.velocity.y);
                }

                // Remove balls that fall off screen (no bounce at bottom)
                if (sprite.y > height) {
                    sprite.destroy();
                }
            },
            destroy: () => {
                if (sprite && sprite.active) {
                    sprite.destroy();
                }
            }
        };
    }

    /**
     * Handle collision between a ball and a block
     * @param {Phaser.Physics.Arcade.Sprite} ballSprite - The ball sprite
     * @param {Phaser.Physics.Arcade.Sprite} blockSprite - The block sprite
     */
    handleBallBlockCollision(ballSprite, blockSprite) {
        // Find the Block instance for this sprite
        const block = this.findBlockBySprite(blockSprite);

        if (block) {
            // Get column information before destroying the block
            const col = block.getColumn();
            const hadMathProblem = block instanceof MathBlock;

            // Handle the hit
            const points = block.onHit();

            // Update score for ball hits (not for direct answer hits)
            if (!hadMathProblem) {
                this.uiScene.updateScore(points);
            }

            // If it had a math problem, assign a new math problem to the next block in this column
            if (hadMathProblem) {
                this.assignMathProblemToColumn(col);
            }
        }
    }

    /**
     * Find a Block instance by its sprite
     * @param {Phaser.Physics.Arcade.Sprite} sprite - The sprite to find
     * @returns {Block|null} The Block instance or null
     */
    findBlockBySprite(sprite) {
        // Search through all blocks in the grid
        for (let col = 0; col < this.blockGrid.length; col++) {
            for (let row = 0; row < this.blockGrid[col].length; row++) {
                const block = this.blockGrid[col][row];
                if (block && block.sprite === sprite) {
                    return block;
                }
            }
        }

        // Also check math blocks
        for (let i = 0; i < this.mathBlocks.length; i++) {
            if (this.mathBlocks[i] && this.mathBlocks[i].sprite === sprite) {
                return this.mathBlocks[i];
            }
        }

        return null;
    }

    /**
     * Check if the answer matches any math block
     * @param {number} answer - The answer to check
     * @returns {object} Result with correct flag and points
     */
    checkAnswer(answer) {
        // Find matching problem
        let targetBlock = null;

        for (let i = 0; i < this.mathBlocks.length; i++) {
            const block = this.mathBlocks[i];
            if (block && block.sprite && block.sprite.active && block.checkAnswer(answer)) {
                targetBlock = block;
                break;
            }
        }

        if (targetBlock) {
            const points = targetBlock.problem.getPoints();

            // Use the block's ball release strategy
            targetBlock.releaseBalls();

            return { correct: true, points: points };
        } else {
            return { correct: false, points: 0 };
        }
    }

    /**
     * Shoot a ball from the paddle
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     * @param {number|object} targetXorDirection - Either target X coordinate or direction vector {x, y}
     * @param {number} [targetY] - Target Y coordinate (if first param is X)
     * @returns {Ball} The created ball
     */
    shootBall(x, y, targetXorDirection, targetY) {
        const ball = new Ball(this, x, y);
        ball.shoot(targetXorDirection, targetY);
        return ball;
    }

    /**
     * Handle victory
     */
    victory() {
        if (!this.gameInProgress) return;

        this.gameInProgress = false;
        this.physics.pause();

        // Tell UI scene to show victory screen
        this.uiScene.showVictory();
    }

    /**
     * Restart the game
     */
    restartGame() {
        // Clean up existing game objects
        this.cleanupGameObjects();

        // Reset difficulty to initial values
        this.resetDifficulty();

        // Reset game state
        this.gameInProgress = true;
        this.physics.resume();

        // Recreate game objects
        this.createBlockGrid();

        // Re-establish collision detection
        this.physics.add.collider(this.balls, this.blocks, this.handleBallBlockCollision, null, this);
    }

    /**
     * Clean up game objects for restart
     */
    cleanupGameObjects() {
        try {
            // Remove all collision handlers first
            this.physics.world.colliders.destroy();

            // Safely destroy all game objects
            this.balls.clear(true, true);
            this.blocks.clear(true, true);

            // Clear block grid
            for (let col = 0; col < this.blockGrid.length; col++) {
                for (let row = 0; row < this.blockGrid[col].length; row++) {
                    const block = this.blockGrid[col][row];
                    if (block) {
                        block.destroy();
                        this.blockGrid[col][row] = null;
                    }
                }
            }

            // Clear math blocks
            this.mathBlocks.forEach(block => {
                if (block) block.destroy();
            });
            this.mathBlocks = [];
        } catch (e) {
            console.error("Error cleaning up game objects:", e);
        }
    }

    /**
     * Adjust the difficulty spawn rates
     * @param {object} newRates - Object with new rates for each difficulty
     * @example
     * // Make the game harder
     * adjustDifficultyRates({ EASY: 0.4, MEDIUM: 0.4, HARD: 0.2, SUPER: 0.1 });
     */
    adjustDifficultyRates(newRates) {
        // Update only the provided rates
        if (newRates.EASY !== undefined) GameScene.BLOCK_SPAWN_RATES.EASY = newRates.EASY;
        if (newRates.MEDIUM !== undefined) GameScene.BLOCK_SPAWN_RATES.MEDIUM = newRates.MEDIUM;
        if (newRates.HARD !== undefined) GameScene.BLOCK_SPAWN_RATES.HARD = newRates.HARD;
        if (newRates.SUPER !== undefined) GameScene.BLOCK_SPAWN_RATES.SUPER = newRates.SUPER;

        // Ensure probabilities sum to 1 for difficulties (not including SUPER which is independent)
        const total = GameScene.BLOCK_SPAWN_RATES.EASY +
            GameScene.BLOCK_SPAWN_RATES.MEDIUM +
            GameScene.BLOCK_SPAWN_RATES.HARD;

        if (total !== 1) {
            // Normalize the rates
            const factor = 1 / total;
            GameScene.BLOCK_SPAWN_RATES.EASY *= factor;
            GameScene.BLOCK_SPAWN_RATES.MEDIUM *= factor;
            GameScene.BLOCK_SPAWN_RATES.HARD *= factor;

            console.log('Difficulty rates normalized to sum to 1:', GameScene.BLOCK_SPAWN_RATES);
        }
    }

    /**
     * Increase game difficulty based on score or time
     * This makes the game progressively harder as the player advances
     */
    increaseDifficulty() {
        if (!this.gameInProgress) return;

        // Get current rates
        const rates = GameScene.BLOCK_SPAWN_RATES;

        // Gradually decrease easy blocks and increase medium/hard blocks
        // This is a simple linear progression - could be made more sophisticated
        const newRates = {
            EASY: Math.max(0.3, rates.EASY - 0.05),  // Decrease easy blocks but keep at least 30%
            MEDIUM: Math.min(0.5, rates.MEDIUM + 0.03),  // Increase medium blocks up to 50%
            HARD: Math.min(0.3, rates.HARD + 0.02),  // Increase hard blocks up to 30%
            SUPER: Math.min(0.15, rates.SUPER + 0.01)  // Slightly increase super blocks up to 15%
        };

        this.adjustDifficultyRates(newRates);

        console.log('Difficulty increased:', GameScene.BLOCK_SPAWN_RATES);
    }

    /**
     * Reset difficulty to initial values
     * Call this when starting a new game
     */
    resetDifficulty() {
        // Reset to initial values from DEFAULT_SPAWN_RATES
        const defaults = GameScene.DEFAULT_SPAWN_RATES;
        GameScene.BLOCK_SPAWN_RATES.EASY = defaults.EASY;
        GameScene.BLOCK_SPAWN_RATES.MEDIUM = defaults.MEDIUM;
        GameScene.BLOCK_SPAWN_RATES.HARD = defaults.HARD;
        GameScene.BLOCK_SPAWN_RATES.SUPER = defaults.SUPER;

        console.log('Difficulty reset to initial values:', GameScene.BLOCK_SPAWN_RATES);
    }
}