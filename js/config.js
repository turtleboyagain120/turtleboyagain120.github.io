export const ThemeConfig = {
  primary: '#667eea',
  secondary: '#764ba2',
  particleColor: 'rgba(255,255,255,0.6)',
  particleConnectDist: 150,
  nodeConnectDist: 200
};

export const ParticleConfig = {
  count: 120,  // Dense for fancy network
  minRadius: 1.5,
  maxRadius: 4,
  minSpeed: 0.1,
  maxSpeed: 0.8,
  connections: true
};

export const TypewriterTexts = [
  'Software Engineer',
  'Proxy Architect',
  'License Expert',
  'AI Strategist',
  'Open-Source Guardian',
  'Precision Developer'
];

export function createParticles(canvas) {
  const particles = [];
  for (let i = 0; i < ParticleConfig.count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * ParticleConfig.maxSpeed * 2,
      vy: (Math.random() - 0.5) * ParticleConfig.maxSpeed * 2,
      radius: ParticleConfig.minRadius + Math.random() * (ParticleConfig.maxRadius - ParticleConfig.minRadius),
      hue: Math.random() * 360
    });
  }
  return particles;
}

