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
        this.lastSubmittedAnswer = null; // Store last successfully submitted answer
        // --- Repeat Count Text ---
        this.repeatCountText = null;
        // ------------------------
    }

    /**
     * Create UI elements
     */
    create() {
        // Get reference to the game scene
        this.gameScene = this.scene.get('GameScene');

        // --- CHANGE: Use GameConfig for initial dimensions ---
        const gameWidth = GameConfig.layout.gameWidth;
        const gameHeight = GameConfig.layout.gameHeight;
        // --- END CHANGE ---

        // --- Score Text (Existing) ---
        const scoreX = 20;
        const scoreY = gameHeight - 70; // Position relative to calculated height
        this.scoreText = this.add.text(scoreX, scoreY, 'Score: 0', { fontSize: '24px' });

        // --- Repeat Count Text (NEW) ---
        const repeatTextX = 20;
        const repeatTextY = 20;
        this.repeatCountText = this.add.text(repeatTextX, repeatTextY, 'Repeats: 0', { fontSize: '24px', color: '#ffffff' });
        // --------------------------------

        // --- Message Text (Existing) ---
        const messageX = gameWidth / 2;
        const messageY = gameHeight - 40; // Position relative to calculated height
        this.messageText = this.add.text(messageX, messageY, '', { fontSize: '24px' }).setOrigin(0.5);

        // --- NEW: Answer Input Field ---
        const inputWidth = 220;
        const inputHeight = 40;
        const inputX = gameWidth / 2;
        // Place input box just below the paddle
        const inputY = GameConfig.layout.paddle.initialY + GameConfig.layout.paddle.height / 2 + 30;

        // Background Rectangle

        this.answerInputBackground = this.add.rectangle(
            inputX,
            inputY,
            inputWidth,
            inputHeight,
            0x111111 // Dark grey background (adjust as needed)
        ).setStrokeStyle(2, 0xffffff); // Changed border color to white

        // Text Object
        this.answerTextDisplay = this.add.text(
            inputX,
            inputY,
            '_', // Initial placeholder
            {
                fontSize: '24px',
                color: '#ffffff', // Changed text color to white
                align: 'center',
                fixedWidth: inputWidth - 20, // Padding inside background
                fixedHeight: inputHeight - 10
            }
        ).setOrigin(0.5); // Center the text

        // Logging (optional now, but good for verification)
        console.log("UIScene Create - Game Height:", gameHeight, "Calculated Input Y:", inputY);
        console.log("Input Background:", this.answerInputBackground);
        console.log("Input Text:", this.answerTextDisplay);
        console.log("Actual BG Position:", this.answerInputBackground.x, this.answerInputBackground.y); // <-- Add this
        console.log("Actual Text Position:", this.answerTextDisplay.x, this.answerTextDisplay.y); // <-- Add this

        // Add Keyboard Listener
        this.input.keyboard.on('keydown', this.handleKeyInput, this);

        console.log("UI Scene Loaded with In-Game Input");

        // Listen for resize events (existing)
        this.scale.on('resize', this.resize, this);

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
     * Update the repeat count display
     * @param {number} count
     */
    updateRepeatDisplay(count) {
        if (this.repeatCountText) {
            this.repeatCountText.setText(`Repeats: ${count}`);
        }
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
        this.lastSubmittedAnswer = null; // <-- Reset last answer on restart
        // --- Reset repeat count text ---
        if (this.repeatCountText) {
            this.repeatCountText.setText('Repeats: 0');
            this.repeatCountText.setVisible(true);
        }
        // ------------------------------
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
        // --- Hide repeat count text on victory (optional) ---
        if (this.repeatCountText) {
            this.repeatCountText.setVisible(false);
        }
        // ---------------------------------------------------

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
     * Restart the game from the victory screen
     */
    restartFromVictory() {
        // Clear victory elements
        if (this.victoryElements) {
            this.victoryElements.forEach(element => element.destroy());
            this.victoryElements = null;
        }

        // Reset score and UI elements
        this.resetScoreDisplay();
        // --- Show repeat count text again ---
        if (this.repeatCountText) {
            this.repeatCountText.setVisible(true);
        }
        // ------------------------------------

        // Call the GameScene's restartGame method to reset the game state
        const gameScene = this.scene.get('GameScene');
        if (gameScene && typeof gameScene.restartGame === 'function') {
            gameScene.restartGame();
        } else {
            console.error('GameScene or its restartGame method is not available.');
        }
    }

    /**
     * Handle resize events
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(gameSize, baseSize, displaySize, previousSize) { // Get all potential args to inspect




        const effectiveWidth = this.scale.width;
        const effectiveHeight = this.scale.height;



        // Check if dimensions are valid numbers before calculating positions
        if (isNaN(effectiveWidth) || isNaN(effectiveHeight) || effectiveWidth <= 0 || effectiveHeight <= 0) {
            console.error("Resize - Invalid dimensions from this.scale:", effectiveWidth, effectiveHeight);
            return; // Prevent setting NaN positions
        }

        // --- Update positions using effectiveWidth/Height from this.scale ---
        // Update score text position
        if (this.scoreText) {
            const scoreY = effectiveHeight - 70;
            this.scoreText.setPosition(20, scoreY);
        }

        // Update message text position
        if (this.messageText) {
            const messageX = effectiveWidth / 2;
            const messageY = effectiveHeight - 40;
            this.messageText.setPosition(messageX, messageY);
        }

        // Update Answer Input Position
        const inputX = effectiveWidth / 2;
        // Place input box just below the paddle
        const inputY = GameConfig.layout.paddle.initialY + GameConfig.layout.paddle.height / 2 + 30;
        if (this.answerInputBackground) {
            this.answerInputBackground.setPosition(inputX, inputY);
            console.log("Resize - Setting BG Pos:", inputX, inputY);
        }
        if (this.answerTextDisplay) {
            this.answerTextDisplay.setPosition(inputX, inputY);
            console.log("Resize - Setting Text Pos:", inputX, inputY);
        }

        // Update repeat count text position (top-left)
        if (this.repeatCountText) {
            this.repeatCountText.setPosition(20, 20);
        }

        // Update victory elements position
        if (this.victoryElements) {
            const centerX = effectiveWidth / 2;
            const centerY = effectiveHeight / 2;
            if (this.victoryElements[0]) this.victoryElements[0].setPosition(centerX, centerY);
            if (this.victoryElements[1]) this.victoryElements[1].setPosition(centerX, centerY - 20);
            if (this.victoryElements[2]) this.victoryElements[2].setPosition(centerX, centerY + 50);
            if (this.victoryElements[3]) this.victoryElements[3].setPosition(centerX, centerY + 90);
        }
        console.log(`--- RESIZE EVENT END ---`);
        // --- END MODIFIED RESIZE ---
    }

    shutdown() {
        this.input.keyboard.off('keydown', this.handleKeyInput, this);
        this.input.keyboard.off('keydown-ENTER');
        this.scale.off('resize', this.resize, this); // Ensure this matches the listener added in create
        // this.game.events.off('resize', this.resize, this); // REMOVE if listener was removed in create

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
        } else if (key === 'r' || key === 'R') { // <-- ADD THIS NEW BLOCK
            if (this.inputActive && this.lastSubmittedAnswer !== null) {
                // Optional feedback:
                // this.showMessage(`Resubmitting: ${this.lastSubmittedAnswer}`, '#3498db');
                this.submitAnswer(this.lastSubmittedAnswer);
            }
            event.preventDefault();
        } else if (key === 'Enter') {
            // Handle Enter (Submit)
            if (this.currentAnswerString.length > 0) {
                const parsedAnswer = parseFloat(this.currentAnswerString);
                if (!isNaN(parsedAnswer)) {
                    this.lastSubmittedAnswer = parsedAnswer; // Store before submitting/clearing
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