import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  amplitude: number; // Current talking amplitude (0 to 1)
  isListening: boolean; // Listening state
  isSpeaking: boolean; // Active speak state
  colorMode?: 'cyan' | 'purple' | 'matrix';
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  amplitude,
  isListening,
  isSpeaking,
  colorMode = 'cyan'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  // Define colors based on theme mode
  const getThemeColors = () => {
    switch (colorMode) {
      case 'purple':
        return {
          glow: 'rgba(168, 85, 247, 0.6)',
          primary: '#a855f7',
          secondary: '#ec4899',
          ambient: 'rgba(168, 85, 247, 0.08)'
        };
      case 'matrix':
        return {
          glow: 'rgba(34, 197, 94, 0.6)',
          primary: '#22c55e',
          secondary: '#10b981',
          ambient: 'rgba(34, 197, 94, 0.08)'
        };
      case 'cyan':
      default:
        return {
          glow: 'rgba(0, 245, 255, 0.6)',
          primary: '#00F5FF',
          secondary: '#3b82f6',
          ambient: 'rgba(0, 245, 255, 0.08)'
        };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 280;
      canvas.height = canvas.parentElement?.clientHeight || 280;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track smooth transitions of values
    let currentScale = 1.0;
    let targetScale = 1.0;
    const particles: Array<{ x: number; y: number; angle: number; speed: number; size: number; alpha: number }> = [];

    // Instantiate background holographic particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: 0,
        y: 0,
        angle: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.8,
        size: 1 + Math.random() * 2,
        alpha: 0.1 + Math.random() * 0.4
      });
    }

    const draw = () => {
      if (!ctx || !canvas) return;

      const colors = getThemeColors();
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;

      // Make base circle size
      const baseRadius = Math.min(w, h) * 0.25;

      // Adjust target scale based on amplitude, speaking or listening
      if (isListening) {
        targetScale = 1.15 + Math.sin(phaseRef.current * 8) * 0.1;
      } else if (isSpeaking) {
        targetScale = 1.0 + amplitude * 0.5;
      } else {
        targetScale = 1.0 + Math.sin(phaseRef.current * 1.5) * 0.04;
      }

      // Linear interpolation for smooth springy animations
      currentScale += (targetScale - currentScale) * 0.15;
      phaseRef.current += isListening ? 0.08 : isSpeaking ? 0.05 + amplitude * 0.08 : 0.02;

      ctx.clearRect(0, 0, w, h);

      // Create a background depth ambient glow
      const bgGrad = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.2, centerX, centerY, baseRadius * 2);
      bgGrad.addColorStop(0, colors.ambient);
      bgGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Render futuristic network grid circles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * r * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw holographic orbiting dots
      particles.forEach((p) => {
        p.angle += p.speed * 0.01;
        const dist = baseRadius * currentScale + (isListening ? 30 : 15) * Math.sin(p.angle * 3 + phaseRef.current);
        const px = centerX + Math.cos(p.angle) * dist;
        const py = centerY + Math.sin(p.angle) * dist;

        ctx.fillStyle = colors.primary;
        ctx.globalAlpha = p.alpha * (isListening ? 1.0 : isSpeaking ? 0.8 : 0.4);
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw active multi-layered waves in core
      const layers = 3;
      for (let l = 0; l < layers; l++) {
        ctx.beginPath();
        const pMod = phaseRef.current + l * (Math.PI / 3);
        const radiusVal = baseRadius * (1.0 - l * 0.1) * currentScale;

        // Custom wavy ring formula
        const points = 72;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          let wave = 0;

          if (isListening) {
            wave = Math.sin(angle * 6 + pMod) * 12;
            wave += Math.cos(angle * 12 - pMod * 1.5) * 6;
          } else if (isSpeaking) {
            wave = Math.sin(angle * 8 + pMod * 2) * (18 * amplitude);
            wave += Math.cos(angle * 4 - pMod) * (8 * amplitude);
          } else {
            wave = Math.sin(angle * 3 + pMod) * 3;
          }

          const r = radiusVal + wave;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();
        ctx.strokeStyle = l === 0 ? colors.primary : colors.secondary;
        ctx.lineWidth = l === 0 ? 3 : 1;
        ctx.shadowBlur = l === 0 ? 15 : 5;
        ctx.shadowColor = colors.glow;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow
      }

      // Draw a sleek inner central glowing indicator
      const innerGrad = ctx.createRadialGradient(centerX, centerY, 1, centerX, centerY, baseRadius * 0.4);
      innerGrad.addColorStop(0, colors.primary);
      innerGrad.addColorStop(0.5, colors.secondary);
      innerGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGrad;
      ctx.globalAlpha = isListening ? 0.9 : isSpeaking ? 0.7 + amplitude * 0.3 : 0.4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Outer rings with tech notches
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.4, phaseRef.current, phaseRef.current + Math.PI * 0.6);
      ctx.stroke();

      ctx.strokeStyle = colors.secondary;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.55, -phaseRef.current, -phaseRef.current + Math.PI * 0.45);
      ctx.stroke();

      // UI text showing current state in center
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const statusText = isListening ? '• LISTENING •' : isSpeaking ? '• SPEAKING •' : '• STANDBY •';
      ctx.fillText(statusText, centerX, centerY);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [amplitude, isListening, isSpeaking, colorMode]);

  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[260px] cursor-pointer">
      <canvas
        ref={canvasRef}
        className="w-full h-full drop-shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        id="voice_canvas_element"
      />
      {/* Outer ambient pulsing lights decoration */}
      <div className={`absolute w-44 h-44 rounded-full blur-[100px] transition-all duration-700 pointer-events-none -z-10
        ${isListening ? 'bg-cyan-500/10 scale-125' : isSpeaking ? 'bg-purple-500/10 scale-110' : 'bg-cyan-500/5'}`} />
    </div>
  );
};
