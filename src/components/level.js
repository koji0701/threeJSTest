import * as THREE from 'three';

export class LevelManager {
  constructor(scene) {
    this.scene = scene;
    
    // Create ground
    this.createGround();
    
    // Create obstacles
    this.createObstacles();
    
    // Create boundaries
    this.createBoundaries();
  }
  
  createGround() {
    // Create a large ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1E8449, 
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    
    // Rotate to be horizontal and position at y=0
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    
    this.scene.add(ground);
  }
  
  createObstacles() {
    // Create a few random obstacles for cover
    this.obstacles = [];
    
    // Create boxes
    for (let i = 0; i < 20; i++) {
      const size = 1 + Math.random() * 2;
      const height = 1 + Math.random() * 2;
      
      const geometry = new THREE.BoxGeometry(size, height, size);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x808080,
        roughness: 0.7,
        metalness: 0.1
      });
      
      const box = new THREE.Mesh(geometry, material);
      
      // Random position (but not too close to center where player spawns)
      let x, z;
      do {
        x = (Math.random() - 0.5) * 80;
        z = (Math.random() - 0.5) * 80;
      } while (Math.sqrt(x * x + z * z) < 10);
      
      box.position.set(x, height / 2, z);
      box.castShadow = true;
      box.receiveShadow = true;
      
      this.scene.add(box);
      this.obstacles.push(box);
    }
    
    // Create some trees
    for (let i = 0; i < 15; i++) {
      const treeGroup = new THREE.Group();
      
      // Tree trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 1.0,
        metalness: 0.0
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      treeGroup.add(trunk);
      
      // Tree foliage (simple cone)
      const foliageGeometry = new THREE.ConeGeometry(1.5, 3, 8);
      const foliageMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x228B22,
        roughness: 1.0,
        metalness: 0.0
      });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.y = 4;
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      treeGroup.add(foliage);
      
      // Random position (but not too close to center)
      let x, z;
      do {
        x = (Math.random() - 0.5) * 80;
        z = (Math.random() - 0.5) * 80;
      } while (Math.sqrt(x * x + z * z) < 10);
      
      treeGroup.position.set(x, 0, z);
      this.scene.add(treeGroup);
      this.obstacles.push(treeGroup);
    }
  }
  
  createBoundaries() {
    // Create invisible walls to keep player and enemies in bounds
    const wallSize = 100;
    const wallHeight = 10;
    const wallThickness = 1;
    
    const wallGeometry = new THREE.BoxGeometry(wallSize, wallHeight, wallThickness);
    const wallMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFF0000,
      transparent: true,
      opacity: 0.0 // Invisible
    });
    
    // North wall
    const northWall = new THREE.Mesh(wallGeometry, wallMaterial);
    northWall.position.set(0, wallHeight / 2, -wallSize / 2);
    this.scene.add(northWall);
    
    // South wall
    const southWall = new THREE.Mesh(wallGeometry, wallMaterial);
    southWall.position.set(0, wallHeight / 2, wallSize / 2);
    this.scene.add(southWall);
    
    // East wall
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, wallSize),
      wallMaterial
    );
    eastWall.position.set(wallSize / 2, wallHeight / 2, 0);
    this.scene.add(eastWall);
    
    // West wall
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, wallSize),
      wallMaterial
    );
    westWall.position.set(-wallSize / 2, wallHeight / 2, 0);
    this.scene.add(westWall);
  }
}