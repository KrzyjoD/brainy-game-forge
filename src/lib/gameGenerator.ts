// AI-powered game generator that creates game data from text descriptions

export interface GameData {
  title: string;
  story: string;
  player: {
    x: number;
    y: number;
    color: string;
    size: number;
  };
  enemies: Array<{
    x: number;
    y: number;
    color: string;
    size: number;
    speedX: number;
    speedY: number;
  }>;
  collectibles: Array<{
    x: number;
    y: number;
    color: string;
    size: number;
    points: number;
  }>;
  obstacles: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  }>;
  mechanics: string[];
  canvasWidth: number;
  canvasHeight: number;
}

const gameTemplates = {
  space: {
    colors: { player: "#00ffff", enemy: "#ff0080", collectible: "#ffff00", obstacle: "#8000ff" },
    themes: ["spaceship", "alien", "stars", "asteroids", "laser"]
  },
  underwater: {
    colors: { player: "#00ff80", enemy: "#ff4000", collectible: "#ffff00", obstacle: "#4080ff" },
    themes: ["fish", "shark", "treasure", "coral", "bubbles"]
  },
  forest: {
    colors: { player: "#80ff00", enemy: "#ff8000", collectible: "#ff0080", obstacle: "#8040ff" },
    themes: ["hero", "monster", "crystal", "tree", "magic"]
  },
  medieval: {
    colors: { player: "#ffff00", enemy: "#ff0000", collectible: "#00ff00", obstacle: "#808080" },
    themes: ["knight", "dragon", "treasure", "castle", "sword"]
  },
  cyber: {
    colors: { player: "#00ffff", enemy: "#ff00ff", collectible: "#ffff00", obstacle: "#ff8000" },
    themes: ["hacker", "virus", "data", "firewall", "code"]
  }
};

function analyzeGameIdea(idea: string): string {
  const lowerIdea = idea.toLowerCase();
  
  if (lowerIdea.includes("space") || lowerIdea.includes("alien") || lowerIdea.includes("spaceship")) {
    return "space";
  } else if (lowerIdea.includes("underwater") || lowerIdea.includes("ocean") || lowerIdea.includes("shark")) {
    return "underwater";
  } else if (lowerIdea.includes("forest") || lowerIdea.includes("magic") || lowerIdea.includes("crystal")) {
    return "forest";
  } else if (lowerIdea.includes("medieval") || lowerIdea.includes("knight") || lowerIdea.includes("castle")) {
    return "medieval";
  } else if (lowerIdea.includes("cyber") || lowerIdea.includes("hacker") || lowerIdea.includes("digital")) {
    return "cyber";
  }
  
  // Default to space theme
  return "space";
}

function generateRandomPosition(width: number, height: number, margin: number = 50) {
  return {
    x: margin + Math.random() * (width - 2 * margin),
    y: margin + Math.random() * (height - 2 * margin)
  };
}

function generateEnemies(count: number, theme: any, canvasWidth: number, canvasHeight: number) {
  const enemies = [];
  for (let i = 0; i < count; i++) {
    const pos = generateRandomPosition(canvasWidth, canvasHeight, 100);
    enemies.push({
      x: pos.x,
      y: pos.y,
      color: theme.colors.enemy,
      size: 20 + Math.random() * 15,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2
    });
  }
  return enemies;
}

function generateCollectibles(count: number, theme: any, canvasWidth: number, canvasHeight: number) {
  const collectibles = [];
  for (let i = 0; i < count; i++) {
    const pos = generateRandomPosition(canvasWidth, canvasHeight, 80);
    collectibles.push({
      x: pos.x,
      y: pos.y,
      color: theme.colors.collectible,
      size: 15 + Math.random() * 10,
      points: 10 + Math.floor(Math.random() * 20)
    });
  }
  return collectibles;
}

function generateObstacles(count: number, theme: any, canvasWidth: number, canvasHeight: number) {
  const obstacles = [];
  for (let i = 0; i < count; i++) {
    const pos = generateRandomPosition(canvasWidth, canvasHeight, 120);
    obstacles.push({
      x: pos.x,
      y: pos.y,
      width: 30 + Math.random() * 80,
      height: 30 + Math.random() * 80,
      color: theme.colors.obstacle
    });
  }
  return obstacles;
}

function generateGameTitle(idea: string, themeKey: string): string {
  const themeWords = gameTemplates[themeKey as keyof typeof gameTemplates].themes;
  const randomTheme = themeWords[Math.floor(Math.random() * themeWords.length)];
  
  const prefixes = ["Super", "Epic", "Mega", "Ultra", "Cosmic", "Mystic"];
  const suffixes = ["Quest", "Adventure", "Rush", "Challenge", "Mission", "Escape"];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${randomTheme} ${suffix}`;
}

function generateGameStory(idea: string, themeKey: string): string {
  const theme = gameTemplates[themeKey as keyof typeof gameTemplates];
  const templates = [
    `Embark on an epic adventure where you must collect all the magical items while avoiding dangerous enemies!`,
    `Navigate through a treacherous world filled with obstacles and foes. Gather all treasures to achieve victory!`,
    `You are the hero this world needs! Collect all the special items while dodging enemies and obstacles.`,
    `An exciting quest awaits! Avoid enemies, navigate obstacles, and collect all items to win the game!`,
    `Journey through a challenging realm where quick reflexes and strategy are key to collecting all treasures!`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

export function generateGameFromIdea(idea: string): GameData {
  const themeKey = analyzeGameIdea(idea);
  const theme = gameTemplates[themeKey as keyof typeof gameTemplates];
  
  const canvasWidth = 800;
  const canvasHeight = 600;
  
  // Difficulty based on idea complexity
  const wordCount = idea.split(' ').length;
  const difficulty = Math.min(Math.max(Math.floor(wordCount / 3), 1), 3);
  
  const enemyCount = 2 + difficulty;
  const collectibleCount = 3 + difficulty * 2;
  const obstacleCount = 1 + difficulty;

  const gameData: GameData = {
    title: generateGameTitle(idea, themeKey),
    story: generateGameStory(idea, themeKey),
    player: {
      x: 50,
      y: canvasHeight / 2,
      color: theme.colors.player,
      size: 25
    },
    enemies: generateEnemies(enemyCount, theme, canvasWidth, canvasHeight),
    collectibles: generateCollectibles(collectibleCount, theme, canvasWidth, canvasHeight),
    obstacles: generateObstacles(obstacleCount, theme, canvasWidth, canvasHeight),
    mechanics: [
      "Use arrow keys to move your character",
      "Collect all glowing items to win",
      "Avoid touching enemies - they reduce your lives",
      "Navigate around obstacles",
      "Collect all items before your lives run out!"
    ],
    canvasWidth,
    canvasHeight
  };

  return gameData;
}