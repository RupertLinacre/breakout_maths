# Math Breakout Game

A fun, educational game that combines classic breakout gameplay with math problem solving. Players control a paddle, type answers to math problems on blocks, and hit ENTER to shoot balls at the corresponding blocks.

## Game Overview

This game is a modern take on the classic breakout genre with an educational twist:

- Players control a paddle at the bottom of the screen using LEFT/RIGHT arrow keys
- Blocks at the top of the screen display different math problems
- To break blocks, players type the answer to a math problem and hit ENTER
- Different types of blocks release different numbers of balls and have varying difficulty levels
- Score points by destroying blocks and solving math problems correctly

## Architecture Overview

The application is built with JavaScript using the Phaser 3 game framework and follows good object-oriented design principles with clear separation of concerns.

### Project Structure

```
├── index.html               # Main HTML entry point
├── package.json             # Project dependencies (Phaser, Vite)
├── vite.config.js           # Vite build configuration
├── public/                  # Static assets
└── src/                     # Source code
    ├── main.js              # Main entry point for the game
    ├── scenes/              # Game scenes
    │   ├── GameScene.js     # Main gameplay logic
    │   └── UIScene.js       # UI elements, score, input handling
    ├── entities/            # Game objects
    │   ├── Ball.js          # Ball implementation
    │   ├── Paddle.js        # Player-controlled paddle
    │   └── blocks/          # Block implementations
    │       ├── Block.js     # Base block class
    │       └── MathBlock.js # Math problem blocks
    ├── strategies/          # Strategy pattern implementations
    │   └── BallReleaseStrategy.js # Different ball release behaviors
    ├── factories/           # Factory pattern implementations
    │   └── BlockFactory.js  # Factory for creating blocks
    └── utils/               # Utility functions
        └── helpers.js       # Helper functions
```

## Key Components

### Core Engine and Setup (main.js)

The main.js file initializes the Phaser game engine with configuration settings and loads the required scenes:
- Sets up the game canvas dimensions (1250x600)
- Configures the physics engine (Arcade physics)
- Loads the GameScene and UIScene

### Scene Management

The game uses two scenes that run simultaneously:

#### GameScene
- Contains the core gameplay logic
- Manages the physics, collisions, and game objects
- Handles the creation and destruction of blocks, balls, and the paddle
- Controls game difficulty progression

#### UIScene
- Manages UI elements like score display and messages
- Handles user input for answering math problems
- Shows victory screen and restart functionality

### Entity Classes

#### Paddle
- Player-controlled object at the bottom of the screen
- Moves left and right based on arrow key input
- Has movement boundaries to prevent going off-screen

#### Ball
- Projectiles that bounce around the screen
- Created when a player answers math problems correctly
- Contains physics properties for velocity, bouncing, and collision detection

#### Blocks
- Base Block class provides common functionality
- MathBlock extends Block with math problems and specialized behaviors
- Different difficulties and types of blocks provide gameplay variety

### Math Problem Generation

The game uses the external `maths-game-problem-generator` package for generating math problems of varying difficulty:

- **Reception Problems**: Simple addition and subtraction (1-10)
- **Year 1 Problems**: Two-digit operations and simple multiplication/division
- **Year 2 Problems**: More complex multiplication and two-digit operations
- **Year 3 Problems**: Advanced operations suitable for Year 3 students

The package provides functions for creating problems, validating answers, and getting point values.

### Design Patterns

The codebase uses several software design patterns:

#### Strategy Pattern
- BallReleaseStrategy class defines different ways blocks can release balls
- StandardBallReleaseStrategy: Single ball (green blocks)
- MultiBallReleaseStrategy: Three balls in different directions (orange blocks)
- ArcBallReleaseStrategy: Spray of balls in an arc pattern (red blocks)
- SprayBallReleaseStrategy: Spray of balls with delay (purple blocks)

#### Factory Pattern
- BlockFactory creates different types of blocks with appropriate properties
- Encapsulates the creation logic to simplify the main game code

### Difficulty Management

The game features a dynamic difficulty system:
- Default spawn rates for different block difficulties
- Difficulty increases as the player progresses

## Game Features

### Block Types
- **Green blocks**: Reception level math problems (1 ball when solved)
- **Orange blocks**: Year 1 level math problems (3 balls when solved)
- **Red blocks**: Year 2 level math problems (5 balls spray when solved)
- **Purple blocks**: Year 3 level math problems (10 balls spray with delay when solved)

### Progressive Difficulty
- As the player's score increases, the game adjusts difficulty
- Gradual decrease in easier blocks and increase in harder blocks
- Makes the game more challenging while providing a learning curve

### Scoring System
- Points awarded based on math problem difficulty
- Penalties for incorrect answers
- Score tracking across gameplay

## How It All Works Together

1. **Game Initialization**:
   - main.js sets up the game environment
   - GameScene creates the blocks, paddle, and initial physics
   - UIScene creates the score display and input field

2. **Gameplay Loop**:
   - Player controls paddle with arrow keys
   - Player types answers to math problems
   - On ENTER, the game checks if the answer matches any problem
   - If correct, balls are released according to the block's strategy
   - Balls bounce around and destroy blocks on collision
   - New math problems are assigned to remaining blocks

3. **Block-Ball Interaction**:
   - Each collision triggers the handleBallBlockCollision method
   - The block's onHit method is called, updating score and destroying the block
   - If it was a math block, a new math problem is assigned to another block

4. **Victory Condition**:
   - When all blocks are destroyed, the game enters victory state
   - UIScene displays the victory screen with final score
   - Player can restart the game to play again

## Development Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Build for production with `npm run build`

## Technologies Used

- [Phaser 3](https://phaser.io/phaser3) - HTML5 game framework
- [Vite](https://vitejs.dev/) - Frontend build tool
- [maths-game-problem-generator](https://github.com/your-username/maths-game-problem-generator) - Math problem generation library

## Architectural Strengths

- **Modular Design**: Each component has a single responsibility
- **Extensibility**: Easy to add new block types, math problems, or game features
- **Design Patterns**: Effective use of strategy and factory patterns
- **Separation of Concerns**: Clear division between game logic and UI
- **Progressive Difficulty**: Adaptive gameplay that scales with player skill

This architecture allows for easy maintenance and extension of the game with new features, math problem types, or gameplay mechanics.