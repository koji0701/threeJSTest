import * as THREE from 'three';

export class Enemy {
  constructor(scene, position, player) {
    this.scene = scene;
    this.player = player;
    this.isAlive = true;
    
    // Enemy properties
    this.health = 100;
    this.moveSpeed = 3 + Math.random() * 2; // Units per second (random variation)
    this.attackDamage = 10;
    this.attackCooldown = 1; // Seconds between attacks
    this.attackTimer = 0;
    this.scoreValue = 100;
    
    // Create enemy mesh
    this.radius = 0.5;
    this.height = 2.0;
    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius, this.height, 8),
      new THREE.MeshStandardMaterial({ color: 0xFF0000 })
    );
    this.mesh.position.copy(position);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
    
    // Add enemy "face" to show direction
    const face = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    face.position.set(0, 0.5, -this.radius);
    this.mesh.add(face);
  }
  
  update(deltaTime) {
    if (!this.isAlive) return;
    
    // Move towards player
    const direction = new THREE.Vector3();
    direction.subVectors(this.player.position, this.mesh.position);
    direction.y = 0; // Keep on ground plane
    
    // Only move if not too close to player
    const distanceToPlayer = direction.length();
    if (distanceToPlayer > this.radius + this.player.radius) {
      direction.normalize();
      
      // Move towards player
      const movement = direction.multiplyScalar(this.moveSpeed * deltaTime);
      this.mesh.position.add(movement);
      
      // Rotate to face player
      this.mesh.lookAt(new THREE.Vector3(
        this.player.position.x,
        this.mesh.position.y,
        this.player.position.z
      ));
    } else {
      // Attack player if close enough
      this.attackTimer -= deltaTime;
      if (this.attackTimer <= 0) {
        this.attackPlayer();
        this.attackTimer = this.attackCooldown;
      }
    }
  }
  
  attackPlayer() {
    if (this.player.isAlive) {
      this.player.takeDamage(this.attackDamage);
    }
  }
  
  takeDamage(amount) {
    this.health -= amount;
    
    // Flash the enemy red when hit
    const originalColor = this.mesh.material.color.clone();
    this.mesh.material.color.set(0xFFFFFF);
    setTimeout(() => {
      this.mesh.material.color.copy(originalColor);
    }, 100);
    
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    this.isAlive = false;
    
    // Add score to game
    if (this.scene.parent?.increaseScore) {
      this.scene.parent.increaseScore(this.scoreValue);
    }
    
    // Remove from scene
    this.scene.remove(this.mesh);
  }
  
  // Getters for collision detection
  getBoundingBox() {
    return new THREE.Box3().setFromObject(this.mesh);
  }
}

export class EnemyManager {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.enemies = [];
    
    // Spawning properties
    this.spawnRadius = 20; // Distance from player to spawn enemies
    this.maxEnemies = 10;
    this.spawnInterval = 2; // Seconds between enemy spawns
    this.spawnTimer = this.spawnInterval; // Start spawning immediately
    
    // Make scene available to enemies for score updates
    this.scene.parent = scene.parent;
  }
  
  update(deltaTime) {
    // Update existing enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(deltaTime);
      
      // Remove dead enemies
      if (!enemy.isAlive) {
        this.enemies.splice(i, 1);
      }
    }
    
    // Spawn new enemies
    this.spawnTimer -= deltaTime;
    if (this.spawnTimer <= 0 && this.enemies.length < this.maxEnemies) {
      this.spawnEnemy();
      this.spawnTimer = this.spawnInterval;
    }
  }
  
  spawnEnemy() {
    // Get a random position around the player
    const angle = Math.random() * Math.PI * 2;
    const x = this.player.position.x + Math.cos(angle) * this.spawnRadius;
    const z = this.player.position.z + Math.sin(angle) * this.spawnRadius;
    
    const position = new THREE.Vector3(x, 1, z);
    const enemy = new Enemy(this.scene, position, this.player);
    this.enemies.push(enemy);
  }
  
  reset() {
    // Remove all enemies
    for (const enemy of this.enemies) {
      this.scene.remove(enemy.mesh);
    }
    this.enemies = [];
    this.spawnTimer = this.spawnInterval;
  }
}