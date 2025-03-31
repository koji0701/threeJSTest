import * as THREE from 'three';

export class Projectile {
  constructor(scene, position, direction) {
    this.scene = scene;
    this.direction = direction.normalize();
    this.speed = 30; // Units per second
    this.damage = 25;
    this.isActive = true;
    this.lifeTime = 2; // Seconds before despawning
    this.timer = 0;
    
    // Create projectile mesh
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xFFFF00 })
    );
    this.mesh.position.copy(position);
    scene.add(this.mesh);
  }
  
  update(deltaTime) {
    if (!this.isActive) return;
    
    // Move projectile
    const movement = new THREE.Vector3();
    movement.copy(this.direction).multiplyScalar(this.speed * deltaTime);
    this.mesh.position.add(movement);
    
    // Check lifespan
    this.timer += deltaTime;
    if (this.timer >= this.lifeTime) {
      this.destroy();
    }
  }
  
  hitTarget() {
    this.destroy();
  }
  
  destroy() {
    this.isActive = false;
    this.scene.remove(this.mesh);
  }
  
  // Getters for collision detection
  getBoundingBox() {
    return new THREE.Box3().setFromObject(this.mesh);
  }
}

export class Weapon {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    // Weapon properties
    this.fireRate = 0.2; // Seconds between shots
    this.fireTimer = 0;
    this.ammo = 30;
    this.reserveAmmo = 90;
    this.clipSize = 30;
    this.reloadTime = 1.5; // Seconds
    this.isReloading = false;
    this.reloadTimer = 0;
    
    // Store active projectiles
    this.projectiles = [];
    
    // Create weapon model (simple box for now)
    this.model = new THREE.Group();
    
    const barrel = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    barrel.position.set(0, -0.05, 0.25);
    this.model.add(barrel);
    
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    body.position.set(0, -0.1, 0);
    this.model.add(body);
    
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    handle.position.set(0, -0.2, -0.1);
    handle.rotation.x = Math.PI / 8;
    this.model.add(handle);
    
    // Position the weapon
    this.model.position.set(0.3, -0.3, -0.5);
    this.camera.add(this.model);
  }
  
  update(deltaTime) {
    // Update fire timer
    if (this.fireTimer > 0) {
      this.fireTimer -= deltaTime;
    }
    
    // Update reload timer
    if (this.isReloading) {
      this.reloadTimer -= deltaTime;
      if (this.reloadTimer <= 0) {
        this.completeReload();
      }
    }
    
    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(deltaTime);
      
      // Remove inactive projectiles
      if (!projectile.isActive) {
        this.projectiles.splice(i, 1);
      }
    }
    
    // Simple weapon animation
    // Bob weapon while moving
    const time = performance.now() * 0.003;
    this.model.position.y = -0.3 + Math.sin(time * 5) * 0.01;
    
    // Handle weapon recoil animation
    if (this.fireTimer > this.fireRate - 0.05) {
      const recoilAmount = (this.fireTimer - (this.fireRate - 0.05)) / 0.05;
      this.model.position.z = -0.5 - recoilAmount * 0.1;
    } else {
      this.model.position.z = -0.5;
    }
  }
  
  shoot() {
    // Check if we can shoot
    if (this.fireTimer > 0 || this.isReloading || this.ammo <= 0) {
      return;
    }
    
    // Create projectile from camera position and direction
    const position = new THREE.Vector3(0, 0, -1);
    position.applyMatrix4(this.camera.matrixWorld);
    
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.camera.quaternion);
    
    const projectile = new Projectile(this.scene, position, direction);
    this.projectiles.push(projectile);
    
    // Reset fire timer
    this.fireTimer = this.fireRate;
    
    // Reduce ammo
    this.ammo--;
    
    // Auto-reload when empty
    if (this.ammo === 0 && this.reserveAmmo > 0) {
      this.reload();
    }
  }
  
  reload() {
    if (this.isReloading || this.ammo === this.clipSize || this.reserveAmmo === 0) {
      return;
    }
    
    this.isReloading = true;
    this.reloadTimer = this.reloadTime;
  }
  
  completeReload() {
    this.isReloading = false;
    
    const ammoNeeded = this.clipSize - this.ammo;
    const ammoAvailable = Math.min(this.reserveAmmo, ammoNeeded);
    
    this.ammo += ammoAvailable;
    this.reserveAmmo -= ammoAvailable;
  }
  
  reset() {
    // Clear all projectiles
    for (const projectile of this.projectiles) {
      this.scene.remove(projectile.mesh);
    }
    this.projectiles = [];
    
    // Reset ammo
    this.ammo = this.clipSize;
    this.reserveAmmo = 90;
    this.isReloading = false;
    this.fireTimer = 0;
  }
}