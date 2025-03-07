/**
 * Main game scene for gameplay logic
 */
class GameScene extends Phaser.Scene {
    /**
     * Create a new game scene
     */
    constructor() {
        super({ key: 'GameScene', active: true });
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
        // Setup game groups
        this.blocks = this.physics.add.staticGroup();
        this.balls = this.physics.add.group();

        // Create paddle - center it in the wider game area
        this.paddle = new Paddle(this, 625, 480);

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
            // Force specific difficulties for some columns to ensure we get a mix
            let forcedDifficulty = null;

            // Every third column is medium (red)
            if (col % 3 === 0) {
                forcedDifficulty = 'medium';
            }
            // Every fourth column is hard (purple)
            else if (col % 4 === 0) {
                forcedDifficulty = 'hard';
            }

            this.assignMathProblemToColumn(col, forcedDifficulty);
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

        // Force a more even distribution of difficulties
        // This ensures we get a good mix of all three types
        let difficulty;
        const rand = Math.random();

        if (forcedDifficulty) {
            difficulty = forcedDifficulty;
        } else {
            difficulty = rand < 0.33 ? 'easy' : rand < 0.66 ? 'medium' : 'hard';
        }

        // Determine if this should be a super special block (dark purple)
        // Only 10% chance for a super special block to avoid too many spray blocks
        let blockType = Math.random() < 0.1 ? 'super' : 'standard';

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
}