# Math Breakout Game

A fun educational game that combines the classic breakout gameplay with math problem solving.

## Overview

Math Breakout is a game where players control a paddle and answer math problems to shoot balls at blocks. The game features:

- Different difficulty levels of math problems (easy, medium, and hard)
- Score tracking and progressive difficulty adjustment
- Responsive controls for paddle movement and math input
- Special blocks that trigger unique effects (multi-ball, super spray, etc.)
- Victory screen with restart option

## Architecture

The game is built using **Phaser 3** and follows a modular, object-oriented architecture with **factories, strategies, and entity composition** for flexibility.

### **Project Structure**

```
math-breakout-game/
├── index.html          # Main HTML file
├── js/
    ├── game.js         # Phaser game initialization
    ├── scenes/
    │   ├── GameScene.js # Core game logic
    │   └── UIScene.js   # UI handling
    ├── entities/
    │   ├── Paddle.js    # Paddle entity
    │   ├── Ball.js      # Ball physics
    │   └── blocks/
    │       ├── Block.js         # Base block class
    │       ├── MathBlock.js     # Math problem blocks
    ├── strategies/
    │   ├── BallReleaseStrategy.js  # Ball release behaviors (single, multi, spray)
    ├── factories/
    │   ├── BlockFactory.js         # Factory for creating different block types
    ├── math/
    │   ├── MathProblem.js       # Base math problem class
    │   ├── EasyMath.js          # Easy math problems
    │   ├── MediumMath.js        # Medium math problems
    │   ├── HardMath.js          # Hard math problems
    ├── utils/
    │   ├── helpers.js           # Helper functions
```

### **Module Responsibilities**

#### **Game Scenes**
- **GameScene.js** - Handles core gameplay (paddle movement, ball collisions, block spawning, difficulty progression).
- **UIScene.js** - Manages UI elements like score display and answer input.

#### **Entities**
- **Paddle.js** - Player-controlled paddle.
- **Ball.js** - Ball physics and movement.
- **Block.js** - Base class for destructible blocks.
- **MathBlock.js** - Extends `Block.js` and contains math problems.

#### **Factories & Strategies**
- **BlockFactory.js** - Creates different block types dynamically.
- **BallReleaseStrategy.js** - Defines different behaviors for ball spawning (single, multi, spray).

#### **Math Problem Handling**
- **MathProblem.js** - Base class for math problems.
- **EasyMath.js**, **MediumMath.js**, **HardMath.js** - Generate math problems of increasing difficulty.

#### **Utility Modules**
- **helpers.js** - Utility functions (random number generation, difficulty selection, etc.).

## How to Play

1. Use **LEFT and RIGHT** arrow keys to move the paddle.
2. Type the correct answer to a math problem and press **ENTER** to shoot a ball at the corresponding block.
3. Blocks have different difficulty levels:
   - **Green blocks**: Easy math problems (1 ball, 20 points)
   - **Red blocks**: Medium math problems (3 balls, 30 points)
   - **Purple blocks**: Hard math problems (spray balls, 50 points)
   - **Dark purple blocks**: Super special blocks (spray balls everywhere!)
4. Destroy all blocks to win the game!

## Extending the Game

### Adding New Block Types
- Create a new class that extends `Block.js` or `MathBlock.js`.
- Implement custom behavior in `onHit()` (e.g., a special power-up effect).

### Adding New Math Problem Types
- Create a new class that extends `MathProblem.js`.
- Implement the `generate()` method to define new problem structures.

### Modifying Ball Release Strategies
- Extend `BallReleaseStrategy.js` to define custom ball behavior.
- Assign new strategies in `BlockFactory.js` to modify how balls are released upon solving problems.

## Credits

Built with [Phaser 3](https://phaser.io/phaser3) - HTML5 Game Framework.

