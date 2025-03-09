import Phaser from 'phaser';
import Paddle from '../entities/Paddle.js';
import Ball from '../entities/Ball.js';
import Block from '../entities/blocks/Block.js';
import MathBlock from '../entities/blocks/MathBlock.js';
import BlockFactory from '../factories/BlockFactory.js';
import { getPoints } from 'maths-game-problem-generator';

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
        RECEPTION: 0.60,  // 60% chance for reception blocks (was easy)
        YEAR1: 0.30,      // 30% chance for year1 blocks (was medium)
        YEAR2: 0.07,      // 7% chance for year2 blocks (was part of hard)
        YEAR3: 0.03       // 3% chance for year3 blocks (was part of hard)
    };

    /**
     * Current block difficulty spawn rates
     * These values can change during gameplay to adjust difficulty
     */
    static BLOCK_SPAWN_RATES = {
        // Initialize from DEFAULT_SPAWN_RATES instead of duplicating values
        RECEPTION: 0,  // Will be set in constructor
        YEAR1: 0,
        YEAR2: 0,
        YEAR3: 0
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
     * Generate textures for blocks and other game objects
     */
    generateTextures() {
        // Create a graphics object for generating textures
        const g = this.add.graphics();

        // Create paddle graphic with rounded corners using standard drawing methods
        g.fillStyle(0x3498db);

        // Draw a rounded rectangle manually
        const width = 100;
        const height = 20;
        const radius = 10;

        g.beginPath();
        // Start from top-right, moving counter-clockwise
        g.moveTo(width - radius, 0);
        // Top-right corner
        g.lineTo(radius, 0);
        g.arc(radius, radius, radius, -Math.PI / 2, Math.PI, true);
        // Bottom-left corner
        g.lineTo(0, height - radius);
        g.arc(radius, height - radius, radius, Math.PI, Math.PI / 2, true);
        // Bottom-right corner
        g.lineTo(width - radius, height);
        g.arc(width - radius, height - radius, radius, Math.PI / 2, 0, true);
        // Top-right corner
        g.lineTo(width, radius);
        g.arc(width - radius, radius, radius, 0, -Math.PI / 2, true);
        g.closePath();

        g.fillPath();
        g.generateTexture('paddle', width, height);
        g.clear();

        // Create ball graphic using standard drawing methods
        g.fillStyle(0xffffff);
        g.beginPath();
        g.arc(10, 10, 10, 0, Math.PI * 2);
        g.closePath();
        g.fillPath();
        g.generateTexture('ball', 20, 20);
        g.clear();

        // Generate block textures with different colors for different difficulties

        // Reception blocks - green
        g.fillStyle(0x2ecc71);
        g.fillRect(0, 0, 70, 30);
        g.generateTexture('blockEasy', 70, 30);
        g.clear();

        // Year 1 blocks - orange
        g.fillStyle(0xf39c12);
        g.fillRect(0, 0, 70, 30);
        g.generateTexture('blockMedium', 70, 30);
        g.clear();

        // Year 2 blocks - red
        g.fillStyle(0xe74c3c);
        g.fillRect(0, 0, 70, 30);
        g.generateTexture('blockHard', 70, 30);
        g.clear();

        // Year 3 blocks - purple
        g.fillStyle(0x9b59b6);
        g.fillRect(0, 0, 70, 30);
        g.generateTexture('blockVeryHard', 70, 30);
        g.clear();

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

            if (rand < rates.RECEPTION) {
                difficulty = 'reception';
            } else if (rand < rates.RECEPTION + rates.YEAR1) {
                difficulty = 'year1';
            } else if (rand < rates.RECEPTION + rates.YEAR1 + rates.YEAR2) {
                difficulty = 'year2';
            } else {
                difficulty = 'year3';
            }
        }

        // Destroy the regular block
        lowestBlock.destroy();

        // Create a math block using the factory
        const mathBlock = BlockFactory.createMathBlock(this, x, y, difficulty);

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
            const points = getPoints(targetBlock.problem);

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
     * Adjust difficulty rates for block spawning
     * @param {object} newRates - Object with new rates for each difficulty
     * @example
     * adjustDifficultyRates({ RECEPTION: 0.4, YEAR1: 0.4, YEAR2: 0.15, YEAR3: 0.05 });
     */
    adjustDifficultyRates(newRates) {
        // Update each rate that was provided
        if (newRates.RECEPTION !== undefined) GameScene.BLOCK_SPAWN_RATES.RECEPTION = newRates.RECEPTION;
        if (newRates.YEAR1 !== undefined) GameScene.BLOCK_SPAWN_RATES.YEAR1 = newRates.YEAR1;
        if (newRates.YEAR2 !== undefined) GameScene.BLOCK_SPAWN_RATES.YEAR2 = newRates.YEAR2;
        if (newRates.YEAR3 !== undefined) GameScene.BLOCK_SPAWN_RATES.YEAR3 = newRates.YEAR3;

        // Update math problems to reflect new rates
        this.updateMathProblems();
    }

    /**
     * Increase game difficulty by adjusting spawn rates
     */
    increaseDifficulty() {
        // Gradually shift probabilities toward harder problems
        const currentRates = GameScene.BLOCK_SPAWN_RATES;

        // Calculate new rates with more emphasis on harder problems
        const newRates = {
            RECEPTION: Math.max(0.1, currentRates.RECEPTION - 0.1),
            YEAR1: Math.min(0.5, currentRates.YEAR1 + 0.05),
            YEAR2: Math.min(0.3, currentRates.YEAR2 + 0.03),
            YEAR3: Math.min(0.2, currentRates.YEAR3 + 0.02)
        };

        // Apply the new rates
        this.adjustDifficultyRates(newRates);
    }

    /**
     * Reset difficulty to default values
     */
    resetDifficulty() {
        // Reset to default spawn rates
        GameScene.BLOCK_SPAWN_RATES.RECEPTION = GameScene.DEFAULT_SPAWN_RATES.RECEPTION;
        GameScene.BLOCK_SPAWN_RATES.YEAR1 = GameScene.DEFAULT_SPAWN_RATES.YEAR1;
        GameScene.BLOCK_SPAWN_RATES.YEAR2 = GameScene.DEFAULT_SPAWN_RATES.YEAR2;
        GameScene.BLOCK_SPAWN_RATES.YEAR3 = GameScene.DEFAULT_SPAWN_RATES.YEAR3;
    }
}