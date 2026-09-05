/**
 * Test procedural world map canvas generator logic
 */
function getLandCoordinates() {
  // Normalized 0..1 coordinates for major landmasses
  return {
    india: [
      [0.68, 0.35], [0.70, 0.30], [0.74, 0.30], [0.76, 0.35],
      [0.75, 0.42], [0.74, 0.48], [0.72, 0.54], [0.71, 0.48], [0.68, 0.42]
    ]
  };
}

console.log('Landmass coordinates loaded:', Object.keys(getLandCoordinates()));
