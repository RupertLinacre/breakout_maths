/**
 * Base class for ball release strategies
 */
class BallReleaseStrategy {
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
class StandardBallReleaseStrategy extends BallReleaseStrategy {
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
class MultiBallReleaseStrategy extends BallReleaseStrategy {
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
        // Release multiple balls in different directions
        return [
            scene.shootBall(paddleX, paddleY - 10, targetX, targetY),
            scene.shootBall(paddleX, paddleY - 10, { x: 0, y: -1 }),
            scene.shootBall(paddleX, paddleY - 10, { x: -1, y: -1 })
        ];
    }
}

/**
 * Strategy for releasing balls in all directions
 * @extends BallReleaseStrategy
 */
class SuperSpecialBallReleaseStrategy extends BallReleaseStrategy {
    /**
     * Execute the super special ball release strategy (spray in all directions)
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} paddleX - Paddle X position
     * @param {number} paddleY - Paddle Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @returns {Array} Array of created balls
     */
    execute(scene, paddleX, paddleY, targetX, targetY) {
        // Spray balls in all directions
        const balls = [];
        // Create 8 balls in different directions
        for (let angle = 0; angle < 360; angle += 45) {
            const radians = Phaser.Math.DegToRad(angle);
            const direction = {
                x: Math.cos(radians),
                y: Math.sin(radians)
            };
            balls.push(scene.shootBall(paddleX, paddleY - 10, direction));
        }
        return balls;
    }
}