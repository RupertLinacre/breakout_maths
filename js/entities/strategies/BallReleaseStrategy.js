/**
 * Base class for ball release strategies
 */
class BallReleaseStrategy {
    /**
     * Execute the ball release strategy
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} paddleX - Paddle X position
     * @param {number} paddleY - Paddle Y position
     * @param {number} sourceX - Source X position (block)
     * @param {number} sourceY - Source Y position (block)
     * @returns {Array} Array of created balls
     */
    execute(scene, paddleX, paddleY, sourceX, sourceY) {
        // To be implemented by subclasses
        return [];
    }
}

/**
 * Strategy for releasing a single ball
 * @extends BallReleaseStrategy
 */
class StandardBallReleaseStrategy extends BallReleaseStrategy {
    /**
     * Execute the standard ball release strategy (single ball)
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} paddleX - Paddle X position
     * @param {number} paddleY - Paddle Y position
     * @param {number} sourceX - Source X position (block)
     * @param {number} sourceY - Source Y position (block)
     * @returns {Array} Array containing the created ball
     */
    execute(scene, paddleX, paddleY, sourceX, sourceY) {
        const ball = scene.createBall(paddleX, paddleY - 20);
        ball.launch();
        return [ball];
    }
}

/**
 * Strategy for releasing multiple balls
 * @extends BallReleaseStrategy
 */
class MultiBallReleaseStrategy extends BallReleaseStrategy {
    /**
     * Create a new multi-ball release strategy
     * @param {number} ballCount - Number of balls to release
     */
    constructor(ballCount = 3) {
        super();
        this.ballCount = ballCount;
    }

    /**
     * Execute the multi-ball release strategy
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} paddleX - Paddle X position
     * @param {number} paddleY - Paddle Y position
     * @param {number} sourceX - Source X position (block)
     * @param {number} sourceY - Source Y position (block)
     * @returns {Array} Array of created balls
     */
    execute(scene, paddleX, paddleY, sourceX, sourceY) {
        const balls = [];

        for (let i = 0; i < this.ballCount; i++) {
            const ball = scene.createBall(paddleX, paddleY - 20);

            // Vary the launch angle for multiple balls
            const angleVariation = (i - (this.ballCount - 1) / 2) * 0.2;
            ball.launch(angleVariation);

            balls.push(ball);
        }

        return balls;
    }
}