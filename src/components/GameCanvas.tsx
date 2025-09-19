import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Trophy, Heart, Star } from "lucide-react";
import { GameEngine } from "@/lib/gameEngine";

interface GameCanvasProps {
  gameData: any;
}

export const GameCanvas = ({ gameData }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState({
    score: 0,
    lives: 3,
    isPlaying: false,
    isWon: false,
    isGameOver: false
  });

  useEffect(() => {
    if (!gameData || !canvasRef.current) return;

    // Initialize game engine
    const gameEngine = new GameEngine(canvasRef.current, gameData);
    gameEngineRef.current = gameEngine;

    // Set up game state listeners
    gameEngine.onScoreChange = (score: number) => {
      setGameState(prev => ({ ...prev, score }));
    };

    gameEngine.onLivesChange = (lives: number) => {
      setGameState(prev => ({ ...prev, lives }));
    };

    gameEngine.onGameWin = () => {
      setGameState(prev => ({ ...prev, isWon: true, isPlaying: false }));
    };

    gameEngine.onGameOver = () => {
      setGameState(prev => ({ ...prev, isGameOver: true, isPlaying: false }));
    };

    // Start the game
    gameEngine.start();
    setGameState(prev => ({ ...prev, isPlaying: true, isWon: false, isGameOver: false }));

    return () => {
      gameEngine.stop();
    };
  }, [gameData]);

  const restartGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.restart();
      setGameState({
        score: 0,
        lives: 3,
        isPlaying: true,
        isWon: false,
        isGameOver: false
      });
    }
  };

  if (!gameData) {
    return (
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <Play className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready to Play!</h3>
              <p className="text-muted-foreground">
                Generate a game to start playing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Play className="w-5 h-5 text-neon-green" />
            {gameData.title}
          </span>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {gameState.score}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {gameState.lives}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game Story */}
        <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
          {gameData.story}
        </p>

        {/* Game Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="game-canvas w-full max-w-full h-auto"
            tabIndex={0}
          />
          
          {/* Game Over Overlay */}
          {(gameState.isWon || gameState.isGameOver) && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="text-center space-y-4">
                {gameState.isWon ? (
                  <>
                    <Trophy className="w-16 h-16 mx-auto text-neon-green" />
                    <h3 className="text-2xl font-bold text-neon-green">You Won!</h3>
                    <p className="text-lg">Final Score: {gameState.score}</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto bg-destructive rounded-full flex items-center justify-center">
                      <span className="text-2xl">💀</span>
                    </div>
                    <h3 className="text-2xl font-bold text-destructive">Game Over</h3>
                    <p className="text-lg">Final Score: {gameState.score}</p>
                  </>
                )}
                <button
                  onClick={restartGame}
                  className="px-6 py-2 bg-gradient-button hover:opacity-90 rounded-lg font-medium transition-all"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-secondary/30 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">↑↓←→</kbd> Move • 
            Collect all items to win!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};