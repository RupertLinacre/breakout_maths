import Phaser from 'phaser';
import Paddle from '../entities/Paddle.js';
import Ball from '../entities/Ball.js';
import Block from '../entities/blocks/Block.js';
import MathBlock from '../entities/blocks/MathBlock.js';
import BlockFactory from '../factories/BlockFactory.js';
import { generateProblem } from 'maths-game-problem-generator';
import GameConfig from '../config/gameConfig.js';

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
        RECEPTION: 0.50,  // 60% chance for reception blocks (was easy)
        YEAR1: 0.25,      // 30% chance for year1 blocks (was medium)
        YEAR2: 0.15,      // 7% chance for year2 blocks (was part of hard)
        YEAR3: 0.10       // 3% chance for year3 blocks (was part of hard)
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
        const width = GameConfig.layout.paddle.width;
        const height = GameConfig.layout.paddle.height;
        const radius = GameConfig.layout.paddle.cornerRadius;

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
        const ballRadius = GameConfig.layout.ball.size / 2;
        g.arc(ballRadius, ballRadius, ballRadius, 0, Math.PI * 2);
        g.closePath();
        g.fillPath();
        g.generateTexture('ball', GameConfig.layout.ball.size, GameConfig.layout.ball.size);
        g.clear();

        // Generate block textures with different colors for different difficulties
        const blockWidth = GameConfig.layout.blockGrid.blockWidth;
        const blockHeight = GameConfig.layout.blockGrid.blockHeight;

        // Reception blocks - green
        g.fillStyle(GameConfig.layout.blockColors.reception);
        g.fillRect(0, 0, blockWidth, blockHeight);
        g.generateTexture('blockEasy', blockWidth, blockHeight);
        g.clear();

        // Year 1 blocks - orange
        g.fillStyle(GameConfig.layout.blockColors.year1);
        g.fillRect(0, 0, blockWidth, blockHeight);
        g.generateTexture('blockMedium', blockWidth, blockHeight);
        g.clear();

        // Year 2 blocks - red
        g.fillStyle(GameConfig.layout.blockColors.year2);
        g.fillRect(0, 0, blockWidth, blockHeight);
        g.generateTexture('blockHard', blockWidth, blockHeight);
        g.clear();

        // Year 3 blocks - purple
        g.fillStyle(GameConfig.layout.blockColors.year3);
        g.fillRect(0, 0, blockWidth, blockHeight);
        g.generateTexture('blockVeryHard', blockWidth, blockHeight);
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
        const gameWidth = GameConfig.layout.gameWidth;
        this.paddle = new Paddle(this, gameWidth / 2, GameConfig.layout.paddle.initialY);

        // Create blocks grid
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
        const blockWidth = GameConfig.layout.blockGrid.blockWidth;
        const spacing = GameConfig.layout.blockGrid.spacing;
        const startX = GameConfig.layout.blockGrid.startX;
        const startY = GameConfig.layout.blockGrid.startY;
        const cols = GameConfig.layout.blockGrid.columns;
        const rows = GameConfig.layout.blockGrid.rows;
        const rowSpacing = GameConfig.layout.blockGrid.rowSpacing;

        // Clear existing blocks
        this.blockGrid = Array(cols).fill().map(() => Array(rows).fill(null));
        this.mathBlocks = [];

        // Create blocks
        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                const x = startX + col * spacing;
                const y = startY + row * rowSpacing;

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
            this.assignMathProblemToColumn(col);
        }
    }

    /**
     * Assign a math problem to the lowest block in a specific column
     * @param {number} column - Column index
     */
    assignMathProblemToColumn(column) {
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

        // Get the current year range and spawn rates from the game config
        const yearRange = GameConfig.getYearRange();
        const rates = GameConfig.getSpawnRates();

        // Use random number to select difficulty based on spawn rates
        const rand = Math.random();
        let cumulativeProbability = 0;
        let difficulty = yearRange[0]; // Default to first difficulty level

        // Find the appropriate difficulty level based on the random value
        for (let i = 0; i < yearRange.length; i++) {
            const yearLevel = yearRange[i].toUpperCase();
            cumulativeProbability += rates[yearLevel] || 0;

            if (rand < cumulativeProbability) {
                difficulty = yearRange[i];
                break;
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

        // Update paddle position based on input
        this.paddle.update(this.cursors);

        // Update all active balls
        const gameWidth = GameConfig.layout.gameWidth;
        const gameHeight = GameConfig.layout.gameHeight;

        this.balls.getChildren().forEach(ballSprite => {
            const ball = this.findBallBySprite(ballSprite);
            if (ball) {
                ball.update(gameWidth, gameHeight);
            }
        });

        // Check for paddle-ball collisions
        this.physics.overlap(this.paddle.sprite, this.balls, (paddleSprite, ballSprite) => {
            // Get ball velocity
            const vx = ballSprite.body.velocity.x;
            const vy = ballSprite.body.velocity.y;

            // Only bounce if ball is moving downward (prevents multiple bounces)
            if (vy > 0) {
                // Calculate bounce angle based on where ball hits the paddle
                const hitPoint = (ballSprite.x - paddleSprite.x) / (paddleSprite.width / 2);

                // Constrain hit point to -1 to 1 range
                const constrainedHitPoint = Phaser.Math.Clamp(hitPoint, -1, 1);

                // Calculate new angle (between -60 and 60 degrees)
                const angle = constrainedHitPoint * Math.PI / 3; // 60 degrees in radians

                // Calculate new velocity components
                const speed = Math.sqrt(vx * vx + vy * vy);
                const newVx = Math.sin(angle) * speed;
                const newVy = -Math.cos(angle) * speed;

                // Apply new velocity
                ballSprite.body.setVelocity(newVx, newVy);
            }
        });

        // Check for victory condition
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
            // Calculate points based on the problem's answer
            const points = targetBlock.problem.answer * 10;

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

        // Reset difficulty to current configuration values
        this.resetDifficulty();

        // Reset game state
        this.gameInProgress = true;
        this.physics.resume();

        // Recreate game objects
        this.createBlockGrid();

        // Re-establish collision detection
        this.physics.add.collider(this.balls, this.blocks, this.handleBallBlockCollision, null, this);

        // Reset UI scene if it exists
        if (this.scene.get('UIScene')) {
            const uiScene = this.scene.get('UIScene');
            if (uiScene.score) {
                uiScene.score = 0;
                uiScene.scoreText.setText('Score: 0');
            }
            if (uiScene.messageText) {
                uiScene.messageText.setText('');
            }
        }

        // Log that the game has been restarted with the new difficulty
        console.log(`Game restarted with difficulty: ${GameConfig.getDifficulty()}`);
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
        // Get spawn rates from the game config based on current difficulty
        const configRates = GameConfig.getSpawnRates();

        // Reset to configured spawn rates
        GameScene.BLOCK_SPAWN_RATES.RECEPTION = configRates.RECEPTION;
        GameScene.BLOCK_SPAWN_RATES.YEAR1 = configRates.YEAR1;
        GameScene.BLOCK_SPAWN_RATES.YEAR2 = configRates.YEAR2;
        GameScene.BLOCK_SPAWN_RATES.YEAR3 = configRates.YEAR3;
    }

    /**
     * Change the game difficulty
     * @param {string} difficultyTier - The difficulty tier to set ('year1', 'year2', etc.)
     * @returns {boolean} Whether the difficulty was successfully changed
     */
    setGameDifficulty(difficultyTier) {
        // Attempt to set the difficulty in the game config
        const success = GameConfig.setDifficulty(difficultyTier);

        if (success) {
            // Update spawn rates based on the new difficulty
            this.resetDifficulty();

            // Update math problems to reflect the new difficulty
            this.updateMathProblems();

            return true;
        }

        return false;
    }
}