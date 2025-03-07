/**
 * Factory for creating different types of blocks
 */
class BlockFactory {
    /**
     * Create a math block with specific properties
     * @param {Phaser.Scene} scene - The scene this block belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} blockType - Type of block to create ('standard', 'multi', 'super', etc.)
     * @param {string} difficulty - Math difficulty ('easy' or 'hard')
     * @returns {MathBlock} The created block
     */
    static createMathBlock(scene, x, y, blockType, difficulty) {
        let options = {
            difficulty: difficulty
        };

        // Configure block based on type
        switch (blockType) {
            case 'super':
                options.texture = 'blockSuper'; // This texture needs to be created
                options.ballReleaseStrategy = new SuperSpecialBallReleaseStrategy();
                break;
            case 'multi':
                options.ballReleaseStrategy = new MultiBallReleaseStrategy();
                break;
            case 'standard':
            default:
                options.ballReleaseStrategy = new StandardBallReleaseStrategy();
                break;
        }

        return new MathBlock(scene, x, y, options);
    }
}