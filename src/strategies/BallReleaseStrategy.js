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
     * @returns {Array} Array of created balls
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
     * @returns {Array} Array of created balls
     */
    execute(scene, paddleX, paddleY, targetX, targetY) {
        // Release a single ball toward the target
        return [scene.shootBall(paddleX, paddleY - 10, targetX, targetY)];
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
     * @returns {Array} Array of created balls
     */
    execute(scene, paddleX, paddleY, targetX, targetY) {
        // Calculate angle to target
        const angle = Phaser.Math.Angle.Between(
            paddleX,
            paddleY,
            targetX,
            targetY
        );

        // Calculate the x component of direction to target
        const xDirection = Math.cos(angle);

        // Create mirrored angle (reflect horizontally around the vertical axis)
        // If original angle has x component of 0.5, mirrored angle has x component of -0.5
        const mirroredDirection = {
            x: -xDirection,
            y: Math.sin(angle) // Keep y component the same
        };

        // Return 3 balls:
        // 1. First ball aimed directly at target
        // 2. Second ball mirrored horizontally from the first
        // 3. Third ball aimed straight up
        return [
            scene.shootBall(paddleX, paddleY - 10, targetX, targetY),
            scene.shootBall(paddleX, paddleY - 10, mirroredDirection),
            scene.shootBall(paddleX, paddleY - 10, { x: 0, y: -1 })
        ];
    }
}

/**
 * Strategy for releasing balls in all directions
 * @extends BallReleaseStrategy
 */
export class SuperSpecialBallReleaseStrategy extends BallReleaseStrategy {
    /**
     * Create a new SuperSpecialBallReleaseStrategy
     * @param {number} ballCount - Number of balls to release (default: 9)
     */
    constructor(ballCount = 9) {
        super();
        this.ballCount = ballCount;
    }

    /**
     * Execute the super special ball release strategy (spray in multiple directions)
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

        // Create balls from 10° to 170° with calculated increments
        for (let i = 0; i < this.ballCount; i++) {
            const angle = 10 + (i * angleIncrement);
            const radians = Phaser.Math.DegToRad(angle + 180);
            const direction = {
                x: Math.cos(radians),
                y: Math.sin(radians)
            };
            balls.push(scene.shootBall(paddleX, paddleY - 10, direction));
        }

        return balls;
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

        // Create a timer event for each ball
        for (let i = 0; i < this.ballCount; i++) {
            // Calculate the angle for this ball
            const angle = 10 + (i * angleIncrement);
            const radians = Phaser.Math.DegToRad(angle + 180);
            const direction = {
                x: Math.cos(radians),
                y: Math.sin(radians)
            };

            // Create a timer event to release this ball after a delay
            scene.time.delayedCall(i * this.delayMs, () => {
                const ball = scene.shootBall(paddleX, paddleY - 10, direction);
                balls.push(ball);
            });
        }

        return balls;
    }
}