import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Lightbulb, Zap } from "lucide-react";
import { toast } from "sonner";
import { generateGameFromIdea } from "@/lib/gameGenerator";

interface GameBuilderProps {
  onGameGenerated: (gameData: any) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

const gameExamples = [
  "A space shooter where you pilot a spaceship and defeat alien invaders",
  "A maze runner game where you collect gems while avoiding monsters",
  "A platformer where you jump on clouds to reach the castle",
  "An underwater adventure collecting treasure while dodging sharks",
  "A forest quest gathering magical crystals from dangerous creatures"
];

export const GameBuilder = ({ onGameGenerated, isGenerating, setIsGenerating }: GameBuilderProps) => {
  const [gameIdea, setGameIdea] = useState("");

  const handleGenerateGame = async () => {
    if (!gameIdea.trim()) {
      toast.error("Please enter a game idea!");
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const gameData = generateGameFromIdea(gameIdea);
      onGameGenerated(gameData);
      
      toast.success("🎮 Game generated successfully! Use arrow keys to play!");
    } catch (error) {
      toast.error("Failed to generate game. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setGameIdea(example);
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-neon-magenta" />
          Game Idea Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="game-idea" className="block text-sm font-medium mb-2">
            Describe your game idea
          </label>
          <Textarea
            id="game-idea"
            placeholder="A platformer game where you play as a ninja collecting stars while avoiding enemies..."
            value={gameIdea}
            onChange={(e) => {
              console.log('Textarea onChange triggered:', e.target.value);
              setGameIdea(e.target.value);
            }}
            onFocus={() => console.log('Textarea focused')}
            onBlur={() => console.log('Textarea blurred')}
            onClick={() => console.log('Textarea clicked')}
            className="min-h-[120px] bg-background border-2 border-border focus:border-neon-cyan transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            disabled={isGenerating}
            autoFocus
            style={{ zIndex: 10, position: 'relative' }}
          />
        </div>

        <Button
          onClick={handleGenerateGame}
          disabled={isGenerating || !gameIdea.trim()}
          variant="gaming"
          size="lg"
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-pulse" />
              Generating Game...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Game
            </>
          )}
        </Button>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="w-4 h-4" />
            Need inspiration? Try these examples:
          </div>
          <div className="grid gap-2">
            {gameExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-left text-sm p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border/50 hover:border-neon-cyan/50"
                disabled={isGenerating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};