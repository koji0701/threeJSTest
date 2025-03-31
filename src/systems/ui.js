export class UI {
    constructor() {
      // Get UI elements
      this.healthBar = document.getElementById('health-fill');
      this.ammoCounter = document.getElementById('ammo-counter');
      this.scoreDisplay = document.getElementById('score-display');
      this.gameMessage = document.getElementById('game-message');
    }
    
    update(player, score) {
      // Update health bar
      const healthPercent = (player.health / player.maxHealth) * 100;
      this.healthBar.style.width = `${healthPercent}%`;
      
      // Change color based on health
      if (healthPercent > 60) {
        this.healthBar.style.backgroundColor = '#3CB371'; // Green
      } else if (healthPercent > 30) {
        this.healthBar.style.backgroundColor = '#FFA500'; // Orange
      } else {
        this.healthBar.style.backgroundColor = '#FF3333'; // Red
      }
      
      // Update ammo counter
      const ammoText = player.weapon.isReloading 
        ? 'Reloading...' 
        : `${player.weapon.ammo} / ${player.weapon.reserveAmmo}`;
      this.ammoCounter.textContent = ammoText;
      
      // Update score
      this.scoreDisplay.textContent = `Score: ${score}`;
    }
    
    showGameOver() {
      this.gameMessage.textContent = 'Game Over - Press R to Restart';
      this.gameMessage.classList.remove('hidden');
    }
    
    hideGameOver() {
      this.gameMessage.classList.add('hidden');
    }
  }