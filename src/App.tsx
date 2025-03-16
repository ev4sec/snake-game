import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Trophy, Pause, Play } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Position = {
  x: number;
  y: number;
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<string>('right');
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('right');
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    generateFood();
  };

  const checkCollision = (head: Position) => {
    // Wall collision
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }

    // Self collision
    for (let i = 0; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }

    return false;
  };

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case 'up':
        head.y -= 1;
        break;
      case 'down':
        head.y += 1;
        break;
      case 'left':
        head.x -= 1;
        break;
      case 'right':
        head.x += 1;
        break;
    }

    if (checkCollision(head)) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
      }
      return;
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setScore(prev => prev + 1);
      generateFood();
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver, isPaused, generateFood, score, highScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Draw snake
    ctx.fillStyle = '#4ade80';
    snake.forEach(({ x, y }) => {
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
    });

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(
      food.x * CELL_SIZE,
      food.y * CELL_SIZE,
      CELL_SIZE - 1,
      CELL_SIZE - 1
    );
  }, [snake, food]);

  useEffect(() => {
    const interval = setInterval(gameLoop, INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!gameOver) {
          setIsPaused(prev => !prev);
        }
        return;
      }

      if (isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'down') setDirection('up');
          break;
        case 'ArrowDown':
          if (direction !== 'up') setDirection('down');
          break;
        case 'ArrowLeft':
          if (direction !== 'right') setDirection('left');
          break;
        case 'ArrowRight':
          if (direction !== 'left') setDirection('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPaused, gameOver]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center gap-8">
          <div className="text-green-400">
            <div className="text-sm uppercase tracking-wide">Score</div>
            <div className="text-2xl font-bold">{score}</div>
          </div>
          <div className="text-yellow-400 flex items-center gap-2">
            <Trophy size={20} />
            <div>
              <div className="text-sm uppercase tracking-wide">High Score</div>
              <div className="text-2xl font-bold">{highScore}</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className="border-4 border-gray-700 rounded-lg"
          />
          
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
              <div className="text-center">
                <h2 className="text-red-500 text-3xl font-bold mb-4">Game Over!</h2>
                <button
                  onClick={resetGame}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {isPaused && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  {isPaused ? (
                    <Pause className="text-white" size={32} />
                  ) : (
                    <Play className="text-white" size={32} />
                  )}
                </div>
                <h2 className="text-white text-3xl font-bold">Paused</h2>
                <p className="text-gray-400 mt-2">Press Space to resume</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-gray-400 text-sm">
          Use arrow keys to control the snake • Space to pause
        </div>
      </div>
    </div>
  );
}

export default App;