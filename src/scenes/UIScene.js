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
    }

    /**
     * Create UI elements
     */
    create() {
        // Get reference to the game scene
        this.gameScene = this.scene.get('GameScene');

        // Get game dimensions
        const gameWidth = this.game.config.width;
        const gameHeight = this.game.config.height;

        // Create UI elements
        this.createAnswerInput();
        this.scoreText = this.add.text(20, gameHeight - 70, 'Score: 0', { fontSize: '24px' });
        this.messageText = this.add.text(gameWidth / 2, gameHeight - 40, '', { fontSize: '24px' }).setOrigin(0.5);

        // Make sure cursor is visible initially
        if (this.cursor) {
            this.cursor.visible = true;
        }

        // Add a console log to verify scene loading
        console.log("UI Scene Loaded");

        // Setup input handling for answer submission
        this.input.keyboard.on('keydown-ENTER', () => {
            // If victory screen is showing, handle restart
            if (this.victoryElements) {
                this.restartFromVictory();
            } else {
                // Otherwise submit answer
                this.submitAnswer();
            }
        }, this);

        // Setup input handling for typing answers
        this.input.keyboard.on('keydown', e => {
            // Only process input when not in victory screen
            if (this.victoryElements) return;

            // Handle numeric input (both number row and numpad)
            if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
                // Numbers
                this.answerText.text += e.key;
                this.updateCursorPosition();
            } else if (e.keyCode === 8) {
                // Backspace
                if (this.answerText.text.length > 0) {
                    this.answerText.text = this.answerText.text.slice(0, -1);
                    this.updateCursorPosition();
                }
            } else if (e.keyCode === 46) {
                // Clear on Delete key
                this.answerText.text = '';
                this.updateCursorPosition();
            }
        });
    }

    /**
     * Create the answer input box and cursor
     */
    createAnswerInput() {
        // Get game width for positioning
        const gameWidth = this.game.config.width;
        const gameHeight = this.game.config.height;

        // Center position for the input
        const centerX = gameWidth / 2;

        // Create answer input text
        this.answerText = this.add.text(centerX, gameHeight - 70, '', {
            fontSize: '24px',
            backgroundColor: '#fff',
            color: '#333',
            fixedWidth: 100,
            padding: { x: 10, y: 5 },
            align: 'left'
        }).setOrigin(0.5);

        // Add cursor effect and input box styling
        this.answerText.setPadding(10);
        this.answerText.setBackgroundColor('#ffffff');

        // Create input box border
        this.inputBorder = this.add.rectangle(centerX, gameHeight - 70, 120, 44, 0x3498db, 0);
        this.inputBorder.setStrokeStyle(2, 0x3498db);

        // Create blinking cursor
        this.cursor = this.add.text(
            this.answerText.x - (this.answerText.width / 2) + 10,
            this.answerText.y,
            '|',
            { fontSize: '24px', color: '#000000', fontStyle: 'bold' }
        ).setOrigin(0.5);

        // Call updateCursorPosition to set initial position correctly
        this.updateCursorPosition();

        // Blink cursor
        this.time.addEvent({
            delay: 500,
            callback: () => {
                if (this.cursor) {
                    this.cursor.visible = !this.cursor.visible;
                }
            },
            loop: true
        });

        // Set focus indicator (light blue glow)
        this.answerText.on('pointerover', () => {
            this.inputBorder.setStrokeStyle(3, 0x3498db);
        });

        this.answerText.on('pointerout', () => {
            this.inputBorder.setStrokeStyle(2, 0x3498db);
        });

        // Make clickable
        this.answerText.setInteractive();
    }

    /**
     * Update cursor position based on text length
     */
    updateCursorPosition() {
        // Get the padding value
        const padding = 10;

        // Calculate cursor position based on text length
        // For empty text, position at the start of the input box
        if (this.answerText.text.length === 0) {
            this.cursor.x = this.answerText.x - (this.answerText.width / 2) + padding;
        } else {
            // For non-empty text, position after the last character
            // Use a fixed width per character for simplicity and reliability
            const charWidth = 14; // Approximate width of a character in the current font
            const textWidth = this.answerText.text.length * charWidth;
            this.cursor.x = this.answerText.x - (this.answerText.width / 2) + padding + textWidth;
        }

        // Ensure cursor is vertically aligned with text
        this.cursor.y = this.answerText.y;

        // Make sure cursor is visible
        this.cursor.visible = true;
    }

    /**
     * Submit the current answer
     */
    submitAnswer() {
        const answer = parseInt(this.answerText.text);

        // Always clear input field and update cursor on Enter
        this.answerText.text = '';
        this.updateCursorPosition();

        // Ensure cursor is visible after submission
        this.cursor.visible = true;

        if (isNaN(answer)) return;

        // Tell the game scene to check the answer
        const result = this.gameScene.checkAnswer(answer);

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
    }

    /**
     * Get the current score
     * @returns {number} Current score
     */
    getScore() {
        return this.score;
    }
}