# Math Breakout Game

A fun educational game that combines the classic breakout gameplay with math problem solving.

## Overview

Math Breakout is a game where players control a paddle and answer math problems to shoot balls at blocks. The game features:

- Different difficulty levels of math problems (easy and hard)
- Score tracking
- Responsive controls
- Victory screen with restart option

## Architecture

The game is built using Phaser 3 and follows a modular, object-oriented architecture:

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
    │       └── SpecialBlock.js  # Extensible special blocks
    ├── math/
    │   ├── MathProblem.js       # Base math problem class
    │   ├── EasyMath.js          # Easy math problems
    │   └── HardMath.js          # Harder math problems
    └── utils/
        └── helpers.js           # Helper functions
```

## How to Play

1. Use LEFT and RIGHT arrow keys to move the paddle
2. Type the answer to a math problem and press ENTER to shoot at the corresponding block
3. Green blocks contain easier problems (worth 20 points)
4. Red blocks contain harder problems (worth 50 points)
5. Destroy all blocks to win!

## Extending the Game

The modular architecture makes it easy to extend the game:

### Adding New Block Types
- Create a new class that extends `Block.js` or `SpecialBlock.js`
- Implement custom behavior in the `onHit()` method

### Adding New Math Problem Types
- Create a new class that extends `MathProblem.js`
- Implement the `generate()` method to create your custom problems

## Credits

Built with [Phaser 3](https://phaser.io/phaser3) - HTML5 Game Framework