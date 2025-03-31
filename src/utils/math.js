import * as THREE from 'three';

// Random number within a range
export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Random integer within a range (inclusive)
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random position on ground within a radius
export function randomGroundPosition(centerX, centerZ, minRadius, maxRadius) {
  const angle = Math.random() * Math.PI * 2;
  const radius = randomRange(minRadius, maxRadius);
  
  const x = centerX + Math.cos(angle) * radius;
  const z = centerZ + Math.sin(angle) * radius;
  
  return new THREE.Vector3(x, 0, z);
}

// Lerp (linear interpolation)
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Clamp a value between min and max
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Map a value from one range to another
export function map(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

// Check if two boxes collide (AABB collision)
export function boxCollision(box1, box2) {
  return (
    box1.min.x <= box2.max.x &&
    box1.max.x >= box2.min.x &&
    box1.min.y <= box2.max.y &&
    box1.max.y >= box2.min.y &&
    box1.min.z <= box2.max.z &&
    box1.max.z >= box2.min.z
  );
}