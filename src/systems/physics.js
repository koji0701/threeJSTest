import * as THREE from 'three';

export class Physics {
  constructor() {
    // Simple collision detection system
  }
  
  checkCollisions(player, enemies, projectiles) {
    // Check projectile-enemy collisions
    for (const projectile of projectiles) {
      if (!projectile.isActive) continue;
      
      const projectileBB = projectile.getBoundingBox();
      
      for (const enemy of enemies) {
        if (!enemy.isAlive) continue;
        
        const enemyBB = enemy.getBoundingBox();
        
        if (projectileBB.intersectsBox(enemyBB)) {
          // Handle collision
          enemy.takeDamage(projectile.damage);
          projectile.hitTarget();
          break; // Each projectile can only hit one enemy
        }
      }
    }
    
    // Check enemy-player collisions
    if (player.isAlive) {
      const playerBB = player.getBoundingBox();
      
      for (const enemy of enemies) {
        if (!enemy.isAlive) continue;
        
        const enemyBB = enemy.getBoundingBox();
        
        if (playerBB.intersectsBox(enemyBB)) {
          // Handle collision (pushing the player away slightly)
          const pushDirection = new THREE.Vector3()
            .subVectors(player.position, enemy.mesh.position)
            .normalize()
            .multiplyScalar(0.1);
          
          // Only push in XZ plane
          pushDirection.y = 0;
          
          player.position.add(pushDirection);
        }
      }
    }
  }
  
  // Can be extended with more sophisticated collision detection
  // and response, including environment collisions
}