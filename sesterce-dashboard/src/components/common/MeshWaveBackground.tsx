import React, { useEffect, useRef } from 'react';

class Point {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  amplitude: number;
  phase: number;

  constructor(x: number, y: number) {
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.amplitude = 0;
    this.phase = Math.random() * Math.PI * 2;
  }

  update(time: number, waves: Wave[], mouseX: number, mouseY: number) {
    // Natural oscillation
    const naturalWave = Math.sin(time * 0.003 + this.phase) * 0.5;

    // Calculate displacement from waves
    let dx = 0;
    let dy = 0;
    let totalAmplitude = 0;

    waves.forEach(wave => {
      const distX = this.baseX - wave.x;
      const distY = this.baseY - wave.y;
      const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < wave.radius) {
          const waveStrength = (1 - distance / wave.radius) * wave.strength;
          const angle = Math.atan2(distY, distX);
          const displacement = Math.sin(distance * 0.02 - wave.phase) * waveStrength * 8; // Reduced displacement

          dx += Math.cos(angle) * displacement;
          dy += Math.sin(angle) * displacement;
          totalAmplitude += waveStrength * 0.5; // Reduced amplitude effect
        }
    });

    // Add mouse influence
    const mouseDistX = this.baseX - mouseX;
    const mouseDistY = this.baseY - mouseY;
    const mouseDist = Math.sqrt(mouseDistX * mouseDistX + mouseDistY * mouseDistY);

    if (mouseDist < 150) {
      const mouseInfluence = (1 - mouseDist / 150) * 10;
      dx += (mouseDistX / mouseDist) * mouseInfluence;
      dy += (mouseDistY / mouseDist) * mouseInfluence;
    }

    // Apply spring physics
    this.vx += (this.baseX - this.x) * 0.04;
    this.vy += (this.baseY - this.y) * 0.04;
    this.vx *= 0.92;
    this.vy *= 0.92;

    this.x = this.baseX + dx + this.vx;
    this.y = this.baseY + dy + this.vy + naturalWave * 2;
    this.amplitude = totalAmplitude;
  }
}

class Wave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  strength: number;
  phase: number;
  lifespan: number;

  constructor(x: number, y: number, maxRadius: number) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = maxRadius;
    this.speed = 3; // Slower wave propagation
    this.strength = 0.6; // Gentler strength
    this.phase = 0;
    this.lifespan = 1;
  }

  update(): boolean {
    this.radius += this.speed;
    this.phase += 0.2;
    this.lifespan = Math.max(0, 1 - (this.radius / this.maxRadius));
    this.strength = this.lifespan * 0.8;

    // Slow down as it expands
    this.speed *= 0.997;

    return this.radius < this.maxRadius;
  }
}

export const MeshWaveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const pointsRef = useRef<Point[]>([]);
  const wavesRef = useRef<Wave[]>([]);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number;
    const gridSize = 25;


    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();

      // Create grid of points
      const cols = Math.ceil(width / gridSize);
      const rows = Math.ceil(height / gridSize);

      pointsRef.current = [];
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          pointsRef.current.push(new Point(i * gridSize, j * gridSize));
        }
      }

      // Start with multiple waves behind login box area
      wavesRef.current = [
        new Wave(width / 2, height / 2, Math.max(width, height)),
        new Wave(width * 0.3, height * 0.4, Math.max(width, height)),
        new Wave(width * 0.7, height * 0.6, Math.max(width, height)),
        new Wave(width * 0.4, height * 0.7, Math.max(width, height)),
        new Wave(width * 0.6, height * 0.3, Math.max(width, height))
      ];
    };

    const drawMesh = () => {
      // Fill with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw connections between nearby points
      pointsRef.current.forEach((point, i) => {
        pointsRef.current.forEach((otherPoint, j) => {
          if (i < j) {
            const dx = point.x - otherPoint.x;
            const dy = point.y - otherPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < gridSize * 1.8) {
              const opacity = Math.max(0, 1 - distance / (gridSize * 1.8));
              const amplitude = (point.amplitude + otherPoint.amplitude) / 2;
              const brightness = 0.15 + amplitude * 0.3; // Reduced brightness
              const lineWidth = Math.min(0.3 + amplitude * 0.5, 0.8); // Thinner lines, capped

              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * brightness * 0.6})`;
              ctx.lineWidth = lineWidth;
              ctx.beginPath();
              ctx.moveTo(point.x, point.y);
              ctx.lineTo(otherPoint.x, otherPoint.y);
              ctx.stroke();
            }
          }
        });

        // Draw nodes - smaller and more refined
        const nodeSize = Math.min(0.8 + point.amplitude * 1.2, 2.0); // Smaller, capped size
        const nodeOpacity = 0.15 + point.amplitude * 0.4; // Reduced opacity

        ctx.fillStyle = `rgba(255, 255, 255, ${nodeOpacity})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, nodeSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Remove wave circles visualization for cleaner look
    };

    const animate = () => {
      timeRef.current++;

      // Update waves
      wavesRef.current = wavesRef.current.filter(wave => wave.update());

      // Generate gentle waves more randomly across the surface (lake-like)
      if (timeRef.current % 120 === 0) { // Less frequent
        const x = Math.random() * width;
        const y = Math.random() * height;
        wavesRef.current.push(new Wave(x, y, Math.max(width, height)));
      }

      // Occasionally add subtle waves from random positions
      if (timeRef.current % 180 === 0) { // Even less frequent
        const x = Math.random() * width;
        const y = Math.random() * height;
        wavesRef.current.push(new Wave(x, y, Math.max(width, height)));
      }

      // Update points
      pointsRef.current.forEach(point => point.update(timeRef.current, wavesRef.current, mouseRef.current.x, mouseRef.current.y));

      // Draw everything
      drawMesh();

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleClick = (e: MouseEvent) => {
      if (e.target === canvas) {
        wavesRef.current.push(new Wave(e.clientX, e.clientY, Math.max(window.innerWidth, window.innerHeight)));
      }
    };

    // Initialize and start
    init();
    animate();

    // Event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
};
