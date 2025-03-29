import Phaser from 'phaser';
import GameConfig from '../config/gameConfig.js';

/**
 * Scene for handling UI elements
 */
export default class UIScene extends Phaser.Scene {
    /**
     * Create a new UI scene
     */
    constructor() {
        super({ key: 'UIScene', active: true });
        this.score = 0;
        this.victoryElements = null;
        this.uiController = null; // Add property
    }

    /**
     * Create UI elements
     */
    create() {
        // Get reference to the UI Controller
        this.uiController = this.sys.game.config.uiController;

        // Get reference to the game scene
        this.gameScene = this.scene.get('GameScene');

        // Get game dimensions from config
        const gameWidth = GameConfig.layout.gameWidth;
        const gameHeight = GameConfig.layout.gameHeight;

        // Position score text using config values
        const scoreX = GameConfig.layout.ui.scoreText.x;
        const scoreY = gameHeight - GameConfig.layout.ui.scoreText.yOffsetFromBottom;
        this.scoreText = this.add.text(scoreX, scoreY, 'Score: 0', { fontSize: '24px' });

        // Position message text using config values
        const messageX = gameWidth * GameConfig.layout.ui.messageText.xFactor;
        const messageY = gameHeight - GameConfig.layout.ui.messageText.yOffsetFromBottom;
        this.messageText = this.add.text(messageX, messageY, '', { fontSize: '24px' }).setOrigin(0.5);

        // Add a console log to verify scene loading
        console.log("UI Scene Loaded");

        // Listen for resize events
        this.scale.on('resize', this.resize, this);
        this.game.events.on('resize', this.resize, this);

        // Setup input handling for Enter key (for victory screen)
        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.victoryElements) {
                this.restartFromVictory();
            }
        }, this);
    }

    /**
     * Submit the answer
     * @param {string} answer - The answer from the HTML input
     */
    submitAnswer(answer) {
        const parsedAnswer = parseFloat(answer);
        if (isNaN(parsedAnswer)) return;

        // Tell the game scene to check the answer
        const result = this.gameScene.checkAnswer(parsedAnswer);

        if (result.correct) {
            // Update score
            this.updateScore(result.points);
            this.showMessage(`Correct! +${result.points}`, '#27ae60');
        } else {
            // Penalty for wrong answer
            this.updateScore(-5);
            this.showMessage('Try again!', '#e74c3c');
        }
    }

    /**
     * Update the score
     * @param {number} points - Points to add (negative for penalty)
     */
    updateScore(points) {
        this.score = Math.max(0, this.score + points);
        this.scoreText.setText(`Score: ${this.score}`);
    }

    /**
     * Reset score display
     * Added method for GameScene to call
     */
    resetScoreDisplay() {
        this.score = 0;
        if (this.scoreText) {
            this.scoreText.setText('Score: 0');
        }
        if (this.messageText) {
            this.messageText.setText('');
        }
    }

    /**
     * Show a message to the player
     * @param {string} text - Message text
     * @param {string} color - Text color (hex)
     */
    showMessage(text, color) {
        this.messageText.setText(text).setColor(color);
        this.time.delayedCall(2000, () => {
            if (this.messageText) {
                this.messageText.setText('');
            }
        });
    }

    /**
     * Show victory screen
     */
    showVictory() {
        // Get game dimensions
        const gameWidth = this.game.config.width;
        const gameHeight = this.game.config.height;

        // Center position
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;

        const bg = this.add.rectangle(centerX, centerY, 400, 200, 0x000000, 0.7);
        const text = this.add.text(centerX, centerY,
            `Victory!\nYour score: ${this.score}`,
            { fontSize: '32px', color: '#fff', align: 'center' }
        ).setOrigin(0.5);

        const button = this.add.text(centerX, centerY + 70, 'Play Again', {
            fontSize: '24px',
            backgroundColor: '#3498db',
            padding: { x: 20, y: 10 },
            color: '#fff'
        }).setOrigin(0.5).setInteractive();

        // Add instruction text for Enter key
        const enterText = this.add.text(centerX, centerY + 120, 'Press ENTER to restart', {
            fontSize: '16px',
            color: '#fff'
        }).setOrigin(0.5);

        // Store victory screen elements for cleanup
        this.victoryElements = [bg, text, button, enterText];

        button.on('pointerdown', () => {
            this.restartFromVictory();
        });

        // Disable the HTML input during victory using the UI controller
        if (this.uiController) {
            this.uiController.disableInput(true);
        }
    }

    /**
     * Handle resize events
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        // If width and height are not provided, use the current game size
        if (!width || !height) {
            width = this.game.config.width;
            height = this.game.config.height;
        }

        // Update score text position
        if (this.scoreText) {
            const scoreX = GameConfig.layout.ui.scoreText.x;
            const scoreY = height - GameConfig.layout.ui.scoreText.yOffsetFromBottom;
            this.scoreText.setPosition(scoreX, scoreY);
        }

        // Update message text position
        if (this.messageText) {
            const messageX = width * GameConfig.layout.ui.messageText.xFactor;
            const messageY = height - GameConfig.layout.ui.messageText.yOffsetFromBottom;
            this.messageText.setPosition(messageX, messageY);
        }

        // Update victory elements position if they exist
        if (this.victoryElements) {
            const centerX = width / 2;
            const centerY = height / 2;

            // Update positions of victory screen elements
            if (this.victoryElements[0]) this.victoryElements[0].setPosition(centerX, centerY); // bg
            if (this.victoryElements[1]) this.victoryElements[1].setPosition(centerX, centerY); // text
            if (this.victoryElements[2]) this.victoryElements[2].setPosition(centerX, centerY + 70); // button
            if (this.victoryElements[3]) this.victoryElements[3].setPosition(centerX, centerY + 120); // enterText
        }
    }

    /**
     * Restart the game from victory screen
     */
    restartFromVictory() {
        // Only proceed if victory elements exist
        if (!this.victoryElements) return;

        this.scene.get('GameScene').restartGame();
        this.score = 0;
        this.scoreText.setText('Score: 0');

        // Clean up victory screen
        this.victoryElements.forEach(element => element.destroy());
        this.victoryElements = null;

        // Re-enable the HTML input after restart using the UI controller
        if (this.uiController) {
            this.uiController.disableInput(false);
            this.uiController.focusInput();
        }
    }

    /**
     * Get the current score
     * @returns {number} Current score
     */
    getScore() {
        return this.score;
    }

    /**
     * Clean up event listeners when scene is shut down
     */
    shutdown() {
        this.scale.off('resize', this.resize, this);
        this.game.events.off('resize', this.resize, this);
        this.input.keyboard.off('keydown-ENTER');
    }
}