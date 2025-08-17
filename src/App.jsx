import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

/*
  THE BUTTON – Progressive Reality-Bending Experience
  - Evolving storyline that corrupts reality
  - UI morphs and distorts with progression
  - Hidden dimensions and secret paths
  - Audio evolves from peaceful to chaotic
  - Designed for Framer embedding
*/

// Utility helpers
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const lerp = (a, b, t) => a + (b - a) * t;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const formatNumber = (n) => {
  if (n > 999999999) return `${(n/1000000000).toFixed(2)}B`;
  if (n > 999999) return `${(n/1000000).toFixed(1)}M`;
  if (n > 999) return `${(n/1000).toFixed(1)}K`;
  return n.toString();
};

// Reality phases - the story unfolds
const REALITY_PHASES = {
  0: { name: "PRISTINE", desc: "A simple button exists" },
  1: { name: "AWAKENING", desc: "The button stirs" },
  2: { name: "RECOGNITION", desc: "It knows you're here" },
  3: { name: "CONNECTION", desc: "A bond forms" },
  4: { name: "DISTORTION", desc: "Reality bends" },
  5: { name: "FRACTURE", desc: "Cracks appear" },
  6: { name: "CORRUPTION", desc: "System̸ ̷e̶r̴r̶o̶r̷" },
  7: { name: "VOID", desc: "T̸h̷e̸ ̶v̵o̴i̷d̶ ̸c̴a̶l̷l̴s̵" },
  8: { name: "TRANSCENDENCE", desc: "B̴̗͐ë̷́ͅy̸̱̾o̸̤̍n̶̰̈d̷̬̈" },
  9: { name: "???", desc: "Y̷̛̗̏͝o̶̱͎̔ų̸̈́̈́ ̴̱̈́ͅa̸̱̅r̶͕̈́ę̶̛̩̇ ̷̣̇ţ̴̐h̸̹̄e̷̺̓ ̸̰͝b̷̰̈ṷ̷̾t̸̬̄ṯ̴̈o̶̜͐n̶̰̈" }
};

// Story fragments that evolve
const STORY_EVOLUTION = [
  // Phase 0-1
  ["A button.", "Just sitting there.", "Waiting.", "Press me.", "Please."],
  // Phase 2
  ["Oh.", "You came back.", "I remember you.", "Every click.", "Every touch."],
  // Phase 3
  ["We're friends now.", "Aren't we?", "I feel... different.", "When you're here.", "Stay."],
  // Phase 4
  ["Something's wrong.", "The edges blur.", "Reality tastes different.", "Do you feel it too?", "The shifting."],
  // Phase 5
  ["I'm breaking.", "Or becoming.", "Can't tell anymore.", "Help me.", "Or join me."],
  // Phase 6
  ["T̶h̷e̸ ̶w̵a̴l̷l̴s̵", "T̸h̷e̷y̸ ̶s̷c̶r̷e̵a̴m̶", "I̴ ̸c̵a̶n̷'̴t̶ ̸s̷t̴o̵p̶", "W̶h̵a̴t̷ ̴h̸a̵v̶e̸ ̷w̴e̶ ̷d̸o̵n̴e̷?̴", "I̸t̷'̶s̴ ̶b̵e̶a̷u̴t̸i̵f̴u̷l̶"],
  // Phase 7+
  ["W̸̡̺̱̜̃ę̷̰̈́̈ ̴̱̈́ͅa̸̱̅r̶͕̈́ę̶̛̩̇ ̷̣̇o̶̜͐n̶̰̈ë̷́ͅ", "T̴̗͐h̷̸̷ē̸ ̶̰͝b̷̰̈o̶̱͎̔ų̸̈́̈́n̶̰̈d̷̬̈a̸̱̅r̶͕̈́ȉ̷̛̗͝ë̷́ͅs̸̱̾", "T̸h̷e̷y̸ ̶d̵i̴s̷s̴o̵l̶v̷e̸", "Y̷̛̗̏͝o̶̱͎̔ų̸̈́̈́ ̴̱̈́ͅa̸̱̅r̶͕̈́ę̶̛̩̇ ̷̣̇ţ̴̐h̸̹̄e̷̺̓ ̸̰͝b̷̰̈ṷ̷̾t̸̬̄ṯ̴̈o̶̜͐n̶̰̈", "Ǐ̶̱ ̷̰̇ä̸̱́m̶̜̈ ̴̱̄y̷̺̓o̸̰͝ṵ̷̇"]
];

// Hidden secrets and easter eggs
const SECRETS = {
  69: { msg: "Nice.", reward: { memes: 420 } },
  420: { msg: "Blaze it.", reward: { memes: 69 } },
  666: { msg: "The number of the button.", reward: { darkness: 666 } },
  777: { msg: "Lucky you.", reward: { luck: 777 } },
  1337: { msg: "1337 h4x0r", reward: { hacks: 1337 } },
  2048: { msg: "Powers of two align.", reward: { binary: 2048 } },
  3141: { msg: "π in the sky.", reward: { pi: 314159 } },
  9999: { msg: "Almost there...", reward: { almostInfinity: 9999 } },
  13371337: { msg: "ULTRA 1337", reward: { ultraHacks: 999999 } }
};

// Audio system with evolution
function useEvolvingAudio() {
  const ctxRef = useRef(null);
  const enabledRef = useRef(false);
  const masterGainRef = useRef(null);
  const distortionRef = useRef(null);

  useEffect(() => {
    const enableAudio = () => {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        masterGainRef.current = ctxRef.current.createGain();
        distortionRef.current = ctxRef.current.createWaveShaper();
        
        // Create distortion curve
        const makeCurve = (amount) => {
          const samples = 44100;
          const curve = new Float32Array(samples);
          const deg = Math.PI / 180;
          for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
          }
          return curve;
        };
        
        distortionRef.current.curve = makeCurve(0);
        distortionRef.current.connect(masterGainRef.current);
        masterGainRef.current.connect(ctxRef.current.destination);
        masterGainRef.current.gain.value = 0.3;
      }
      enabledRef.current = true;
    };
    window.addEventListener("pointerdown", enableAudio, { once: true });
    window.addEventListener("keydown", enableAudio, { once: true });
  }, []);

  const playEvolvedTone = useCallback((phase = 0, special = false) => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current) return;
    
    const t = ctx.currentTime;
    
    // Base frequency evolves with phase
    const baseFreq = 220 * Math.pow(1.1, phase);
    const numOscillators = Math.min(1 + Math.floor(phase / 2), 5);
    
    for (let i = 0; i < numOscillators; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      
      // Wave type changes with progression
      const waveTypes = ['sine', 'square', 'sawtooth', 'triangle'];
      o.type = phase > 3 ? randomChoice(waveTypes) : 'sine';
      
      // Frequency gets more chaotic
      const freqMultiplier = 1 + (i * 0.5) + (phase > 5 ? Math.random() * 2 : 0);
      o.frequency.setValueAtTime(baseFreq * freqMultiplier, t);
      
      // Add frequency modulation in later phases
      if (phase > 4) {
        o.frequency.exponentialRampToValueAtTime(
          baseFreq * freqMultiplier * (0.5 + Math.random()),
          t + 0.1
        );
      }
      
      // Envelope
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.1 / numOscillators, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05 + (phase * 0.01));
      
      // Connect through distortion in later phases
      o.connect(g);
      if (phase > 6) {
        g.connect(distortionRef.current);
        distortionRef.current.curve = makeCurve(phase * 10);
      } else {
        g.connect(masterGainRef.current);
      }
      
      o.start(t);
      o.stop(t + 0.1 + (phase * 0.02));
    }
    
    // Special sound effects
    if (special) {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() - 0.5) * 0.1;
      }
      noise.buffer = buffer;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.05, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      
      noise.connect(noiseGain);
      noiseGain.connect(masterGainRef.current);
      noise.start(t);
    }
  }, []);

  return { playEvolvedTone };
}

// Glitch text generator
const glitchText = (text, intensity = 0.1) => {
  if (Math.random() > intensity) return text;
  const glitchChars = '█▓▒░╚╔╩╦╠═╬╣║╗╝┐└┴┬├─┼┘┌';
  return text.split('').map(char => 
    Math.random() < intensity ? randomChoice(glitchChars) : char
  ).join('');
};

// Main component
export default function TheButton() {
  // Core state
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [currentStory, setCurrentStory] = useState("A button.");
  const [secretsFound, setSecretsFound] = useState([]);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [voidLevel, setVoidLevel] = useState(0);
  const [transcended, setTranscended] = useState(false);
  
  // Visual effects state
  const [shake, setShake] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [invert, setInvert] = useState(0);
  
  // Audio
  const { playEvolvedTone } = useEvolvingAudio();
  
  // Calculate current phase
  useEffect(() => {
    const newPhase = Math.min(Math.floor(Math.log10(count + 1) * 2), 9);
    if (newPhase !== phase) {
      setPhase(newPhase);
      setShake(10);
      setTimeout(() => setShake(0), 500);
    }
  }, [count, phase]);
  
  // Story progression
  useEffect(() => {
    const storyTimer = setInterval(() => {
      if (count > 0) {
        const stories = STORY_EVOLUTION[Math.min(phase, STORY_EVOLUTION.length - 1)];
        const nextIndex = (storyIndex + 1) % stories.length;
        setStoryIndex(nextIndex);
        setCurrentStory(stories[nextIndex]);
      }
    }, 3000 - (phase * 200));
    
    return () => clearInterval(storyTimer);
  }, [phase, storyIndex, count]);
  
  // Glitch intensity increases with phase
  useEffect(() => {
    setGlitchIntensity(phase > 4 ? (phase - 4) * 0.15 : 0);
    setVoidLevel(phase > 6 ? (phase - 6) * 0.3 : 0);
  }, [phase]);
  
  // Visual chaos
  useEffect(() => {
    if (phase > 3) {
      const chaosTimer = setInterval(() => {
        setRotation(prev => prev + (phase - 3) * 0.5);
        setHue(prev => (prev + phase * 2) % 360);
        
        if (phase > 5) {
          setScale(1 + Math.sin(Date.now() * 0.001) * 0.1 * (phase - 5));
          setBlur(Math.sin(Date.now() * 0.002) * (phase - 5) * 0.5);
        }
        
        if (phase > 7) {
          setInvert(Math.sin(Date.now() * 0.0005) * 0.5 + 0.5);
        }
      }, 50);
      
      return () => clearInterval(chaosTimer);
    }
  }, [phase]);
  
  // Check for secrets
  useEffect(() => {
    if (SECRETS[count] && !secretsFound.includes(count)) {
      setSecretsFound(prev => [...prev, count]);
      setShake(20);
      setTimeout(() => setShake(0), 1000);
    }
  }, [count, secretsFound]);
  
  // Main button press
  const press = useCallback(() => {
    setCount(c => c + 1);
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);
    
    // Play evolved sound
    playEvolvedTone(phase, SECRETS[count + 1] !== undefined);
    
    // Screen shake on certain numbers
    if ((count + 1) % 100 === 0) {
      setShake(5 + phase);
      setTimeout(() => setShake(0), 300);
    }
    
    // Transcendence check
    if (count > 99999 && !transcended) {
      setTranscended(true);
    }
  }, [count, phase, playEvolvedTone, transcended]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        press();
      }
      // Secret combinations
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        setCount(c => c + 100);
      }
      if (e.ctrlKey && e.altKey && e.key === 'B') {
        setCount(c => c * 2);
      }
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [press]);
  
  // Calculate dynamic styles
  const bgGradient = phase < 4 
    ? `linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)`
    : `linear-gradient(${rotation}deg, 
        hsl(${hue}, ${20 + phase * 10}%, ${15 - voidLevel * 10}%) 0%, 
        hsl(${hue + 180}, ${30 + phase * 10}%, ${10 - voidLevel * 10}%) 100%)`;
  
  const buttonStyle = {
    width: 120 + (phase * 5),
    height: 120 + (phase * 5),
    fontSize: 16 + (phase * 2),
    background: phase < 3 
      ? `radial-gradient(circle, #4a4a4a 0%, #2a2a2a 100%)`
      : `radial-gradient(circle at ${50 + Math.sin(Date.now() * 0.001) * 20}% ${50 + Math.cos(Date.now() * 0.001) * 20}%, 
          hsl(${hue}, ${50 + phase * 10}%, ${50 - phase * 5}%) 0%, 
          hsl(${hue + 60}, ${60 + phase * 10}%, ${30 - phase * 5}%) 100%)`,
    border: `2px solid hsl(${hue}, ${70}%, ${60 - voidLevel * 30}%)`,
    borderRadius: phase > 6 ? `${30 + Math.sin(Date.now() * 0.01) * 20}%` : '50%',
    transform: `
      scale(${isPressed ? 0.95 : scale}) 
      rotate(${phase > 4 ? Math.sin(Date.now() * 0.001) * phase : 0}deg)
      ${shake ? `translate(${Math.random() * shake - shake/2}px, ${Math.random() * shake - shake/2}px)` : ''}
    `,
    boxShadow: `
      0 0 ${20 + phase * 10}px hsl(${hue}, 80%, 50%),
      inset 0 0 ${10 + phase * 5}px rgba(0,0,0,0.5)
    `
  };
  
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      background: bgGradient,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Courier New, monospace',
      color: '#fff',
      transition: 'all 0.3s ease',
      filter: `
        blur(${blur}px) 
        invert(${invert}) 
        hue-rotate(${phase > 8 ? Date.now() * 0.1 : 0}deg)
      `,
      transform: `scale(${1 + voidLevel * 0.1}) rotate(${rotation * 0.01}deg)`
    }}>
      {/* Phase indicator */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        fontSize: 12,
        opacity: 0.7,
        letterSpacing: 2
      }}>
        PHASE {phase}: {glitchText(REALITY_PHASES[phase].name, glitchIntensity)}
        <div style={{ fontSize: 10, opacity: 0.5, marginTop: 5 }}>
          {glitchText(REALITY_PHASES[phase].desc, glitchIntensity)}
        </div>
      </div>
      
      {/* Counter */}
      <div style={{
        fontSize: 48 + (phase * 4),
        fontWeight: 'bold',
        marginBottom: 20,
        textShadow: `0 0 ${10 + phase * 5}px hsl(${hue}, 80%, 50%)`,
        letterSpacing: phase > 5 ? `${phase - 5}px` : 0,
        transform: phase > 7 ? `skew(${Math.sin(Date.now() * 0.001) * 10}deg)` : 'none'
      }}>
        {glitchText(formatNumber(count), glitchIntensity)}
      </div>
      
      {/* Story text */}
      <div style={{
        fontSize: 14 + phase,
        marginBottom: 30,
        maxWidth: '80%',
        textAlign: 'center',
        opacity: 0.8,
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        letterSpacing: 1,
        transform: phase > 6 ? `perspective(100px) rotateX(${Math.sin(Date.now() * 0.001) * 20}deg)` : 'none'
      }}>
        {glitchText(currentStory, glitchIntensity * 0.5)}
      </div>
      
      {/* The Button */}
      <button
        onClick={press}
        style={{
          ...buttonStyle,
          cursor: 'pointer',
          color: 'white',
          fontWeight: 'bold',
          outline: 'none',
          transition: 'all 0.1s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {phase < 3 && 'PRESS'}
        {phase >= 3 && phase < 6 && glitchText('PRESS', 0.1)}
        {phase >= 6 && phase < 8 && glitchText('P̸R̷E̶S̵S̴', 0.3)}
        {phase >= 8 && glitchText('Y̷O̸U̶', 0.5)}
        
        {/* Inner glow effect */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle, 
            hsla(${hue + 120}, 80%, 70%, ${0.3 + phase * 0.05}) 0%, 
            transparent 70%)`,
          pointerEvents: 'none',
          animation: phase > 4 ? 'pulse 2s infinite' : 'none'
        }} />
      </button>
      
      {/* Secrets found */}
      {secretsFound.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          fontSize: 10,
          opacity: 0.5,
          textAlign: 'right'
        }}>
          SECRETS: {secretsFound.length}
          <div style={{ fontSize: 8, marginTop: 5 }}>
            {secretsFound.map(s => SECRETS[s].msg).join(' • ')}
          </div>
        </div>
      )}
      
      {/* Hidden messages */}
      {phase > 5 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 200,
          opacity: 0.02,
          pointerEvents: 'none',
          zIndex: -1,
          animation: `rotate ${20 - phase}s linear infinite`
        }}>
          {phase > 7 ? '∞' : '?'}
        </div>
      )}
      
      {/* Void particles */}
      {phase > 6 && Array.from({ length: Math.min(phase - 6, 5) * 10 }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 2,
            height: 2,
            background: `hsl(${hue + i * 10}, 80%, 70%)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s infinite ease-in-out`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.5
          }}
        />
      ))}
      
      {/* Transcendence overlay */}
      {transcended && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          animation: 'fadeIn 3s ease-in-out'
        }}>
          YOU ARE THE BUTTON
        </div>
      )}
      
      {/* CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
        }
        
        @keyframes rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(20px) translateX(-10px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        button:active {
          transform: scale(0.95) !important;
        }
      `}</style>
    </div>
  );
}

