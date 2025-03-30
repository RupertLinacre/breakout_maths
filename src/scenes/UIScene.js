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
        // Add properties for the in-game input
        this.currentAnswerString = '';
        this.answerTextDisplay = null; // Will hold the Phaser Text object
        this.answerInputBackground = null; // Will hold the background Rectangle
        this.inputActive = true; // Flag to control if input is accepted
        this.maxLength = 6; // Max characters for input
    }

    /**
     * Create UI elements
     */
    create() {
        // Get reference to the game scene
        this.gameScene = this.scene.get('GameScene');

        // Get game dimensions from config or scale manager
        const gameWidth = this.scale.width; // Use scale manager for dynamic size
        const gameHeight = this.scale.height;

        // --- Score Text (Existing) ---
        const scoreX = 20; // Keep using config or hardcode
        const scoreY = gameHeight - 70; // Keep using config or hardcode
        this.scoreText = this.add.text(scoreX, scoreY, 'Score: 0', { fontSize: '24px' });

        // --- Message Text (Existing) ---
        const messageX = gameWidth / 2;
        const messageY = gameHeight - 40;
        this.messageText = this.add.text(messageX, messageY, '', { fontSize: '24px' }).setOrigin(0.5);

        // --- NEW: Answer Input Field ---
        const inputWidth = 220;
        const inputHeight = 40;
        const inputX = gameWidth / 2;
        const inputY = gameHeight - 90; // Position above score/message

        // Background Rectangle
        this.answerInputBackground = this.add.rectangle(
            inputX,
            inputY,
            inputWidth,
            inputHeight,
            0xffffff // White background
        ).setStrokeStyle(2, 0x3498db); // Blue border

        // Text Object to display the input string
        this.answerTextDisplay = this.add.text(
            inputX,
            inputY,
            '_', // Initial placeholder
            {
                fontSize: '24px',
                color: '#000000', // Black text
                align: 'center',
                fixedWidth: inputWidth - 20, // Padding inside background
                fixedHeight: inputHeight - 10
            }
        ).setOrigin(0.5); // Center the text

        // Add Keyboard Listener
        this.input.keyboard.on('keydown', this.handleKeyInput, this);

        console.log("UI Scene Loaded with In-Game Input");

        // Listen for resize events (existing)
        this.scale.on('resize', this.resize, this);
        this.game.events.on('resize', this.resize, this);

        // Setup input handling for Enter key (for victory screen restart - existing)
        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.victoryElements && !this.inputActive) { // Only restart if victory shown
                this.restartFromVictory();
            }
        }, this);
    }

    /**
     * Submit the answer
     * @param {string} answer - The answer from the HTML input
     */
    submitAnswer(parsedAnswer) { // Receives the parsed number directly
        // Basic validation (already parsed, just check type)
        if (typeof parsedAnswer !== 'number' || isNaN(parsedAnswer)) {
            console.warn("Invalid answer submitted to UIScene:", parsedAnswer);
            return;
        }

        // Call game scene to check
        const result = this.gameScene.checkAnswer(parsedAnswer);

        // Keep the existing logic for handling correct/incorrect results
        if (result && result.correct) { // Check result exists
            // Original logic: update score, show success message
            this.updateScore(result.points); // Use points from result
            this.showMessage(`Correct! +${result.points}`, '#27ae60');
        } else {
            // Original logic: update score (penalty), show try again message
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
        // Reset input field as well
        this.currentAnswerString = '';
        if (this.answerTextDisplay) {
            this.answerTextDisplay.setText('_');
            this.answerTextDisplay.setVisible(true); // Ensure visible after restart
        }
         if (this.answerInputBackground) {
             this.answerInputBackground.setVisible(true); // Ensure visible
         }
         this.inputActive = true; // Ensure input is active
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
        this.inputActive = false; // Disable input capture
        this.currentAnswerString = ''; // Clear any pending input
        if (this.answerTextDisplay) {
            this.answerTextDisplay.setText(''); // Clear visual display
            this.answerTextDisplay.setVisible(false); // Hide input field
        }
        if (this.answerInputBackground) {
            this.answerInputBackground.setVisible(false);
        }

        // --- Existing Victory Screen Logic ---
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;

        const bg = this.add.rectangle(centerX, centerY, 400, 200, 0x000000, 0.7);
        // Adjust text y-position slightly if needed due to input field removal space
        const text = this.add.text(centerX, centerY - 20,
            `Victory!\nYour score: ${this.score}`,
            { fontSize: '32px', color: '#fff', align: 'center' }
        ).setOrigin(0.5);
        const button = this.add.text(centerX, centerY + 50, 'Play Again', {
            fontSize: '24px',
            backgroundColor: '#3498db',
            padding: { x: 20, y: 10 },
            color: '#fff'
        }).setOrigin(0.5).setInteractive();
        const enterText = this.add.text(centerX, centerY + 90, 'Press ENTER to restart', {
            fontSize: '16px',
            color: '#fff'
        }).setOrigin(0.5);

        this.victoryElements = [bg, text, button, enterText];

        button.on('pointerdown', () => {
            this.restartFromVictory();
        });
        // Note: The global Enter listener handles restart via keyboard
        // --- End Existing Logic ---
    }

    /**
     * Handle resize events
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        // If width and height are not provided, use the current game size (existing)
        if (!width || !height) {
            width = this.scale.width;
            height = this.scale.height;
        }

        // Update score text position (existing)
        if (this.scoreText) {
            const scoreY = height - 70;
            this.scoreText.setPosition(20, scoreY);
        }

        // Update message text position (existing)
        if (this.messageText) {
            const messageX = width / 2;
            const messageY = height - 40;
            this.messageText.setPosition(messageX, messageY);
        }

        // --- NEW: Update Answer Input Position ---
         const inputX = width / 2;
         const inputY = height - 90;
         if (this.answerInputBackground) {
             this.answerInputBackground.setPosition(inputX, inputY);
         }
         if (this.answerTextDisplay) {
             this.answerTextDisplay.setPosition(inputX, inputY);
         }
        // --- End Answer Input Position Update ---

        // Update victory elements position (existing)
        if (this.victoryElements) {
            const centerX = width / 2;
            const centerY = height / 2;
             // Update positions of victory screen elements (adjust y if needed)
             if (this.victoryElements[0]) this.victoryElements[0].setPosition(centerX, centerY); // bg
             if (this.victoryElements[1]) this.victoryElements[1].setPosition(centerX, centerY - 20); // text
             if (this.victoryElements[2]) this.victoryElements[2].setPosition(centerX, centerY + 50); // button
             if (this.victoryElements[3]) this.victoryElements[3].setPosition(centerX, centerY + 90); // enterText
        }
    }

    /**
     * Restart the game from victory screen
     */
    restartFromVictory() {
        if (!this.victoryElements) return;

        this.scene.get('GameScene').restartGame();
        this.resetScoreDisplay(); // Use existing method

        // Clean up victory screen (existing)
        this.victoryElements.forEach(element => element.destroy());
        this.victoryElements = null;

        // --- Re-enable and Reset Input ---
        this.inputActive = true;
        this.currentAnswerString = '';
        if (this.answerTextDisplay) {
             this.answerTextDisplay.setText('_'); // Reset to placeholder
             this.answerTextDisplay.setVisible(true); // Show input field
        }
         if (this.answerInputBackground) {
            this.answerInputBackground.setVisible(true);
        }
        // The keyboard listener is always attached, just controlled by inputActive flag
        // --- End Re-enable ---
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
        // Remove specific listener
        this.input.keyboard.off('keydown', this.handleKeyInput, this);
        // Remove victory enter listener
        this.input.keyboard.off('keydown-ENTER');
        // Remove resize listeners (already should be in original code if needed)
        this.scale.off('resize', this.resize, this);
        this.game.events.off('resize', this.resize, this);

        console.log("UI Scene Shutdown: Listeners removed.");
    }

    /**
     * Handle keyboard input for the answer input field
     * @param {Phaser.Input.Keyboard.KeyboardEvent} event
     */
    handleKeyInput(event) {
        // Ignore input if victory screen is up or input explicitly disabled
        if (!this.inputActive) {
            return;
        }

        const key = event.key;

        if (key >= '0' && key <= '9') {
            // Handle Digits
            if (this.currentAnswerString.length < this.maxLength) {
                this.currentAnswerString += key;
            }
        } else if (key === '.') {
            // Handle Decimal Point
            if (this.currentAnswerString.length < this.maxLength &&
                this.currentAnswerString.length > 0 && // Cannot start with '.'
                !this.currentAnswerString.includes('.')) { // Only one '.' allowed
                this.currentAnswerString += '.';
            }
        } else if (key === 'Backspace') {
            // Handle Backspace
            if (this.currentAnswerString.length > 0) {
                this.currentAnswerString = this.currentAnswerString.slice(0, -1);
            }
            event.preventDefault(); // Prevent browser back navigation
        } else if (key === 'Enter') {
            // Handle Enter (Submit)
            if (this.currentAnswerString.length > 0) {
                const parsedAnswer = parseFloat(this.currentAnswerString);
                if (!isNaN(parsedAnswer)) {
                    this.submitAnswer(parsedAnswer);
                    this.currentAnswerString = ''; // Clear input after submit
                } else {
                    // Optional: Show message for invalid number format?
                    this.showMessage('Invalid number', '#e74c3c');
                    this.currentAnswerString = ''; // Clear invalid input
                }
            }
            event.preventDefault(); // Prevent potential form submission if wrapped
        }

        // Update the display text
        if (this.answerTextDisplay) {
            this.answerTextDisplay.setText(this.currentAnswerString || '_'); // Show '_' if empty
        }
    }
}