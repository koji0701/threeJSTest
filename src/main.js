import * as THREE from 'three';
import { Player } from './components/player.js';
import { EnemyManager } from './components/enemy.js';
import { LevelManager } from './components/level.js';
import { InputManager } from './systems/input.js';
import { Physics } from './systems/physics.js';
import { UI } from './systems/ui.js';

class Game {
  constructor() {
    this.container = document.getElementById('game-container');
    this.isRunning = false;
    this.score = 0;
    
    // Initialize Three.js
    this.initThree();
    
    // Initialize game systems
    this.input = new InputManager(this);
    this.physics = new Physics();
    this.ui = new UI();
    
    // Initialize game components
    this.level = new LevelManager(this.scene);
    this.player = new Player(this.scene, this.camera);
    this.enemies = new EnemyManager(this.scene, this.player);
    
    // Start the game loop
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
    
    // Lock pointer on click
    this.container.addEventListener('click', () => {
      this.container.requestPointerLock();
    });
  }
  
  initThree() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, 20, 100);
    
    // Create camera (will be controlled by the player)
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 10;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  animate() {
    if (!this.isRunning) return;
    
    requestAnimationFrame(this.animate.bind(this));
    
    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = now;
    
    // Update game components
    this.player.update(deltaTime, this.input);
    this.enemies.update(deltaTime);
    
    // Check collisions
    this.physics.checkCollisions(
      this.player,
      this.enemies.enemies,
      this.player.weapon.projectiles
    );
    
    // Update UI
    this.ui.update(this.player, this.score);
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  increaseScore(points) {
    this.score += points;
  }
  
  gameOver() {
    this.isRunning = false;
    this.ui.showGameOver();
    document.exitPointerLock();
  }
  
  restart() {
    // Reset game state
    this.score = 0;
    this.player.reset();
    this.enemies.reset();
    
    // Restart game
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
    this.ui.hideGameOver();
  }
}

// Initialize the game when the window loads
window.addEventListener('load', () => {
  const game = new Game();
  
  // Allow restarting with 'R' key
  window.addEventListener('keydown', (event) => {
    if (event.key === 'r' && !game.isRunning) {
      game.restart();
    }
  });
});