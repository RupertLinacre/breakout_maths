# Breakout Maths Game

A Phaser-based educational game that combines the classic Breakout gameplay with math problem solving.

## Game Overview

In this game, players control a paddle to bounce balls and break blocks. Some blocks contain math problems that must be solved to progress. The difficulty of these math problems can be adjusted to suit different age groups and skill levels.

## Configuration

The game uses a centralized configuration system to manage difficulty settings:

### Difficulty Tiers

The game has four difficulty tiers:

- **Year 1**: Easiest level, suitable for younger children (Reception to Year 3)
- **Year 2**: Moderate difficulty (Year 1 to Year 4)
- **Year 3**: Challenging (Year 2 to Year 5)
- **Year 4**: Most difficult (Year 3 to Year 6)

Each tier determines:
1. The range of math problem difficulties that will appear
2. The distribution of problem types (always 50% easiest, 25% medium, 15% harder, 10% hardest)
3. The ball release behavior when solving problems

### Block Types

The game features four types of blocks, each with different behaviors:

- **Green Blocks (Easy)**: The most common blocks (50% spawn rate), release 1 ball when solved
- **Orange Blocks (Medium)**: Common blocks (25% spawn rate), release 3 balls when solved
- **Red Blocks (Hard)**: Less common blocks (15% spawn rate), release 5 balls in an arc when solved
- **Purple Blocks (Very Hard)**: Rare blocks (10% spawn rate), release 10 balls in a spray pattern when solved

As the difficulty tier increases, the math problems on each block type become more challenging, but the block distribution and behaviors remain consistent.

### Configuration File

The game settings are managed in `src/config/gameConfig.js`. This file contains:

- Default difficulty setting
- Year ranges for each difficulty tier
- Spawn rate distribution (consistent across all difficulty levels)
- Methods to get and set configuration values

The configuration system is designed to be flexible and maintainable:
- A single spawn rate distribution is used across all difficulty levels
- The actual year levels are mapped based on the selected difficulty tier
- Block types are determined by their position in the difficulty distribution, not by specific year levels

## How to Play

1. Use the left and right arrow keys to move the paddle
2. Break blocks by hitting them with the ball
3. When you encounter a math block, solve the problem by typing the answer and pressing Enter
4. Correct answers release balls and award points based on the difficulty

## Development

### Project Structure

- `src/main.js`: Entry point
- `src/scenes/`: Game scenes (GameScene, UIScene)
- `src/entities/`: Game objects (Ball, Paddle, Block, MathBlock)
- `src/factories/`: Factory classes for creating game objects
- `src/strategies/`: Strategy pattern implementations for game behaviors
- `src/config/`: Configuration files

### Dependencies

- Phaser 3
- maths-game-problem-generator

## License

[Your license information here]
