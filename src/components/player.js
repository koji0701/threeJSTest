import * as THREE from 'three';
import { Weapon } from './weapon.js';

export class Player {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    // Player state
    this.health = 100;
    this.maxHealth = 100;
    this.isAlive = true;
    
    // Movement properties
    this.moveSpeed = 10; // Units per second
    this.jumpForce = 15;
    this.gravity = 30;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.isOnGround = false;
    
    // Camera properties
    this.lookSensitivity = 0.002;
    this.cameraHeight = 1.7; // Player eye height
    
    // Position and rotation
    this.position = new THREE.Vector3(0, this.cameraHeight, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ'); // YXZ order for FPS controls
    
    // Create player collision body (invisible)
    this.radius = 0.5;
    this.height = 2.0;
    this.collider = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius, this.height, 8),
      new THREE.MeshBasicMaterial({ 
        wireframe: true, 
        visible: false 
      })
    );
    this.collider.position.copy(this.position);
    this.collider.position.y = this.height / 2; // Center the collider vertically
    scene.add(this.collider);
    
    // Set up camera
    this.camera.position.copy(this.position);
    this.camera.rotation.copy(this.rotation);
    
    // Create weapon
    this.weapon = new Weapon(scene, camera);
  }
  
  update(deltaTime, input) {
    if (!this.isAlive) return;
    
    // Handle mouse look
    if (input.mouseMoved) {
      this.rotation.y -= input.mouseMovement.x * this.lookSensitivity;
      this.rotation.x -= input.mouseMovement.y * this.lookSensitivity;
      
      // Clamp vertical look (prevent over-rotation)
      this.rotation.x = Math.max(
        -Math.PI / 2 + 0.01, 
        Math.min(Math.PI / 2 - 0.01, this.rotation.x)
      );
      
      this.camera.rotation.copy(this.rotation);
      input.resetMouseMovement();
    }
    
    // Handle movement
    const moveDir = new THREE.Vector3(0, 0, 0);
    
    // Forward/backward
    if (input.isKeyPressed('s')) moveDir.z -= 1;
    if (input.isKeyPressed('w')) moveDir.z += 1;
    
    // Left/right
    if (input.isKeyPressed('a')) moveDir.x -= 1;
    if (input.isKeyPressed('d')) moveDir.x += 1;
    
    // Normalize movement vector to prevent faster diagonal movement
    if (moveDir.length() > 0) {
      moveDir.normalize();
    }
    
    // Apply camera direction to movement
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
    
    const right = new THREE.Vector3(1, 0, 0);
    right.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
    
    const movement = new THREE.Vector3();
    movement.addScaledVector(forward, moveDir.z * this.moveSpeed * deltaTime);
    movement.addScaledVector(right, moveDir.x * this.moveSpeed * deltaTime);
    
    // Apply gravity and jumping
    if (this.isOnGround && input.isKeyPressed(' ')) {
      this.velocity.y = this.jumpForce;
      this.isOnGround = false;
    }
    
    if (!this.isOnGround) {
      this.velocity.y -= this.gravity * deltaTime;
    }
    
    // Apply vertical velocity
    movement.y = this.velocity.y * deltaTime;
    
    // Move the player
    this.position.add(movement);
    
    // Simple ground collision (can be replaced with more complex collision)
    if (this.position.y < this.cameraHeight) {
      this.position.y = this.cameraHeight;
      this.velocity.y = 0;
      this.isOnGround = true;
    }
    
    // Update collider position
    this.collider.position.x = this.position.x;
    this.collider.position.z = this.position.z;
    this.collider.position.y = this.position.y - this.cameraHeight + this.height / 2;
    
    // Update camera position
    this.camera.position.copy(this.position);
    
    // Handle shooting
    if (input.isMouseButtonPressed(0)) {
      this.weapon.shoot();
    }
    
    // Update weapon
    this.weapon.update(deltaTime);
  }
  
  takeDamage(amount) {
    this.health -= amount;
    
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }
  
  die() {
    this.isAlive = false;
    
    // Trigger game over in parent game instance
    if (this.scene.parent?.gameOver) {
      this.scene.parent.gameOver();
    }
  }
  
  reset() {
    this.health = this.maxHealth;
    this.isAlive = true;
    this.position.set(0, this.cameraHeight, 0);
    this.rotation.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.camera.position.copy(this.position);
    this.camera.rotation.copy(this.rotation);
    this.weapon.reset();
  }
  
  // Getters for collision detection
  getBoundingBox() {
    return new THREE.Box3().setFromObject(this.collider);
  }
}