import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  THEBUTTON – Infinite Receipt Clicker Experience
  - Receipt-style mobile-first design
  - 1000s of iterations and possibilities
  - Dynamic falling particles and effects
  - Procedural content generation
  - Nearly impossible to reach the end
  - Exponential complexity scaling
*/

// Utility helpers
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const lerp = (a, b, t) => a + (b - a) * t;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const formatNumber = (n) => n > 999999 ? `${(n/1000000).toFixed(1)}M` : n > 999 ? `${(n/1000).toFixed(1)}K` : n.toString();

// Massive expansion of currencies (20+ types)
const CURRENCIES = {
  clicks: 'Clicks',
  echoes: 'Echoes', 
  whispers: 'Whispers',
  fragments: 'Fragments',
  void: 'Void Energy',
  dreams: 'Dream Threads',
  pixels: 'Pixels',
  glitches: 'Glitches',
  memories: 'Memories',
  essence: 'Essence',
  quantum: 'Quantum Bits',
  stardust: 'Stardust',
  tears: 'Digital Tears',
  shadows: 'Shadow Essence',
  light: 'Pure Light',
  chaos: 'Chaos Energy',
  order: 'Order Crystals',
  time: 'Time Shards',
  space: 'Space Dust',
  reality: 'Reality Fragments',
  infinity: 'Infinity Points',
  transcendence: 'Transcendence'
};

// Exponential milestone system (500+ milestones)
const generateMilestones = () => {
  const milestones = [];
  const messages = [
    "Hello.", "Keep going.", "The button notices you.", "You feel watched.", 
    "Something clicks back.", "The air thickens.", "You hear whispers.",
    "A door creaks open.", "The button watches back.", "You crossed a thin place.",
    "The room breathes with you.", "Reality bends slightly.", "Time hiccups.",
    "The void whispers your name.", "Dreams bleed into reality.", "Pixels fall like rain.",
    "Glitches multiply in the corners.", "Memories fragment and scatter.",
    "Essence flows between dimensions.", "Quantum uncertainty spreads.",
    "Stardust coalesces around you.", "Digital tears form and fall.",
    "Shadows dance without light.", "Pure light pierces the darkness.",
    "Chaos and order spiral together.", "Time shards reflect infinity.",
    "Space dust settles on your soul.", "Reality fragments into possibility.",
    "Infinity unfolds before you.", "Transcendence awaits."
  ];
  
  // Generate exponentially spaced milestones
  for (let i = 0; i < 500; i++) {
    const baseValue = Math.floor(Math.pow(1.1 + (i * 0.001), i + 1));
    const milestone = {
      at: baseValue,
      msg: randomChoice(messages) + (Math.random() < 0.3 ? ` [${Math.floor(Math.random() * 9999)}]` : ''),
      type: randomChoice(['whisper', 'line', 'reward', 'glitch', 'story', 'unlock', 'secret', 'dimensional', 'quantum', 'transcendent']),
      rewards: generateRandomRewards(i)
    };
    milestones.push(milestone);
  }
  
  return milestones;
};

const generateRandomRewards = (level) => {
  const rewards = {};
  const currencies = Object.keys(CURRENCIES);
  const numRewards = Math.min(1 + Math.floor(level / 50), 5);
  
  for (let i = 0; i < numRewards; i++) {
    const currency = randomChoice(currencies);
    const amount = Math.floor(Math.pow(1.2, level) * (1 + Math.random() * 2));
    rewards[currency] = (rewards[currency] || 0) + amount;
  }
  
  return rewards;
};

// Dynamic story generation system
const STORY_FRAGMENTS = {
  beginnings: [
    "You found a button in", "There was nothing but", "The room contained only", 
    "In the silence, you discovered", "Between reality and dream,", "At the edge of perception,",
    "In a place that shouldn't exist,", "Beyond the veil of consciousness,", "In the space between thoughts,"
  ],
  middles: [
    "an empty room", "a forgotten space", "the void between worlds", "a digital purgatory",
    "the echo of existence", "a fragment of time", "the memory of light",
    "the shadow of tomorrow", "the whisper of infinity", "the heartbeat of chaos"
  ],
  endings: [
    "with only a soft pulse.", "that knew your name.", "waiting for your touch.",
    "counting backwards to zero.", "dreaming of being pressed.", "remembering every click.",
    "existing only when observed.", "questioning its own reality.", "becoming one with you."
  ],
  developments: [
    "Each click trained a listening", "The button learned to anticipate", "Reality bent around",
    "Time folded with each", "The void responded to", "Digital tears formed from",
    "Quantum echoes multiplied", "Shadows danced between", "Light refracted through",
    "Memories crystallized around", "Dreams leaked into", "Chaos ordered itself around"
  ],
  progressions: [
    "on both ends.", "your rhythms.", "the simple act.", "gentle touch.", "every press.",
    "accumulated love.", "with each gesture.", "your intentions.", "shared existence.",
    "the connection.", "this ritual.", "divine repetition."
  ]
};

const generateStoryLine = (index, weirdness) => {
  const complexity = Math.floor(weirdness * 10);
  if (index < 10) {
    return `${randomChoice(STORY_FRAGMENTS.beginnings)} ${randomChoice(STORY_FRAGMENTS.middles)} ${randomChoice(STORY_FRAGMENTS.endings)}`;
  } else if (index < 50) {
    return `${randomChoice(STORY_FRAGMENTS.developments)} ${randomChoice(STORY_FRAGMENTS.progressions)}`;
  } else {
    // Advanced procedural story generation
    const fragments = Math.min(2 + Math.floor(complexity / 2), 5);
    let story = "";
    for (let i = 0; i < fragments; i++) {
      story += randomChoice([...Object.values(STORY_FRAGMENTS)].flat()) + (i < fragments - 1 ? " " : "");
    }
    return story + (Math.random() < weirdness ? " [ERROR_DATA_CORRUPTED]" : "");
  }
};

// Massive upgrade system (100+ upgrades)
const generateUpgrades = () => {
  const baseUpgrades = [
    { name: "Flow State", desc: "Streak bonuses increase faster", baseCost: 10, unlockAt: 100 },
    { name: "Whisper Magnet", desc: "Attract more whispers", baseCost: 25, unlockAt: 200 },
    { name: "Fragment Lens", desc: "See hidden patterns", baseCost: 50, unlockAt: 500 },
    { name: "Void Touch", desc: "Each click touches the void", baseCost: 100, unlockAt: 666 },
    { name: "Dream Weaver", desc: "Weave reality with clicks", baseCost: 200, unlockAt: 1000 },
    { name: "Pixel Rain", desc: "Pixels fall from the sky", baseCost: 300, unlockAt: 1500 },
    { name: "Glitch Mode", desc: "Embrace the glitch", baseCost: 500, unlockAt: 2000 },
    { name: "Memory Bank", desc: "Store click memories", baseCost: 750, unlockAt: 2500 },
    { name: "Essence Flow", desc: "Channel pure essence", baseCost: 1000, unlockAt: 3000 },
    { name: "Quantum Touch", desc: "Exist in multiple states", baseCost: 1500, unlockAt: 4000 }
  ];
  
  // Generate procedural upgrades
  const upgrades = [...baseUpgrades];
  const prefixes = ["Auto", "Super", "Mega", "Ultra", "Hyper", "Meta", "Neo", "Quantum", "Cosmic", "Divine"];
  const suffixes = ["Amplifier", "Multiplier", "Generator", "Synthesizer", "Harmonizer", "Optimizer", "Transcender"];
  const effects = ["click generation", "reality bending", "time dilation", "space warping", "dimension shifting"];
  
  for (let i = 0; i < 90; i++) {
    const level = Math.floor(i / 10) + 1;
    const tier = Math.floor(i / 30);
    upgrades.push({
      id: `proc_upgrade_${i}`,
      name: `${randomChoice(prefixes)} ${randomChoice(suffixes)} Lv.${level}`,
      desc: `Enhanced ${randomChoice(effects)} (Tier ${tier + 1})`,
      baseCost: Math.floor(Math.pow(1.5, i + 10)),
      unlockAt: baseUpgrades.length * 500 + (i * 1000),
      tier
    });
  }
  
  return upgrades;
};

// Falling particle system
const FallingParticle = ({ type, delay = 0, onComplete }) => {
  const startX = Math.random() * window.innerWidth;
  const duration = randomBetween(3, 8);
  const size = randomBetween(2, 8);
  const rotation = randomBetween(0, 360);
  
  const getParticleStyle = () => {
    switch (type) {
      case 'pixel': return { background: `hsl(${Math.random() * 360}, 80%, 60%)`, width: size, height: size };
      case 'fragment': return { background: 'rgba(255,255,255,0.8)', width: size * 1.5, height: 1, transform: `rotate(${rotation}deg)` };
      case 'tear': return { background: 'rgba(100,200,255,0.9)', borderRadius: '50%', width: size, height: size * 2 };
      case 'glitch': return { background: `hsl(${Math.random() * 360}, 100%, 50%)`, width: size, height: size, filter: 'blur(1px)' };
      case 'star': return { background: 'rgba(255,255,255,0.9)', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', width: size, height: size };
      default: return { background: 'rgba(255,255,255,0.5)', borderRadius: '50%', width: size, height: size };
    }
  };
  
  return (
    <motion.div
      initial={{ x: startX, y: -20, opacity: 0, rotate: 0 }}
      animate={{ x: startX + randomBetween(-100, 100), y: window.innerHeight + 20, opacity: [0, 1, 1, 0], rotate: rotation * 2 }}
      transition={{ duration, delay, ease: "linear" }}
      onAnimationComplete={onComplete}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 1000,
        ...getParticleStyle()
      }}
    />
  );
};

// Enhanced audio system
function useAdvancedAudio() {
  const ctxRef = useRef(null);
  const enabledRef = useRef(false);
  const masterGainRef = useRef(null);

  useEffect(() => {
    const enableAudio = () => {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        masterGainRef.current = ctxRef.current.createGain();
        masterGainRef.current.connect(ctxRef.current.destination);
        masterGainRef.current.gain.value = 0.2;
      }
      enabledRef.current = true;
    };
    window.addEventListener("pointerdown", enableAudio, { once: true });
    window.addEventListener("keydown", enableAudio, { once: true });
  }, []);

  const playTone = useCallback((freq = 440, dur = 0.04, waveType = "sine", vol = 0.1) => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current) return;
    
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    
    o.type = waveType;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    
    o.connect(g);
    g.connect(masterGainRef.current);
    o.start(t);
    o.stop(t + dur + 0.02);
  }, []);

  return { playTone };
}

export default function App() {
  // Core state
  const [currencies, setCurrencies] = useState(() => {
    const saved = localStorage.getItem("btn-currencies-v2");
    const defaultCurrencies = {};
    Object.keys(CURRENCIES).forEach(key => defaultCurrencies[key] = 0);
    return saved ? { ...defaultCurrencies, ...JSON.parse(saved) } : defaultCurrencies;
  });

  const [upgrades, setUpgrades] = useState(() => {
    const saved = localStorage.getItem("btn-upgrades-v2");
    return saved ? JSON.parse(saved) : {};
  });

  // Generate dynamic content
  const MILESTONES = useMemo(() => generateMilestones(), []);
  const UPGRADES = useMemo(() => generateUpgrades(), []);

  const [feed, setFeed] = useState([]);
  const [particles, setParticles] = useState([]);
  const [secretsFound, setSecretsFound] = useState(() => {
    const saved = localStorage.getItem("btn-secrets-v2");
    return saved ? JSON.parse(saved) : [];
  });

  // Interactive state
  const [streak, setStreak] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [dimensionalShift, setDimensionalShift] = useState(0);
  const [realityGlitch, setRealityGlitch] = useState(false);
  const [quantumState, setQuantumState] = useState('stable');

  // Audio
  const { playTone } = useAdvancedAudio();
  const lastClick = useRef(0);

  // Calculate progression
  const count = currencies.clicks;
  const weirdness = clamp(count / 1000000, 0, 1); // Scale to 1M for near-impossibility
  const complexity = Math.floor(weirdness * 1000);
  
  // Dynamic environment
  const environmentHue = (Date.now() * 0.01 + complexity * 2) % 360;
  const environmentSat = Math.min(30 + complexity / 10, 80);
  const environmentLight = Math.max(5, 15 - complexity / 100);

  // Save progress
  useEffect(() => {
    localStorage.setItem("btn-currencies-v2", JSON.stringify(currencies));
  }, [currencies]);

  useEffect(() => {
    localStorage.setItem("btn-upgrades-v2", JSON.stringify(upgrades));
  }, [upgrades]);

  useEffect(() => {
    localStorage.setItem("btn-secrets-v2", JSON.stringify(secretsFound));
  }, [secretsFound]);

  // Milestone system
  useEffect(() => {
    const m = MILESTONES.find(m => m.at === count);
    if (m) {
      setFeed(f => [{ 
        key: Date.now(), 
        msg: m.msg, 
        type: m.type,
        timestamp: new Date().toLocaleTimeString()
      }, ...f].slice(0, 20));
      
      // Award rewards
      if (m.rewards) {
        setCurrencies(curr => {
          const newCurr = { ...curr };
          Object.entries(m.rewards).forEach(([currency, amount]) => {
            newCurr[currency] = (newCurr[currency] || 0) + amount;
          });
          return newCurr;
        });
      }
      
      // Special effects for major milestones
      if (count % 1000 === 0) {
        setDimensionalShift(prev => prev + 1);
        triggerParticleEffect('star', 20);
      }
      
      if (count % 10000 === 0) {
        setRealityGlitch(true);
        setTimeout(() => setRealityGlitch(false), 5000);
      }
      
      if (count % 100000 === 0) {
        setQuantumState('superposition');
        setTimeout(() => setQuantumState('stable'), 10000);
      }
    }
  }, [count, MILESTONES]);

  // Particle effects
  const triggerParticleEffect = (type, count = 5) => {
    for (let i = 0; i < count; i++) {
      const id = Date.now() + i;
      setParticles(prev => [...prev, { id, type, delay: i * 0.1 }]);
    }
  };

  // Random events and effects
  useEffect(() => {
    if (count < 10) return;
    
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        const effects = ['pixel', 'fragment', 'tear', 'glitch'];
        triggerParticleEffect(randomChoice(effects), Math.floor(Math.random() * 3) + 1);
      }
      
      if (Math.random() < 0.05) {
        const mysteriousMessages = [
          "The button remembers...", "Reality shifts slightly...", "Time hiccups...",
          "You are not alone...", "The void watches...", "Dreams leak through...",
          "Pixels rain down...", "Memory fragments surface...", "Quantum echoes multiply..."
        ];
        setFeed(f => [{ 
          key: Date.now(), 
          msg: randomChoice(mysteriousMessages), 
          type: 'mystery',
          timestamp: new Date().toLocaleTimeString()
        }, ...f].slice(0, 20));
      }
    }, 2000 - Math.min(count, 1500));

    return () => clearInterval(interval);
  }, [count]);

  // Main click handler with exponential complexity
  const press = useCallback(() => {
    const now = performance.now();
    if (now - lastClick.current < 10) return;
    
    lastClick.current = now;
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);
    
    // Calculate rewards with exponential scaling
    let baseReward = 1;
    let bonusMultiplier = 1;
    
    // Streak bonus
    setStreak(s => Math.min(s + 1, 999999));
    if (streak > 10) bonusMultiplier *= (1 + Math.log(streak) / 10);
    
    // Upgrade bonuses (exponential scaling)
    Object.keys(upgrades).forEach(upgradeId => {
      const upgrade = UPGRADES.find(u => u.id === upgradeId);
      if (upgrade) {
        bonusMultiplier *= (1 + (upgrade.tier || 0) * 0.1);
      }
    });
    
    // Dimensional bonuses
    if (dimensionalShift > 0) bonusMultiplier *= Math.pow(1.1, dimensionalShift);
    
    // Quantum state bonuses
    if (quantumState === 'superposition') bonusMultiplier *= randomBetween(1, 10);
    
    const finalReward = Math.floor(baseReward * bonusMultiplier);
    
    // Apply rewards to multiple currencies
    setCurrencies(c => {
      const newCurr = { ...c };
      newCurr.clicks += finalReward;
      
      // Secondary currency generation (exponential probabilities)
      const currencies = Object.keys(CURRENCIES).slice(1);
      currencies.forEach((currency, idx) => {
        const baseChance = Math.max(0.01, 0.5 / Math.pow(2, idx));
        const scaledChance = baseChance * (1 + Math.log(count + 1) / 100);
        if (Math.random() < scaledChance) {
          newCurr[currency] = (newCurr[currency] || 0) + Math.floor(Math.random() * (idx + 1) + 1);
        }
      });
      
      return newCurr;
    });
    
    // Audio feedback with complexity scaling
    const baseFreq = 220 + (complexity * 2);
    const waveType = quantumState === 'superposition' ? 'square' : 'sine';
    playTone(baseFreq + Math.random() * 200, 0.05, waveType);
    
    // Visual effects
    if (Math.random() < 0.1 + weirdness * 0.5) {
      triggerParticleEffect(randomChoice(['pixel', 'fragment', 'tear']), 1);
    }
    
  }, [streak, upgrades, dimensionalShift, quantumState, complexity, weirdness, count, playTone, UPGRADES]);

  // Upgrade system
  const buyUpgrade = (upgradeId) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade || upgrades[upgradeId]) return;
    
    const cost = Math.floor(upgrade.baseCost * Math.pow(1.2, Object.keys(upgrades).length));
    if (currencies.clicks >= cost) {
      setCurrencies(c => ({ ...c, clicks: c.clicks - cost }));
      setUpgrades(u => ({ ...u, [upgradeId]: true }));
      setFeed(f => [{ 
        key: Date.now(), 
        msg: `${upgrade.name} PURCHASED`, 
        type: 'upgrade',
        timestamp: new Date().toLocaleTimeString()
      }, ...f].slice(0, 20));
    }
  };

  // Available upgrades (limited display)
  const availableUpgrades = UPGRADES
    .filter(u => count >= u.unlockAt && !upgrades[u.id])
    .slice(0, 3);

  return (
    <div style={{
      fontFamily: "Courier New, monospace",
      background: `linear-gradient(180deg, 
        hsl(${environmentHue}, ${environmentSat}%, ${environmentLight}%) 0%,
        hsl(${environmentHue + 30}, ${environmentSat}%, ${environmentLight - 5}%) 100%)`,
      minHeight: "100vh",
      color: weirdness > 0.5 ? `hsl(${environmentHue + 180}, 80%, 90%)` : '#e0e0e0',
      position: "relative",
      overflow: "hidden",
      padding: "10px",
      transform: realityGlitch ? `rotate(${Math.sin(Date.now() * 0.01)}deg) scale(${1 + Math.sin(Date.now() * 0.02) * 0.01})` : 'none',
      filter: quantumState === 'superposition' ? `hue-rotate(${Math.sin(Date.now() * 0.01) * 30}deg)` : 'none'
    }}>
      
      {/* Falling particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <FallingParticle
            key={particle.id}
            type={particle.type}
            delay={particle.delay}
            onComplete={() => setParticles(prev => prev.filter(p => p.id !== particle.id))}
          />
        ))}
      </AnimatePresence>
      
      {/* Receipt Header */}
      <div style={{
        textAlign: 'center',
        borderBottom: '2px dashed rgba(255,255,255,0.3)',
        paddingBottom: '10px',
        marginBottom: '15px',
        fontSize: '12px',
        letterSpacing: '1px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>═══ THE BUTTON ═══</div>
        <div>INFINITE RECEIPT SYSTEM</div>
        <div>TRANSACTION ID: #{count.toString().padStart(8, '0')}</div>
        <div>DIMENSION: {dimensionalShift}</div>
        <div>STATE: {quantumState.toUpperCase()}</div>
        <div>{new Date().toLocaleString()}</div>
      </div>

      {/* Main Button */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <motion.button
          onClick={press}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            scale: isPressed ? 1.05 : 1,
            boxShadow: isPressed ? `0 0 30px hsl(${environmentHue}, 80%, 60%)` : `0 0 10px hsl(${environmentHue}, 50%, 40%)`
          }}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: weirdness > 0.3 ? `${40 + Math.sin(Date.now() * 0.01) * 10}%` : '50%',
            border: `2px solid hsl(${environmentHue}, 70%, 60%)`,
            background: `radial-gradient(circle at 40% 40%, 
              hsl(${environmentHue}, 80%, 50%) 0%,
              hsl(${environmentHue + 60}, 70%, 40%) 50%,
              hsl(${environmentHue + 120}, 60%, 30%) 100%)`,
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textShadow: '0 0 5px rgba(0,0,0,0.5)',
            transition: 'all 0.1s ease',
            transform: quantumState === 'superposition' ? `rotate(${Math.sin(Date.now() * 0.01) * 5}deg)` : 'none'
          }}
        >
          <div style={{ fontSize: '10px', opacity: 0.8 }}>PRESS</div>
          <div style={{ fontSize: '18px' }}>{formatNumber(count)}</div>
          {streak > 5 && <div style={{ fontSize: '8px' }}>×{formatNumber(streak)}</div>}
        </motion.button>
      </div>

      {/* Currency Receipt Section */}
      <div style={{
        border: '1px dashed rgba(255,255,255,0.3)',
        padding: '10px',
        marginBottom: '15px',
        fontSize: '11px',
        fontFamily: 'Courier New, monospace'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '12px' }}>
          ─── INVENTORY ───
        </div>
        {Object.entries(currencies)
          .filter(([_, amount]) => amount > 0)
          .slice(0, 8)
          .map(([currency, amount]) => (
            <div key={currency} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '2px 0',
              borderBottom: '1px dotted rgba(255,255,255,0.1)'
            }}>
              <span>{CURRENCIES[currency]}</span>
              <span>{formatNumber(amount)}</span>
            </div>
          ))}
      </div>

      {/* Upgrades Receipt Section */}
      {availableUpgrades.length > 0 && (
        <div style={{
          border: '1px dashed rgba(255,255,255,0.3)',
          padding: '10px',
          marginBottom: '15px',
          fontSize: '11px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '12px' }}>
            ─── SHOP ───
          </div>
          {availableUpgrades.map(upgrade => {
            const cost = Math.floor(upgrade.baseCost * Math.pow(1.2, Object.keys(upgrades).length));
            const canAfford = currencies.clicks >= cost;
            
            return (
              <motion.div
                key={upgrade.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => buyUpgrade(upgrade.id)}
                style={{
                  padding: '8px',
                  margin: '4px 0',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: canAfford ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  opacity: canAfford ? 1 : 0.5
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{upgrade.name}</div>
                <div style={{ fontSize: '10px', marginBottom: '4px' }}>{upgrade.desc}</div>
                <div style={{ textAlign: 'right' }}>
                  COST: {formatNumber(cost)} CLICKS
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Activity Feed */}
      <div style={{
        border: '1px dashed rgba(255,255,255,0.3)',
        padding: '10px',
        marginBottom: '15px',
        fontSize: '10px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '12px' }}>
          ─── ACTIVITY LOG ───
        </div>
        <AnimatePresence>
          {feed.slice(0, 10).map((item, idx) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.02 }}
              style={{
                padding: '3px 0',
                borderBottom: '1px dotted rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: 1 - (idx * 0.08)
              }}
            >
              <span style={{
                color: (() => {
                  switch (item.type) {
                    case 'upgrade': return '#90EE90';
                    case 'mystery': return '#DA70D6';
                    case 'reward': return '#FFD700';
                    case 'secret': return '#FF69B4';
                    case 'quantum': return '#00CED1';
                    case 'transcendent': return '#FF6347';
                    default: return '#e0e0e0';
                  }
                })()
              }}>
                {item.type === 'upgrade' && '⚡ '}
                {item.type === 'mystery' && '👁 '}
                {item.type === 'reward' && '💰 '}
                {item.type === 'secret' && '🔮 '}
                {item.type === 'quantum' && '⚛️ '}
                {item.type === 'transcendent' && '✨ '}
                {item.msg}
              </span>
              <span style={{ fontSize: '8px', opacity: 0.6 }}>
                {item.timestamp}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Story Chronicle */}
      <div style={{
        border: '1px dashed rgba(255,255,255,0.3)',
        padding: '10px',
        marginBottom: '15px',
        fontSize: '11px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '12px' }}>
          ─── CHRONICLE ───
        </div>
        {Array.from({ length: Math.min(5, Math.floor(count / 100) + 1) }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.2 }}
            style={{
              marginBottom: '6px',
              padding: '4px',
              background: 'rgba(255,255,255,0.03)',
              borderLeft: `2px solid hsl(${environmentHue + i * 30}, 60%, 50%)`,
              paddingLeft: '8px',
              lineHeight: 1.4
            }}
          >
            {generateStoryLine(i, weirdness)}
          </motion.div>
        ))}
      </div>

      {/* Statistics */}
      <div style={{
        border: '1px dashed rgba(255,255,255,0.3)',
        padding: '10px',
        fontSize: '10px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '12px' }}>
          ─── STATISTICS ───
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div style={{ opacity: 0.7 }}>WEIRDNESS:</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
              {Math.round(weirdness * 100)}%
            </div>
          </div>
          <div>
            <div style={{ opacity: 0.7 }}>COMPLEXITY:</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
              {formatNumber(complexity)}
            </div>
          </div>
          <div>
            <div style={{ opacity: 0.7 }}>DIMENSIONS:</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
              {dimensionalShift}
            </div>
          </div>
          <div>
            <div style={{ opacity: 0.7 }}>SECRETS:</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
              {secretsFound.length}
            </div>
          </div>
          <div>
            <div style={{ opacity: 0.7 }}>UPGRADES:</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
              {Object.keys(upgrades).length}
            </div>
          </div>
          <div>
            <div style={{ opacity: 0.7 }}>STREAK:</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: streak > 100 ? '#FFD700' : 'inherit' }}>
              {formatNumber(streak)}
            </div>
          </div>
        </div>
      </div>

      {/* Reality Status Footer */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        right: '10px',
        textAlign: 'center',
        fontSize: '8px',
        opacity: 0.6,
        borderTop: '1px dashed rgba(255,255,255,0.2)',
        paddingTop: '5px',
        background: `linear-gradient(180deg, transparent 0%, hsl(${environmentHue}, ${environmentSat}%, ${environmentLight - 2}%) 100%)`
      }}>
        <div>REALITY STATUS: {realityGlitch ? 'CORRUPTED' : 'STABLE'}</div>
        <div>QUANTUM STATE: {quantumState.toUpperCase()}</div>
        <div style={{ marginTop: '2px' }}>
          {weirdness < 0.1 && 'THE JOURNEY BEGINS...'}
          {weirdness >= 0.1 && weirdness < 0.3 && 'REALITY SHIFTS SLIGHTLY...'}
          {weirdness >= 0.3 && weirdness < 0.5 && 'THE BOUNDARIES BLUR...'}
          {weirdness >= 0.5 && weirdness < 0.7 && 'DIMENSIONS INTERSECT...'}
          {weirdness >= 0.7 && weirdness < 0.9 && 'INFINITY APPROACHES...'}
          {weirdness >= 0.9 && 'TRANSCENDENCE IMMINENT...'}
        </div>
        {count > 50 && (
          <div style={{ fontSize: '7px', marginTop: '2px' }}>
            🔹 SPACEBAR: Quick Boost {count >= 333 && '🔹 CTRL+SHIFT+B: Hidden Menu'}
          </div>
        )}
      </div>

      {/* Hidden effects and Easter eggs */}
      {weirdness > 0.8 && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '200px',
          opacity: 0.02,
          pointerEvents: 'none',
          zIndex: -1,
          animation: `spin ${10 + Math.sin(Date.now() * 0.001) * 5}s linear infinite`
        }}>
          ∞
        </div>
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        /* Scrollbar styling for webkit browsers */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );
}