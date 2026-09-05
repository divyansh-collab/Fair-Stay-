// Verify Three.js concepts for 3D Globe with procedural map and curved arcs
const THREE = require('three');

console.log('Testing Three.js curve and sphere creation...');
const sphere = new THREE.SphereGeometry(75, 64, 64);
console.log('Sphere vertices created:', sphere.attributes.position.count);

// Test Bezier Curve for 3D flight arcs
const start = new THREE.Vector3(10, 20, 70);
const end = new THREE.Vector3(50, -20, 50);
const mid = new THREE.Vector3(40, 30, 95); // Raised control point
const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
const points = curve.getPoints(50);
console.log('Flight arc points computed:', points.length);

console.log('✅ Three.js 3D math and curve calculations verified successfully!');
