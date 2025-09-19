// HTML5 Canvas-based 2D game engine for playing generated games

import { GameData } from "./gameGenerator";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameData: GameData;
  private isRunning: boolean = false;
  private animationId: number | null = null;
  private theme: string = "space";

  // Game state
  private player: { x: number; y: number; size: number; color: string };
  private enemies: Array<{ x: number; y: number; size: number; color: string; speedX: number; speedY: number }>;
  private collectibles: Array<{ x: number; y: number; size: number; color: string; points: number; collected: boolean }>;
  private obstacles: Array<{ x: number; y: number; width: number; height: number; color: string }>;
  
  private score: number = 0;
  private lives: number = 3;
  private keys: { [key: string]: boolean } = {};
  private playerSpeed: number = 5;
  
  // Callbacks
  public onScoreChange?: (score: number) => void;
  public onLivesChange?: (lives: number) => void;
  public onGameWin?: () => void;
  public onGameOver?: () => void;

  constructor(canvas: HTMLCanvasElement, gameData: GameData) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameData = gameData;
    this.theme = (gameData as any).theme || "space";
    
    // Set canvas size
    this.canvas.width = gameData.canvasWidth;
    this.canvas.height = gameData.canvasHeight;
    
    this.initializeGame();
    this.setupEventListeners();
  }

  private initializeGame() {
    // Initialize player
    this.player = {
      x: this.gameData.player.x,
      y: this.gameData.player.y,
      size: this.gameData.player.size,
      color: this.gameData.player.color
    };

    // Initialize enemies
    this.enemies = this.gameData.enemies.map(enemy => ({ ...enemy }));

    // Initialize collectibles
    this.collectibles = this.gameData.collectibles.map(collectible => ({
      ...collectible,
      collected: false
    }));

    // Initialize obstacles
    this.obstacles = this.gameData.obstacles.map(obstacle => ({ ...obstacle }));

    // Reset game state
    this.score = 0;
    this.lives = 3;
  }

  private setupEventListeners() {
    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keys[e.key] = true;
      e.preventDefault();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key] = false;
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Focus canvas for keyboard input
    this.canvas.addEventListener('click', () => {
      this.canvas.focus();
    });

    // Clean up listeners when engine is destroyed
    this.canvas.addEventListener('destroyed', () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    });
  }

  public start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.canvas.focus();
    this.gameLoop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public restart() {
    this.stop();
    this.initializeGame();
    this.onScoreChange?.(this.score);
    this.onLivesChange?.(this.lives);
    this.start();
  }

  private gameLoop() {
    if (!this.isRunning) return;

    this.update();
    this.render();

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private update() {
    this.updatePlayer();
    this.updateEnemies();
    this.checkCollisions();
    this.checkWinCondition();
  }

  private updatePlayer() {
    // Player movement
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      this.player.x = Math.max(this.player.size / 2, this.player.x - this.playerSpeed);
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      this.player.x = Math.min(this.canvas.width - this.player.size / 2, this.player.x + this.playerSpeed);
    }
    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
      this.player.y = Math.max(this.player.size / 2, this.player.y - this.playerSpeed);
    }
    if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
      this.player.y = Math.min(this.canvas.height - this.player.size / 2, this.player.y + this.playerSpeed);
    }

    // Check collision with obstacles
    for (const obstacle of this.obstacles) {
      if (this.checkRectCircleCollision(obstacle, this.player)) {
        // Push player away from obstacle
        const centerX = obstacle.x + obstacle.width / 2;
        const centerY = obstacle.y + obstacle.height / 2;
        const dx = this.player.x - centerX;
        const dy = this.player.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const pushDistance = this.player.size / 2 + 10;
          this.player.x = centerX + (dx / distance) * pushDistance;
          this.player.y = centerY + (dy / distance) * pushDistance;
        }
      }
    }
  }

  private updateEnemies() {
    this.enemies.forEach(enemy => {
      enemy.x += enemy.speedX;
      enemy.y += enemy.speedY;

      // Bounce off walls
      if (enemy.x <= enemy.size / 2 || enemy.x >= this.canvas.width - enemy.size / 2) {
        enemy.speedX = -enemy.speedX;
      }
      if (enemy.y <= enemy.size / 2 || enemy.y >= this.canvas.height - enemy.size / 2) {
        enemy.speedY = -enemy.speedY;
      }

      // Keep within bounds
      enemy.x = Math.max(enemy.size / 2, Math.min(this.canvas.width - enemy.size / 2, enemy.x));
      enemy.y = Math.max(enemy.size / 2, Math.min(this.canvas.height - enemy.size / 2, enemy.y));
    });
  }

  private checkCollisions() {
    // Check player-enemy collisions
    this.enemies.forEach(enemy => {
      if (this.checkCircleCollision(this.player, enemy)) {
        this.lives--;
        this.onLivesChange?.(this.lives);
        
        if (this.lives <= 0) {
          this.isRunning = false;
          this.onGameOver?.();
          return;
        }

        // Push player away from enemy
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          const pushDistance = 50;
          this.player.x = enemy.x + (dx / distance) * pushDistance;
          this.player.y = enemy.y + (dy / distance) * pushDistance;
        }
      }
    });

    // Check player-collectible collisions
    this.collectibles.forEach(collectible => {
      if (!collectible.collected && this.checkCircleCollision(this.player, collectible)) {
        collectible.collected = true;
        this.score += collectible.points;
        this.onScoreChange?.(this.score);
      }
    });
  }

  private checkWinCondition() {
    const allCollected = this.collectibles.every(c => c.collected);
    if (allCollected) {
      this.isRunning = false;
      this.onGameWin?.();
    }
  }

  private checkCircleCollision(obj1: any, obj2: any): boolean {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.size + obj2.size) / 2;
  }

  private checkRectCircleCollision(rect: any, circle: any): boolean {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    
    return (dx * dx + dy * dy) < (circle.size / 2) * (circle.size / 2);
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background pattern
    this.drawBackground();

    // Draw obstacles
    this.obstacles.forEach(obstacle => {
      this.ctx.fillStyle = obstacle.color;
      this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Add glow effect
      this.ctx.shadowColor = obstacle.color;
      this.ctx.shadowBlur = 10;
      this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      this.ctx.shadowBlur = 0;
    });

    // Draw collectibles
    this.collectibles.forEach(collectible => {
      if (!collectible.collected) {
        this.ctx.fillStyle = collectible.color;
        this.ctx.beginPath();
        this.ctx.arc(collectible.x, collectible.y, collectible.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add pulsing glow effect
        this.ctx.shadowColor = collectible.color;
        this.ctx.shadowBlur = 15 + Math.sin(Date.now() * 0.01) * 5;
        this.ctx.beginPath();
        this.ctx.arc(collectible.x, collectible.y, collectible.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    });

    // Draw enemies
    this.enemies.forEach(enemy => {
      this.ctx.fillStyle = enemy.color;
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add menacing glow
      this.ctx.shadowColor = enemy.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // Draw player
    this.ctx.fillStyle = this.player.color;
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, this.player.size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add player glow
    this.ctx.shadowColor = this.player.color;
    this.ctx.shadowBlur = 15;
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, this.player.size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  private drawBackground() {
    switch (this.theme) {
      case "space":
        this.drawSpaceBackground();
        break;
      case "underwater":
        this.drawUnderwaterBackground();
        break;
      case "forest":
        this.drawForestBackground();
        break;
      case "medieval":
        this.drawMedievalBackground();
        break;
      case "cyber":
        this.drawCyberBackground();
        break;
      default:
        this.drawSpaceBackground();
    }
  }

  private drawSpaceBackground() {
    // Dark space background with stars
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Add stars
    this.ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 37 + Date.now() * 0.0001) % this.canvas.width;
      const y = (i * 73 + Date.now() * 0.0002) % this.canvas.height;
      const size = Math.sin(i + Date.now() * 0.001) * 2 + 2;
      this.ctx.globalAlpha = Math.abs(Math.sin(i + Date.now() * 0.002)) * 0.8 + 0.2;
      this.ctx.fillRect(x, y, size, size);
    }
    this.ctx.globalAlpha = 1;
    
    // Add nebula effect
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width * 0.3, this.canvas.height * 0.3, 0,
      this.canvas.width * 0.3, this.canvas.height * 0.3, 200
    );
    gradient.addColorStop(0, 'rgba(138, 43, 226, 0.1)');
    gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawUnderwaterBackground() {
    // Ocean gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#001133');
    gradient.addColorStop(0.5, '#003366');
    gradient.addColorStop(1, '#004080');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Add floating bubbles
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 30; i++) {
      const x = (i * 47 + Date.now() * 0.0005) % this.canvas.width;
      const y = (i * 83 - Date.now() * 0.001) % this.canvas.height;
      const size = Math.sin(i + Date.now() * 0.003) * 5 + 8;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Add underwater light rays
    this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    this.ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const x = (i * 150 + Math.sin(Date.now() * 0.001) * 50) % this.canvas.width;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x + 20, this.canvas.height);
      this.ctx.stroke();
    }
  }

  private drawForestBackground() {
    // Forest gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a3a1a');
    gradient.addColorStop(0.7, '#2d5a2d');
    gradient.addColorStop(1, '#0d2d0d');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Add floating magical particles
    this.ctx.fillStyle = 'rgba(255, 0, 255, 0.6)';
    for (let i = 0; i < 20; i++) {
      const x = (i * 67 + Math.sin(Date.now() * 0.002 + i) * 30) % this.canvas.width;
      const y = (i * 89 + Math.cos(Date.now() * 0.003 + i) * 40) % this.canvas.height;
      const size = Math.sin(i + Date.now() * 0.004) * 3 + 4;
      this.ctx.globalAlpha = Math.abs(Math.sin(i + Date.now() * 0.002)) * 0.8 + 0.3;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
    
    // Add tree silhouettes
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (let i = 0; i < 8; i++) {
      const x = (i * 100) % this.canvas.width;
      this.ctx.fillRect(x, this.canvas.height - 100, 20, 100);
      this.ctx.beginPath();
      this.ctx.arc(x + 10, this.canvas.height - 100, 30, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private drawMedievalBackground() {
    // Castle stone background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#4a4a4a');
    gradient.addColorStop(0.5, '#3a3a3a');
    gradient.addColorStop(1, '#2a2a2a');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Add stone brick pattern
    this.ctx.strokeStyle = '#1a1a1a';
    this.ctx.lineWidth = 1;
    const brickWidth = 60;
    const brickHeight = 30;
    
    for (let y = 0; y < this.canvas.height; y += brickHeight) {
      for (let x = 0; x < this.canvas.width; x += brickWidth) {
        const offsetX = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
        this.ctx.strokeRect(x + offsetX, y, brickWidth, brickHeight);
      }
    }
    
    // Add torch flames effect
    this.ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
    for (let i = 0; i < 3; i++) {
      const x = 100 + i * 300;
      const flameHeight = Math.sin(Date.now() * 0.01 + i) * 10 + 25;
      this.ctx.beginPath();
      this.ctx.arc(x, 80, flameHeight, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private drawCyberBackground() {
    // Digital grid background
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Add digital grid
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.3;
    
    const gridSize = 50;
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    this.ctx.globalAlpha = 1;
    
    // Add scanning lines
    this.ctx.strokeStyle = '#ff00ff';
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.6;
    const scanY = (Date.now() * 0.1) % this.canvas.height;
    this.ctx.beginPath();
    this.ctx.moveTo(0, scanY);
    this.ctx.lineTo(this.canvas.width, scanY);
    this.ctx.stroke();
    
    // Add digital particles
    this.ctx.fillStyle = '#00ff00';
    for (let i = 0; i < 15; i++) {
      const x = (i * 53 + Date.now() * 0.002) % this.canvas.width;
      const y = (i * 79 + Date.now() * 0.001) % this.canvas.height;
      const size = Math.sin(i + Date.now() * 0.005) * 2 + 3;
      this.ctx.globalAlpha = Math.abs(Math.sin(i + Date.now() * 0.003)) * 0.8 + 0.2;
      this.ctx.fillRect(x, y, size, size);
    }
    this.ctx.globalAlpha = 1;
  }
}
