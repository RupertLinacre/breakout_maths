import Phaser from 'phaser';

/**
 * Base class for ball release strategies
 */
export class BallReleaseStrategy {
    /**
     * Execute the ball release strategy
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} paddleX - Paddle X position
     * @param {number} paddleY - Paddle Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @returns {Array<object>} Array of ball specifications (e.g., [{ direction: {x, y} }])
     */
    execute(scene, paddleX, paddleY, targetX, targetY) {
        console.warn('BallReleaseStrategy.execute() called on base class - should be overridden');
        return [];
    }

    /**
     * Get the number of balls this strategy releases.
     * Should be overridden by subclasses.
     * @returns {number} The number of balls.
     */
    getBallCount() {
        console.warn('BallReleaseStrategy.getBallCount() called on base class - should be overridden');
        return 1; // Default to 1 if not overridden
    }
}

/**
 * Strategy for releasing a single ball
 * @extends BallReleaseStrategy
 */
export class StandardBallReleaseStrategy extends BallReleaseStrategy {
    /**
     * Execute the standard ball release strategy (single ball)
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} paddleX - Paddle X position
     * @param {number} paddleY - Paddle Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @returns {Array<object>} Array containing one ball specification.
     */
    execute(scene, paddleX, paddleY, targetX, targetY) {
        // Calculate direction vector toward the target
        const angle = Phaser.Math.Angle.Between(paddleX, paddleY - 10, targetX, targetY);
        const direction = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
        return [{ direction }];
    }

    /**
     * Get the number of balls this strategy releases.
     * @returns {number} The number of balls (1 for standard release).
     */
    getBallCount() {
        return 1;
    }
}

/**
 * Strategy for releasing multiple balls
 * @extends BallReleaseStrategy
 */
export class MultiBallReleaseStrategy extends BallReleaseStrategy {
    /**
     * Execute the multi-ball release strategy (three balls)
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} paddleX - Paddle X position
     * @param {number} paddleY - Paddle Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @returns {Array<object>} Array of ball specifications
     */
    execute(scene, paddleX, paddleY, targetX, targetY) {
        // Calculate angle to target
        const angle = Phaser.Math.Angle.Between(
            paddleX,
            paddleY,
            targetX,
            targetY
        );
        // Direction to target
        const direction = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
        // Mirrored horizontally
        const mirroredDirection = {
            x: -direction.x,
            y: direction.y
        };
        // Straight up
        const upDirection = { x: 0, y: -1 };
        return [
            { direction },
            { direction: mirroredDirection },
            { direction: upDirection }
        ];
    }

    /**
     * Get the number of balls this strategy releases.
     * @returns {number} The number of balls (3 for multi-ball release).
     */
    getBallCount() {
        return 3; // Releases three balls
    }
}

/**
 * Strategy for releasing balls in an arc pattern
 */
export class ArcBallReleaseStrategy extends BallReleaseStrategy {
    /**
     * Create a new ArcBallReleaseStrategy
     * @param {number} ballCount - Number of balls to release (default: 9)
     */
    constructor(ballCount = 9) {
        super();
        this.ballCount = ballCount;
    }

    /**
     * Execute the arc ball release strategy (spray in multiple directions)
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} paddleX - Paddle X position
     * @param {number} paddleY - Paddle Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @returns {Array<object>} Array of ball specifications
     */
    execute(scene, paddleX, paddleY, targetX, targetY) {
        const specs = [];
        // Cover approximately 160 degrees (from 10° to 170°)
        const angleRange = 160;
        const angleIncrement = angleRange / (this.ballCount - 1);
        for (let i = 0; i < this.ballCount; i++) {
            const angle = 10 + (i * angleIncrement);
            const radians = Phaser.Math.DegToRad(angle + 180);
            const direction = {
                x: Math.cos(radians),
                y: Math.sin(radians)
            };
            specs.push({ direction });
        }
        return specs;
    }

    /**
     * Get the number of balls this strategy releases.
     * @returns {number} The number of balls (based on ballCount parameter).
     */
    getBallCount() {
        return this.ballCount; // Uses the constructor parameter
    }
}

/**
 * Strategy for releasing balls with a delay between each release
 * @extends BallReleaseStrategy
 */
export class SprayBallReleaseStrategy extends BallReleaseStrategy {
    /**
     * Create a new SprayBallReleaseStrategy
     * @param {number} ballCount - Number of balls to release (default: 10)
     * @param {number} delayMs - Delay between ball releases in milliseconds (default: 200)
     */
    constructor(ballCount = 10, delayMs = 200) {
        super();
        this.ballCount = ballCount;
        this.delayMs = delayMs;
    }

    /**
     * Execute the spray ball release strategy (spray with delay)
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} paddleX - Paddle X position
     * @param {number} paddleY - Paddle Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @returns {Array} Array of created balls
     */
    execute(scene, paddleX, paddleY, targetX, targetY) {
        const balls = [];
        // Calculate the angle increment based on the number of balls
        // We want to cover approximately 160 degrees (from 10° to 170°)
        const angleRange = 160;
        const angleIncrement = angleRange / (this.ballCount - 1);
        for (let i = 0; i < this.ballCount; i++) {
            const angle = 10 + (i * angleIncrement);
            const radians = Phaser.Math.DegToRad(angle + 180);
            const direction = {
                x: Math.cos(radians),
                y: Math.sin(radians)
            };
            scene.time.delayedCall(i * this.delayMs, () => {
                const currentPaddleX = scene.paddle.getX();
                const currentPaddleY = scene.paddle.getY();
                const ball = scene.shootBall(currentPaddleX, currentPaddleY - 10, direction);
                balls.push(ball);
            });
        }
        return balls;
    }

    /**
     * Get the number of balls this strategy releases.
     * @returns {number} The number of balls (based on ballCount parameter).
     */
    getBallCount() {
        return this.ballCount; // Uses the constructor parameter
    }
}

/**
 * Strategy for releasing a single ball using the player's aim angle.
 * @extends BallReleaseStrategy
 */
export class PlayerAimBallReleaseStrategy extends BallReleaseStrategy {
    /**
     * Execute the player-aimed ball release strategy (single ball using scene.launchAngle).
     * @param {Phaser.Scene} scene - The game scene (expected to have a launchAngle property).
     * @param {number} paddleX - Paddle X position.
     * @param {number} paddleY - Paddle Y position.
     * @param {number} targetX - Target X position (Ignored by this strategy).
     * @param {number} targetY - Target Y position (Ignored by this strategy).
     * @returns {Array<object>} Array containing one ball specification using the scene's launchAngle.
     */
    execute(scene, paddleX, paddleY, targetX, targetY) {
        // If the scene has the required launchAngle property
        if (typeof scene.launchAngle !== 'number') {
            console.warn('PlayerAimBallReleaseStrategy requires scene to have launchAngle property. Defaulting to up.');
            return [{ direction: { x: 0, y: -1 }, speed: 800 }]; // straight up, constant speed
        }
        // Use player-controlled launch angle from the scene
        const angleRad = Phaser.Math.DegToRad(scene.launchAngle); // Angle from scene and convert to radians
        const direction = {
            x: Math.cos(angleRad),
            y: Math.sin(angleRad)
        };
        // Use constant speed
        const speed = 800;
        return [{ direction: direction, speed }]; // spec with calculated direction and constant speed
    }

    /**
     * Get the number of balls this strategy releases.
     * @returns {number} The number of balls (1 for player aim release).
     */
    getBallCount() {
        return 1;
    }
}