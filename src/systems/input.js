export class InputManager {
    constructor(game) {
      this.keys = {};
      this.mouseButtons = {};
      this.mouseMovement = { x: 0, y: 0 };
      this.mouseMoved = false;
      
      // Set up event listeners
      this.setupKeyboardEvents();
      this.setupMouseEvents();
      
      // Store game reference for pointer lock handling
      this.game = game;
    }
    
    setupKeyboardEvents() {
      // Keyboard down
      window.addEventListener('keydown', (event) => {
        this.keys[event.key.toLowerCase()] = true;
        
        // Handle reload key (r)
        if (event.key.toLowerCase() === 'r') {
          this.game.player.weapon.reload();
        }
      });
      
      // Keyboard up
      window.addEventListener('keyup', (event) => {
        this.keys[event.key.toLowerCase()] = false;
      });
    }
    
    setupMouseEvents() {
      // Mouse down
      window.addEventListener('mousedown', (event) => {
        this.mouseButtons[event.button] = true;
      });
      
      // Mouse up
      window.addEventListener('mouseup', (event) => {
        this.mouseButtons[event.button] = false;
      });
      
      // Mouse movement (for camera rotation)
      window.addEventListener('mousemove', (event) => {
        // Only register mouse movement when pointer is locked
        if (document.pointerLockElement === this.game.container) {
          this.mouseMovement.x = event.movementX || 0;
          this.mouseMovement.y = event.movementY || 0;
          this.mouseMoved = true;
        }
      });
      
      // Handle pointer lock change
      document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement !== this.game.container) {
          // Pause the game when pointer lock is lost
          // (except when game is already over)
          if (this.game.isRunning) {
            this.game.isRunning = false;
            
            // Show a message to click to resume
            const message = document.getElementById('game-message');
            message.textContent = 'Click to Resume';
            message.classList.remove('hidden');
            
            // Resume on click
            const resumeHandler = () => {
              this.game.container.requestPointerLock();
              this.game.isRunning = true;
              this.game.lastTime = performance.now();
              this.game.animate();
              message.classList.add('hidden');
              this.game.container.removeEventListener('click', resumeHandler);
            };
            
            this.game.container.addEventListener('click', resumeHandler);
          }
        }
      });
    }
    
    isKeyPressed(key) {
      return this.keys[key] === true;
    }
    
    isMouseButtonPressed(button) {
      return this.mouseButtons[button] === true;
    }
    
    resetMouseMovement() {
      this.mouseMovement.x = 0;
      this.mouseMovement.y = 0;
      this.mouseMoved = false;
    }
  }