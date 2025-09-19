import { useState } from "react";
import { GameBuilder } from "@/components/GameBuilder";
import { GameCanvas } from "@/components/GameCanvas";
import { Gamepad2, Sparkles } from "lucide-react";
import heroImage from "@/assets/game-builder-hero.jpg";

const Index = () => {
  const [gameData, setGameData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-canvas">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img 
          src={heroImage}
          alt="AI Game Builder - Futuristic gaming interface"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <header className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gamepad2 className="w-8 h-8 text-neon-cyan" />
              <h1 className="text-4xl md:text-6xl font-bold game-title neon-text">
                AI Game Builder
              </h1>
              <Sparkles className="w-8 h-8 text-neon-magenta" />
            </div>
            <p className="text-lg text-foreground/90 max-w-2xl mx-auto px-4">
              Describe any game idea and watch it come to life instantly! 
              Our AI creates fully playable 2D games right in your browser.
            </p>
          </header>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Game Builder Panel */}
          <div className="space-y-6">
            <GameBuilder
              onGameGenerated={setGameData}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          </div>

          {/* Game Canvas Panel */}
          <div className="space-y-6">
            <GameCanvas gameData={gameData} />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-muted-foreground">
          <p>✨ Built with AI • Play any game idea instantly</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;