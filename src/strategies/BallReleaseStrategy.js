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
        // Use GameConfig for base speed
        const baseSpeed = (scene && scene.game && scene.game.config && scene.game.config.layout && scene.game.config.layout.ball && scene.game.config.layout.ball.speed) || 300;
        // Fallback to 300 if not available
        // But we can also import GameConfig directly if needed
        // For now, use 300 for demonstration
        return [
            { direction, speed: 360 }, // Center ball faster
            { direction: mirroredDirection, speed: 240 }, // Mirrored ball slower
            { direction: upDirection } // Default speed
        ];
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
            // Example: make outer balls slower, center balls faster
            let speed;
            if (i === 0 || i === this.ballCount - 1) speed = 220;
            else if (i === Math.floor(this.ballCount / 2)) speed = 350;
            specs.push(speed ? { direction, speed } : { direction });
        }
        return specs;
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
            // Example: alternate speeds for visual effect
            const speed = (i % 2 === 0) ? 300 : 180;
            scene.time.delayedCall(i * this.delayMs, () => {
                const ball = scene.shootBall(paddleX, paddleY - 10, direction, undefined, speed);
                balls.push(ball);
            });
        }
        return balls;
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
            return [{ direction: { x: 0, y: -1 } }]; // straight up
        }
        // Use player-controlled launch angle from the scene
        const angleRad = Phaser.Math.DegToRad(scene.launchAngle); // Angle from scene and convert to radians
        const direction = {
            x: Math.cos(angleRad),
            y: Math.sin(angleRad)
        };
        return [{ direction: direction }]; // spec with calculated direction
    }
}