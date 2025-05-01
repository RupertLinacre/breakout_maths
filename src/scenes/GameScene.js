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

        // --- Launch Angle and Barrel State ---
        this.launchAngle = -90; // Initial angle (straight up in degrees)
        this.minLaunchAngle = -179; // Min angle (degrees)
        this.maxLaunchAngle = -1; // Max angle (degrees)
        this.angleAdjustSpeed = 1; // Degrees per frame adjustment
        this.barrelGraphics = null; // Will hold the graphics object
        this.barrelLength = 75; // Length of the indicator line
        // ------------------------------------------------

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

        // Reset barrel/aim state
        this.resetBarrelState();

        // Setup game groups
        this.blocks = this.physics.add.staticGroup();
        this.balls = this.physics.add.group();

        // destroy any ball that leaves the bottom of the world
        this.physics.world.on('worldbounds', (body, up, down) => {
            if (down && body.gameObject) {
                body.gameObject.destroy();
            }
        });

        // Create paddle - center it horizontally based on game width
        const gameWidth = GameConfig.layout.gameWidth;
        this.paddle = new Paddle(this, gameWidth / 2, GameConfig.layout.paddle.initialY);

        // --- Add Barrel Graphics ---
        this.barrelGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff } });
        // ---------------------------

        // Create blocks grid
        this.createBlockGrid();

        // Input handling
        this.cursors = this.input.keyboard.createCursorKeys(); // Ensure cursors include UP/DOWN

        // Setup collisions
        this.physics.add.collider(this.balls, this.blocks, this.handleBallBlockCollision, null, this);

        // Get reference to UI scene
        this.uiScene = this.scene.get('UIScene');

        console.log("Game Scene Create Complete");
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
        if (!this.gameInProgress || column < 0 || column >= this.blockGrid.length) return;

        // Find the lowest active block in this column
        let lowestBlockInstance = null;
        let lowestBlockRow = -1;

        // Find the lowest block instance in the grid column
        for (let row = this.blockGrid[column].length - 1; row >= 0; row--) {
            const block = this.blockGrid[column][row];
            if (block && block.sprite && block.sprite.active) {
                lowestBlockInstance = block;
                lowestBlockRow = row;
                break;
            }
        }

        // If no blocks left in this column, nothing to do
        if (!lowestBlockInstance) return;

        const x = lowestBlockInstance.x;
        const y = lowestBlockInstance.y;

        // --- Ensure the instance being replaced is destroyed ---
        lowestBlockInstance.destroy(); // Calls the instance's destroy (handles sprite/text)
        this.blockGrid[column][lowestBlockRow] = null; // Clear grid reference
        // Remove from mathBlocks tracking array if it was there
        this.mathBlocks = this.mathBlocks.filter(b => b !== lowestBlockInstance);
        // -------------------------------------------------------

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

        // Create a math block using the factory
        const mathBlock = BlockFactory.createMathBlock(this, x, y, difficulty);

        if (!mathBlock || !mathBlock.sprite) {
            console.error(`Failed to create MathBlock replacement in column ${column}`);
            return;
        }

        // Update the grid reference
        this.blockGrid[column][lowestBlockRow] = mathBlock;

        // Add to math blocks array for tracking
        this.mathBlocks.push(mathBlock);
    }

    /**
     * Update game state
     */
    update(time, delta) {
        if (!this.gameInProgress) return;

        // --- Angle Adjustment Input ---
        if (this.cursors.up.isDown) {
            this.launchAngle -= this.angleAdjustSpeed;
        } else if (this.cursors.down.isDown) {
            this.launchAngle += this.angleAdjustSpeed;
        }
        // Clamp the angle
        this.launchAngle = Phaser.Math.Clamp(this.launchAngle, this.minLaunchAngle, this.maxLaunchAngle);
        // ----------------------------

        // Update paddle position based on input
        this.paddle.update(this.cursors); // Pass full cursors object

        // --- Update Barrel Visualization ---
        this.barrelGraphics.clear(); // Clear previous frame's line
        if (this.paddle && this.paddle.sprite) { // Check if paddle exists
            const paddleX = this.paddle.getX();
            const paddleY = this.paddle.getY();
            const angleRad = Phaser.Math.DegToRad(this.launchAngle); // Convert angle to radians
            const endX = paddleX + this.barrelLength * Math.cos(angleRad);
            const endY = paddleY + this.barrelLength * Math.sin(angleRad);
            // Use the orange color from GameConfig for the barrel
            this.barrelGraphics.lineStyle(2, GameConfig.layout.blockColors.year1);
            this.barrelGraphics.lineBetween(paddleX, paddleY, endX, endY);
        }
        // ---------------------------------

        // Check for paddle-ball collisions
        this.physics.overlap(this.paddle.sprite, this.balls, (paddleSprite, ballSprite) => {
            // Only apply deflection if the deflectsBalls option is enabled
            if (GameConfig.layout.paddle.deflectsBalls) {
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
            }
        });

        // Check for victory condition
        if (this.blocks.countActive() === 0) {
            this.victory();
        }
    }

    /**
     * Handle collision between a ball and a block
     * @param {Phaser.Physics.Arcade.Sprite} ballSprite - The ball sprite
     * @param {Phaser.Physics.Arcade.Sprite} blockSprite - The block sprite
     */
    handleBallBlockCollision(ballSprite, blockSprite) {
        if (!ballSprite.active || !blockSprite.active) {
            return; // Ignore collision if either object is already inactive
        }

        const block = this.findBlockBySprite(blockSprite);
        if (!block) {
            console.warn("Collision with unknown block sprite:", blockSprite);
            return;
        }

        const col = block.getColumn(); // Get column BEFORE potential destruction

        // --- Step 3 (Correction): Simplified Collision Logic ---
        // Original behavior: ANY block is destroyed by ball collision.
        console.log(`Collision: Block type ${block.constructor.name} at column ${col} hit.`);

        // 1. Get points from the block's onHit method (which no longer destroys)
        const pointsAwarded = block.onHit(ballSprite.getData('ballInstance'));

        // 2. Destroy the block instance (handles sprite/text cleanup)
        block.destroy();

        // 3. Update score if points were awarded
        if (pointsAwarded > 0 && this.uiScene) {
            this.uiScene.updateScore(pointsAwarded);
        }
        // -------------------------------------------------------

        // If it was a MathBlock that got destroyed, remove from tracking array
        // and assign a new math problem to the column
        if (block instanceof MathBlock) {
            console.log(`MathBlock destroyed in column ${col}. Assigning new problem.`);
            this.mathBlocks = this.mathBlocks.filter(b => b !== block);

            // Only assign a new math problem if the destroyed block was a MathBlock
            this.assignMathProblemToColumn(col);
        } else {
            console.log(`Regular Block destroyed in column ${col}. No problem regeneration needed.`);
            // For regular blocks, make sure to update the grid reference but don't regenerate math problems
            let row = -1;
            if (this.blockGrid[col]) {
                row = this.blockGrid[col].findIndex(b => b === block);
                if (row !== -1) {
                    this.blockGrid[col][row] = null; // Clear the grid reference
                }
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
        let newlySolvedBlocks = []; // Track blocks solved *this time*
        let ballsReleasedFromAny = false; // Track if any block released balls
        let totalPointsFromNew = 0; // Accumulate points only from newly solved blocks

        // 1. Iterate through ALL active math blocks
        for (let i = 0; i < this.mathBlocks.length; i++) {
            const block = this.mathBlocks[i];

            // Check only if block is valid, active and the answer matches
            if (block && block.sprite && block.sprite.active && block.checkAnswer(answer)) {

                // 2. Always release balls if the answer matches
                console.log(`Answer matched for block at [${block.getColumn()}, ?]. Releasing balls.`);
                block.releaseBalls();
                ballsReleasedFromAny = true; // Mark that *some* action happened

                // 3. Check if it's the FIRST time this block is being solved
                if (!block.isSolved) {
                    console.log(`Block at [${block.getColumn()}, ?] is newly solved.`);
                    block.isSolved = true;
                    if (block.sprite) {
                        block.sprite.setTint(0xaaaaaa); // Visual feedback
                    }

                    // Calculate points for this newly solved block
                    const points = block.problem ? (block.problem.answer * 10) * block.scoreMultiplier : 20;
                    totalPointsFromNew += points; // Add to total for this answer submission
                    newlySolvedBlocks.push(block); // Add to list for potential message customization
                }
                // If block was already solved, we just release balls (handled above) and do nothing else here.
            }
        }

        // 4. Process results after checking all blocks
        if (ballsReleasedFromAny) {
            // An action occurred (either new solve or re-answer ball release)

            // Update score ONLY with points from newly solved blocks
            if (totalPointsFromNew > 0 && this.uiScene) {
                this.uiScene.updateScore(totalPointsFromNew);
            }

            // Show a message indicating success
            let message = "Correct!";
            if (totalPointsFromNew > 0) {
                message += ` +${totalPointsFromNew}`;
                if (newlySolvedBlocks.length > 1) {
                    message += ` (${newlySolvedBlocks.length} blocks solved)`;
                } else if (newlySolvedBlocks.length === 1) {
                    message += ` (1 block solved)`;
                }
            } else {
                message += " (Balls released)"; // Indicate re-answer success
            }
            this.showMessage(message, '#27ae60');

            // --- assignMathProblemToColumn is NOT called here ---

            return { correct: true, points: totalPointsFromNew }; // Return success

        } else {
            // No block matched the answer at all
            if (this.uiScene) {
                this.uiScene.updateScore(-5); // Penalty
            }
            this.showMessage('Try again!', '#e74c3c');
            return { correct: false, points: 0 }; // Return failure
        }
    }

    /**
     * Show a message to the player
     * @param {string} text - Message text
     * @param {string} color - Text color (hex)
     */
    showMessage(text, color) {
        if (this.uiScene && this.uiScene.showMessage) {
            this.uiScene.showMessage(text, color);
        }
    }

    /**
     * Shoot a ball from the paddle
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     * @param {number|object} targetXorDirection - Either target X coordinate or direction vector {x, y}
     * @param {number} [targetY] - Target Y coordinate (if first param is X)
     * @param {number} [speed] - Optional speed for this specific ball.
     * @returns {Ball} The created ball
     */
    shootBall(x, y, targetXorDirection, targetY, speed) {
        const ball = new Ball(this, x, y);
        ball.shoot(targetXorDirection, targetY, speed);
        return ball;
    }

    /**
     * Handle victory
     */
    victory() {
        if (!this.gameInProgress) return;

        this.gameInProgress = false;
        this.physics.pause();

        // Tell UI Scene to show victory screen
        const uiScene = this.scene.get('UIScene'); // Get sibling scene
        uiScene.showVictory();
    }

    /**
     * Restart the game
     */
    restartGame() {
        // Clean up existing game objects
        this.cleanupGameObjects();

        // Reset difficulty to current configuration values
        this.resetDifficulty();

        // Reset barrel/aim state
        this.resetBarrelState();

        // Reset game state
        this.gameInProgress = true;
        this.physics.resume();

        // Recreate game objects
        this.createBlockGrid();

        // Recreate paddle with updated layout settings
        const gameWidth = GameConfig.layout.gameWidth;
        this.paddle = new Paddle(this, gameWidth / 2, GameConfig.layout.paddle.initialY);

        // Re-establish collision detection
        this.physics.add.collider(this.balls, this.blocks, this.handleBallBlockCollision, null, this);

        // Reset UI scene if it exists
        if (this.scene.get('UIScene')) {
            const uiScene = this.scene.get('UIScene');

            // Reset score
            if (uiScene.score !== undefined) {
                uiScene.resetScoreDisplay?.() || (uiScene.score = 0, uiScene.scoreText?.setText('Score: 0'));
            }

            // Clear any messages
            if (uiScene.messageText) {
                uiScene.messageText.setText('');
            }

            // Trigger a resize event to ensure all UI elements are properly positioned
            const width = this.game.config.width;
            const height = this.game.config.height;
            this.game.events.emit('resize', width, height);
        }

        // Tell UI Controller to focus the input
        if (this.uiController) {
            this.uiController.focusInput();
        }

        // Log that the game has been restarted with the new difficulty
        console.log(`Game restarted with difficulty: ${GameConfig.getDifficulty()}`);
    }

    /**
     * Clean up game objects for restart
     */
    cleanupGameObjects() {
        console.log("Cleaning up game objects...");

        try {
            // Remove all collision handlers first
            if (this.physics.world) {
                this.physics.world.colliders.destroy();
            }

            // Clean up Balls (using instance destroy from previous improvements)
            if (this.balls) {
                const ballSpritesToClean = this.balls.getChildren();
                ballSpritesToClean.forEach(ballSprite => {
                    const ballInstance = ballSprite.getData('ballInstance');
                    if (ballInstance) ballInstance.destroy();
                    else if (ballSprite.active) ballSprite.destroy();
                });
                this.balls.clear(true, true);
            }

            // --- Clean up Blocks using grid instances ---
            console.log("Cleaning up blocks from grid...");
            if (this.blockGrid && this.blockGrid.length > 0) {
                for (let col = 0; col < this.blockGrid.length; col++) {
                    if (this.blockGrid[col]) {
                        for (let row = 0; row < this.blockGrid[col].length; row++) {
                            const block = this.blockGrid[col][row];
                            // Check if it's a valid block instance with a destroy method
                            if (block && typeof block.destroy === 'function') {
                                block.destroy(); // Call instance destroy (handles text)
                            }
                            // No need to nullify grid[col][row] here, whole array is reset below
                        }
                    }
                }
            }
            this.blockGrid = []; // Reset the grid tracking array
            this.mathBlocks = []; // Reset the specific mathblock tracking array

            // Also ensure the physics group for blocks is cleared of sprites
            if (this.blocks) {
                this.blocks.clear(true, true); // Destroy any remaining sprites in the group
            }
            console.log("Block cleanup finished.");
            // -------------------------------------------

            // Destroy barrel graphics
            if (this.barrelGraphics) {
                this.barrelGraphics.destroy();
                this.barrelGraphics = null;
            }

            // Destroy the paddle if it exists
            if (this.paddle) {
                this.paddle.destroy();
                this.paddle = null;
            }
            console.log("Cleanup complete.");
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

    /**
     * Set the number of columns and restart the game, resizing the canvas as needed
     * @param {number} newColCount
     */
    setNumColumnsAndRestart(newColCount) {
        // Update config
        GameConfig.blockGrid.columns = newColCount;
        // Recompute layout
        GameConfig.updateLayout();
        // Reset score in UI scene if available
        const uiScene = this.scene.get('UIScene');
        if (uiScene && typeof uiScene.resetScoreDisplay === 'function') {
            uiScene.resetScoreDisplay();
        }
        // Resize the game canvas to match new layout
        const newWidth = GameConfig.layout.gameWidth;
        const newHeight = GameConfig.layout.gameHeight;
        this.scale.resize(newWidth, newHeight);
        // Restart this scene (full reset)
        this.scene.restart();
    }

    /**
     * Set the number of rows and restart the game, resizing the canvas as needed
     * @param {number} newRowCount
     */
    setNumRowsAndRestart(newRowCount) {
        GameConfig.blockGrid.rows = newRowCount;
        GameConfig.updateLayout();
        const uiScene = this.scene.get('UIScene');
        if (uiScene && typeof uiScene.resetScoreDisplay === 'function') {
            uiScene.resetScoreDisplay();
        }
        const newWidth = GameConfig.layout.gameWidth;
        const newHeight = GameConfig.layout.gameHeight;
        this.scale.resize(newWidth, newHeight);
        this.scene.restart();
    }

    /**
     * Set the top padding and restart the game, resizing the canvas as needed
     * @param {number} newTopPadding
     */
    setTopPaddingAndRestart(newTopPadding) {
        GameConfig.blockGrid.topPadding = newTopPadding;
        GameConfig.updateLayout();
        const uiScene = this.scene.get('UIScene');
        if (uiScene && typeof uiScene.resetScoreDisplay === 'function') {
            uiScene.resetScoreDisplay();
        }
        const newWidth = GameConfig.layout.gameWidth;
        const newHeight = GameConfig.layout.gameHeight;
        this.scale.resize(newWidth, newHeight);
        this.scene.restart();
    }

    /**
     * Set the side padding and restart the game, resizing the canvas as needed
     * @param {number} newSidePadding
     */
    setSidePaddingAndRestart(newSidePadding) {
        GameConfig.blockGrid.sidePadding = newSidePadding;
        GameConfig.updateLayout();
        const uiScene = this.scene.get('UIScene');
        if (uiScene && typeof uiScene.resetScoreDisplay === 'function') {
            uiScene.resetScoreDisplay();
        }
        const newWidth = GameConfig.layout.gameWidth;
        const newHeight = GameConfig.layout.gameHeight;
        this.scale.resize(newWidth, newHeight);
        this.scene.restart();
    }

    /**
     * Reset the barrel/aim state (angle, graphics, etc.)
     */
    resetBarrelState() {
        // Destroy old graphics if they exist
        if (this.barrelGraphics) {
            this.barrelGraphics.destroy();
            this.barrelGraphics = null;
        }
        this.launchAngle = -90; // Initial angle (straight up)
        this.minLaunchAngle = -179;
        this.maxLaunchAngle = -1;
        this.angleAdjustSpeed = 1;
        this.barrelLength = 75;
        // Create new graphics if scene is active
        if (this.add && typeof this.add.graphics === 'function') {
            this.barrelGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff } });
        }
    }
}