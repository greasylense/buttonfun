import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  THEBUTTON – Expanded surreal clicker experience
  - Multiple progression systems and currencies
  - Dynamic environment that evolves with progress
  - Hidden dimensions and secret areas
  - Procedural events and emergent narrative
  - Deep interaction systems and mysteries
*/

// Utility helpers
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const lerp = (a, b, t) => a + (b - a) * t;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.random() * (max - min) + min;

// Game state and currencies
const CURRENCIES = {
  clicks: 'Clicks',
  echoes: 'Echoes',
  whispers: 'Whispers',
  fragments: 'Fragments',
  void: 'Void Energy',
  dreams: 'Dream Threads'
};

// Expanded milestones with multiple reward types
const MILESTONES = [
  { at: 1, msg: "Hello.", type: "whisper", rewards: {} },
  { at: 5, msg: "Keep going.", type: "whisper", rewards: { echoes: 1 } },
  { at: 15, msg: "The button notices you.", type: "line", rewards: {} },
  { at: 25, msg: "Shimmer +1%", type: "reward", rewards: { echoes: 2 } },
  { at: 40, msg: "You feel watched.", type: "line", rewards: {} },
  { at: 65, msg: "Something clicks back.", type: "line", rewards: { whispers: 1 } },
  { at: 100, msg: "Flow mode unlocked.", type: "reward", rewards: { echoes: 5 } },
  { at: 150, msg: "The air thickens.", type: "glitch", rewards: {} },
  { at: 200, msg: "You hear whispers.", type: "story", rewards: { whispers: 3 } },
  { at: 250, msg: "Button variants discovered.", type: "unlock", rewards: {} },
  { at: 333, msg: "Spacebar boost unlocked.", type: "egg", rewards: { fragments: 1 } },
  { at: 420, msg: "Nice.", type: "line", rewards: { echoes: 4, whispers: 2 } },
  { at: 500, msg: "A door creaks open.", type: "story", rewards: { fragments: 2 } },
  { at: 666, msg: "The button watches back.", type: "glitch", rewards: { void: 1 } },
  { at: 777, msg: "Lucky pulse unlocked.", type: "reward", rewards: { fragments: 3 } },
  { at: 888, msg: "The Multiplier awakens.", type: "unlock", rewards: {} },
  { at: 1000, msg: "Share link unlocked.", type: "reward", rewards: { dreams: 1 } },
  { at: 1111, msg: "Perfect alignment achieved.", type: "egg", rewards: { void: 2 } },
  { at: 1337, msg: "Elite status confirmed.", type: "egg", rewards: { fragments: 5 } },
  { at: 1500, msg: "You crossed a thin place.", type: "story", rewards: { dreams: 2 } },
  { at: 1984, msg: "Big Brother clicks.", type: "egg", rewards: { void: 3 } },
  { at: 2000, msg: "The final door opens.", type: "story", rewards: { dreams: 3 } },
  { at: 2222, msg: "Double vision activated.", type: "unlock", rewards: {} },
  { at: 2500, msg: "Ending approaches...", type: "ending", rewards: { void: 5 } },
  { at: 3000, msg: "Beyond the veil.", type: "transcend", rewards: { dreams: 10 } },
  { at: 3333, msg: "Trinity unlocked.", type: "secret", rewards: { void: 10 } },
  { at: 4444, msg: "Quadruple helix discovered.", type: "secret", rewards: { fragments: 20 } },
  { at: 5000, msg: "The Button becomes you.", type: "ending", rewards: { dreams: 50 } },
];

// Expanded story with branches
const STORY_MAIN = [
  "You found a button in an empty room.",
  "No labels. No promise. Only a soft pulse.",
  "Pressing felt like tapping on glass from the wrong side.",
  "A reply came late, as if traveling underwater.",
  "Each click trained a listening on both ends.",
  "At some count, the room learned your name.",
  "You kept going anyway.",
  "The walls began to breathe with your rhythm.",
  "Echoes of other clickers drifted through the void.",
  "The button spoke in frequencies only you could hear.",
  "Reality bent around the simple act of pressing.",
  "You realized you were not the first to find this place.",
  "The door was never locked. It was shy.",
  "Your fingers left impressions in digital space.",
  "The button counted back, matching your devotion.",
  "Time folded. Past clicks echoed in the present.",
  "You discovered the button was clicking you too.",
  "The room expanded beyond its physical limits.",
  "Other dimensions leaked through the cracks.",
  "You are here. That was the point all along."
];

const WHISPER_TEXTS = [
  "keep... clicking...",
  "we see you",
  "the count matters",
  "don't stop now",
  "perfect",
  "yesss",
  "more...",
  "beautiful",
  "the button dreams of you",
  "click faster",
  "slower...",
  "rhythm is key",
  "you understand",
  "the pattern emerges",
  "almost there...",
];

const RANDOM_EVENTS = [
  { name: "Ghost Click", desc: "A phantom press adds mysterious counts", effect: "bonus_clicks", rarity: 0.02 },
  { name: "Echo Chamber", desc: "Your clicks reverberate through time", effect: "echo_mode", rarity: 0.01 },
  { name: "Whisper Storm", desc: "Voices multiply in the static", effect: "whisper_rain", rarity: 0.015 },
  { name: "Fragment Rain", desc: "Reality sheds pieces", effect: "fragment_shower", rarity: 0.008 },
  { name: "Void Pulse", desc: "The darkness pulses back", effect: "void_wave", rarity: 0.005 },
  { name: "Dream Leak", desc: "Someone else's dreams bleed through", effect: "dream_vision", rarity: 0.003 }
];

// Button variants unlocked at different stages
const BUTTON_VARIANTS = [
  { name: "Classic", unlockAt: 0, style: "default" },
  { name: "Glitch", unlockAt: 250, style: "glitch" },
  { name: "Void", unlockAt: 666, style: "void" },
  { name: "Dream", unlockAt: 1000, style: "dream" },
  { name: "Fragment", unlockAt: 1500, style: "fragment" },
  { name: "Transcendent", unlockAt: 3000, style: "transcendent" }
];

// Upgrades system
const UPGRADES = [
  { id: "flow", name: "Flow State", cost: { echoes: 10 }, desc: "Streak bonuses increase faster", unlockAt: 100 },
  { id: "whisper_magnet", name: "Whisper Magnet", cost: { whispers: 5 }, desc: "Attract more whispers", unlockAt: 200 },
  { id: "fragment_lens", name: "Fragment Lens", cost: { fragments: 3 }, desc: "See hidden patterns", unlockAt: 500 },
  { id: "void_touch", name: "Void Touch", cost: { void: 2 }, desc: "Each click touches the void", unlockAt: 666 },
  { id: "dream_weaver", name: "Dream Weaver", cost: { dreams: 1 }, desc: "Weave reality with clicks", unlockAt: 1000 },
  { id: "multiplier", name: "The Multiplier", cost: { echoes: 50, whispers: 10 }, desc: "Double all gains", unlockAt: 888 },
  { id: "phantom_clicks", name: "Phantom Clicks", cost: { void: 5, fragments: 10 }, desc: "Buttons click themselves", unlockAt: 1500 },
  { id: "time_dilation", name: "Time Dilation", cost: { dreams: 5, void: 10 }, desc: "Stretch moments of clicking", unlockAt: 2000 }
];

// Environmental effects
const ENVIRONMENTS = [
  { name: "Empty Room", range: [0, 99], bgHue: 210, effects: [] },
  { name: "Awakening Space", range: [100, 299], bgHue: 220, effects: ["subtle_pulse"] },
  { name: "The Watching", range: [300, 599], bgHue: 240, effects: ["eyes", "whispers"] },
  { name: "Glitch Realm", range: [600, 999], bgHue: 280, effects: ["static", "distortion"] },
  { name: "Dream Layer", range: [1000, 1999], bgHue: 320, effects: ["floating_fragments", "dream_particles"] },
  { name: "Void Touched", range: [2000, 2999], bgHue: 0, effects: ["void_tendrils", "reality_tears"] },
  { name: "Beyond", range: [3000, 9999], bgHue: 360, effects: ["transcendent_glow", "infinite_depth"] }
];

// Sound system with multiple layers
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
        masterGainRef.current.gain.value = 0.3;
      }
      enabledRef.current = true;
    };
    window.addEventListener("pointerdown", enableAudio, { once: true });
    window.addEventListener("keydown", enableAudio, { once: true });
  }, []);

  const playTone = useCallback((freq = 440, dur = 0.04, waveType = "sine", vol = 0.2) => {
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

  const playChord = useCallback((freqs, dur = 0.2, vol = 0.1) => {
    freqs.forEach((freq, i) => {
      setTimeout(() => playTone(freq, dur, "sine", vol), i * 10);
    });
  }, [playTone]);

  return { playTone, playChord };
}

export default function App() {
  // Core state
  const [currencies, setCurrencies] = useState(() => {
    const saved = localStorage.getItem("btn-currencies");
    return saved ? JSON.parse(saved) : {
      clicks: 0,
      echoes: 0,
      whispers: 0,
      fragments: 0,
      void: 0,
      dreams: 0
    };
  });

  const [upgrades, setUpgrades] = useState(() => {
    const saved = localStorage.getItem("btn-upgrades");
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedVariant, setSelectedVariant] = useState(0);
  const [flow, setFlow] = useState(false);
  const [feed, setFeed] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [secretsFound, setSecretsFound] = useState(() => {
    const saved = localStorage.getItem("btn-secrets");
    return saved ? JSON.parse(saved) : [];
  });

  // Interactive state
  const [streak, setStreak] = useState(0);
  const [clickPattern, setClickPattern] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [whisperMode, setWhisperMode] = useState(false);

  // Audio
  const { playTone, playChord } = useAdvancedAudio();
  const lastClick = useRef(0);

  // Calculate current environment and weirdness
  const count = currencies.clicks;
  const weird = useMemo(() => clamp(count / 5000, 0, 1), [count]);
  const environment = ENVIRONMENTS.find(env => count >= env.range[0] && count <= env.range[1]) || ENVIRONMENTS[0];
  
  const haze = Math.round(lerp(8, 60, weird));
  const hue = lerp(environment.bgHue, environment.bgHue + 40, weird);
  const storyIndex = useMemo(() => Math.min(STORY_MAIN.length, Math.floor((count / 5000) * STORY_MAIN.length)), [count]);

  // Available upgrades and variants
  const availableUpgrades = UPGRADES.filter(up => count >= up.unlockAt && !upgrades[up.id]);
  const availableVariants = BUTTON_VARIANTS.filter(v => count >= v.unlockAt);
  const currentVariant = availableVariants[selectedVariant] || BUTTON_VARIANTS[0];

  // Save progress
  useEffect(() => {
    localStorage.setItem("btn-currencies", JSON.stringify(currencies));
  }, [currencies]);

  useEffect(() => {
    localStorage.setItem("btn-upgrades", JSON.stringify(upgrades));
  }, [upgrades]);

  useEffect(() => {
    localStorage.setItem("btn-secrets", JSON.stringify(secretsFound));
  }, [secretsFound]);

  // Milestone system
  useEffect(() => {
    const m = MILESTONES.find(m => m.at === count);
    if (m) {
      setFeed(f => [{ 
        key: m.msg + Date.now(), 
        msg: m.msg, 
        type: m.type 
      }, ...f].slice(0, 8));
      
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
      
      if (m.at === 100) setFlow(true);
    }
  }, [count]);

  // Random events system
  useEffect(() => {
    if (count < 50) return;
    
    const eventInterval = setInterval(() => {
      RANDOM_EVENTS.forEach(event => {
        if (Math.random() < event.rarity) {
          setActiveEvents(events => [...events, { 
            ...event, 
            id: Date.now(), 
            startTime: Date.now() 
          }]);
          
          setFeed(f => [{ 
            key: "event" + Date.now(), 
            msg: `${event.name}: ${event.desc}`, 
            type: "event" 
          }, ...f].slice(0, 8));
        }
      });
    }, 5000);

    return () => clearInterval(eventInterval);
  }, [count]);

  // Whisper mode
  useEffect(() => {
    if (whisperMode) {
      const whisperInterval = setInterval(() => {
        setFeed(f => [{ 
          key: "whisper" + Date.now(), 
          msg: randomChoice(WHISPER_TEXTS), 
          type: "whisper" 
        }, ...f].slice(0, 8));
      }, randomBetween(2000, 8000));

      const timeout = setTimeout(() => setWhisperMode(false), 30000);
      return () => {
        clearInterval(whisperInterval);
        clearTimeout(timeout);
      };
    }
  }, [whisperMode]);

  // Secret detection system
  useEffect(() => {
    // Konami code detection could go here
    const handleSequence = (e) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyB') {
        if (!secretsFound.includes('developer')) {
          setSecretsFound(s => [...s, 'developer']);
          setFeed(f => [{ key: 'dev', msg: 'Developer mode activated', type: 'secret' }, ...f]);
          setCurrencies(c => ({ ...c, void: c.void + 10, dreams: c.dreams + 5 }));
        }
      }
    };
    
    window.addEventListener('keydown', handleSequence);
    return () => window.removeEventListener('keydown', handleSequence);
  }, [secretsFound]);

  // Enhanced keyboard controls
  useEffect(() => {
    const onKey = e => {
      if (e.code === "Space" && count >= 333) {
        e.preventDefault();
        const bonus = upgrades.void_touch ? 5 : 3;
        setCurrencies(c => ({ ...c, clicks: c.clicks + bonus }));
        setFeed(f => [{ key: "boost" + Date.now(), msg: `Space boost +${bonus}`, type: "boost" }, ...f].slice(0, 8));
        playTone(randomBetween(400, 800), 0.1, "square");
      }
      
      if (e.code === 'KeyW' && e.ctrlKey && count >= 200) {
        setWhisperMode(true);
      }
    };
    
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, upgrades, playTone]);

  // Main click handler
  const press = useCallback(() => {
    const now = performance.now();
    if (now - lastClick.current < 15) return; // Anti-macro with shorter delay
    
    lastClick.current = now;
    setLastClickTime(now);
    
    // Update click pattern for secret detection
    setClickPattern(p => [...p.slice(-9), now]);
    
    // Streak system
    setStreak(s => {
      const newStreak = clamp(s + 1, 0, upgrades.flow ? 100 : 50);
      return newStreak;
    });
    
    // Base click reward
    let clickReward = 1;
    
    // Streak bonus
    if (flow && streak > 10) {
      clickReward += Math.floor(streak / 20);
    }
    
    // Upgrade bonuses
    if (upgrades.multiplier) clickReward *= 2;
    if (upgrades.void_touch) clickReward += 1;
    if (upgrades.dream_weaver && Math.random() < 0.1) clickReward += 5;
    
    // Apply rewards
    setCurrencies(c => {
      const newCurr = { ...c, clicks: c.clicks + clickReward };
      
      // Secondary currency generation
      if (Math.random() < 0.1) newCurr.echoes++;
      if (Math.random() < 0.05 && upgrades.whisper_magnet) newCurr.whispers++;
      if (Math.random() < 0.02) newCurr.fragments++;
      if (Math.random() < 0.01 && upgrades.void_touch) newCurr.void++;
      if (Math.random() < 0.005 && upgrades.dream_weaver) newCurr.dreams++;
      
      return newCurr;
    });
    
    // Audio feedback
    const baseFreq = lerp(320, 880, Math.random() * Math.pow(weird, 0.8));
    const waveType = currentVariant.style === 'glitch' ? 'square' : 
                     currentVariant.style === 'void' ? 'sawtooth' : 'sine';
    
    playTone(baseFreq, 0.04, waveType);
    
    // Special audio for milestones
    if (MILESTONES.some(m => m.at === count + clickReward)) {
      setTimeout(() => playChord([261.63, 329.63, 392.00]), 200);
    }
    
  }, [streak, flow, upgrades, weird, currentVariant, playTone, playChord, count]);

  // Upgrade purchase
  const buyUpgrade = (upgradeId) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => 
      currencies[currency] >= cost
    );
    
    if (canAfford) {
      setCurrencies(c => {
        const newCurr = { ...c };
        Object.entries(upgrade.cost).forEach(([currency, cost]) => {
          newCurr[currency] -= cost;
        });
        return newCurr;
      });
      
      setUpgrades(u => ({ ...u, [upgradeId]: true }));
      
      setFeed(f => [{ 
        key: "upgrade" + Date.now(), 
        msg: `${upgrade.name} acquired!`, 
        type: "upgrade" 
      }, ...f].slice(0, 8));
      
      playChord([440, 554.37, 659.25]);
    }
  };

  // Button style based on variant
  const getButtonStyle = () => {
    const base = {
      width: 200,
      height: 200,
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      color: "white",
      fontSize: 24,
      userSelect: "none",
      cursor: "pointer",
      transition: "all 0.3s ease"
    };
    
    const scale = 1 + Math.min(0.2, streak * 0.004);
    const pulseIntensity = isHovering ? 1.2 : 1;
    
    switch (currentVariant.style) {
      case 'glitch':
        return {
          ...base,
          border: `3px solid hsla(${hue + Math.sin(Date.now() * 0.01) * 60},90%,70%,0.8)`,
          background: `radial-gradient(circle at ${50 + Math.sin(Date.now() * 0.005) * 20}% 45%, hsla(${hue},90%,60%,0.9), hsla(${hue + 120},70%,40%,0.6))`,
          boxShadow: `0 10px 40px hsla(${hue},80%,60%,0.4), inset 0 0 ${haze * pulseIntensity}px hsla(${hue + 80}, 80%, 70%, 0.3)`,
          transform: `scale(${scale}) ${Math.random() < 0.1 ? 'skew(1deg)' : ''}`
        };
      
      case 'void':
        return {
          ...base,
          border: `2px solid hsla(270,90%,50%,0.9)`,
          background: `radial-gradient(circle at 50% 45%, hsla(270,90%,20%,0.9), hsla(0,0%,0%,0.9))`,
          boxShadow: `0 20px 60px hsla(270,80%,50%,0.6), inset 0 0 ${haze * 2}px hsla(270, 80%, 70%, 0.4)`,
          transform: `scale(${scale})`
        };
      
      case 'dream':
        return {
          ...base,
          border: `2px solid hsla(${hue + Math.sin(Date.now() * 0.003) * 180},70%,80%,0.8)`,
          background: `conic-gradient(from ${Date.now() * 0.1}deg, hsla(${hue},60%,70%,0.8), hsla(${hue + 60},60%,70%,0.8), hsla(${hue + 120},60%,70%,0.8), hsla(${hue},60%,70%,0.8))`,
          boxShadow: `0 15px 50px hsla(${hue},70%,70%,0.5), inset 0 0 ${haze * 1.5}px hsla(${hue + 180}, 70%, 80%, 0.3)`,
          transform: `scale(${scale}) rotate(${Math.sin(Date.now() * 0.002) * 2}deg)`
        };
      
      case 'fragment':
        return {
          ...base,
          border: `2px solid hsla(${hue},90%,70%,0.8)`,
          background: `linear-gradient(${Date.now() * 0.1}deg, hsla(${hue},90%,60%,0.9), hsla(${hue + 60},70%,40%,0.6), hsla(${hue + 120},90%,60%,0.9))`,
          boxShadow: `0 10px 40px hsla(${hue},80%,60%,0.35), inset 0 0 ${haze}px hsla(${hue + 80}, 80%, 70%, 0.2)`,
          transform: `scale(${scale})`,
          clipPath: Math.random() < 0.05 ? 'polygon(20% 0%, 100% 20%, 80% 100%, 0% 80%)' : 'none'
        };
      
      case 'transcendent':
        return {
          ...base,
          border: `3px solid hsla(${hue + Math.sin(Date.now() * 0.01) * 360},100%,90%,1)`,
          background: `radial-gradient(ellipse at center, 
            hsla(${hue},100%,80%,0.9) 0%, 
            hsla(${hue + 120},100%,70%,0.8) 30%, 
            hsla(${hue + 240},100%,60%,0.7) 60%, 
            hsla(${hue + 360},100%,50%,0.6) 100%)`,
          boxShadow: `0 25px 80px hsla(${hue},100%,80%,0.8), 
                      inset 0 0 ${haze * 3}px hsla(${hue + 180}, 100%, 90%, 0.5),
                      0 0 100px hsla(${hue + 60}, 100%, 70%, 0.3)`,
          transform: `scale(${scale}) rotate(${Math.sin(Date.now() * 0.001) * 5}deg)`,
          filter: `hue-rotate(${Math.sin(Date.now() * 0.002) * 30}deg) brightness(${1 + Math.sin(Date.now() * 0.003) * 0.2})`
        };
      
      default:
        return {
          ...base,
          border: `2px solid hsla(${hue},90%,70%,0.8)`,
          background: `radial-gradient(circle at 50% 45%, hsla(${hue},90%,60%,0.9), hsla(${hue},70%,40%,0.6))`,
          boxShadow: `0 10px 40px hsla(${hue},80%,60%,0.35), inset 0 0 ${haze}px hsla(${hue + 80}, 80%, 70%, 0.2)`,
          transform: `scale(${scale})`
        };
    }
  };

  return (
    <div style={{
      fontFamily: "Inter, sans-serif",
      color: "white",
      background: `linear-gradient(135deg, hsl(${hue}, 50%, 8%), hsl(${hue + 30}, 40%, 12%))`,
      minHeight: "100vh",
      padding: 20,
      position: "relative",
      overflow: "hidden"
    }}>
      
      {/* Environmental effects */}
      {environment.effects.includes('floating_fragments') && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background: `radial-gradient(circle at ${Math.sin(Date.now() * 0.001) * 50 + 50}% ${Math.cos(Date.now() * 0.0015) * 50 + 50}%, hsla(${hue}, 70%, 60%, 0.1) 0%, transparent 50%)`
        }} />
      )}
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', textShadow: `0 0 20px hsla(${hue}, 80%, 70%, 0.5)` }}>
          thebutton
        </h1>
        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          {environment.name}
        </div>
      </div>

      {/* Currency display */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 10,
        marginBottom: 20
      }}>
        {Object.entries(currencies).map(([currency, amount]) => (
          <div key={currency} style={{
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.15)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              {CURRENCIES[currency]}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Button variants selector */}
      {availableVariants.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.9rem', marginBottom: 8, opacity: 0.8 }}>
            Button Style:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {availableVariants.map((variant, idx) => (
              <button
                key={variant.name}
                onClick={() => setSelectedVariant(idx)}
                style={{
                  padding: '6px 12px',
                  background: selectedVariant === idx ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border: selectedVariant === idx ? `1px solid hsla(${hue},70%,70%,0.8)` : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: 'white',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main button */}
      <div style={{ display: "grid", placeItems: "center", margin: "2rem 0" }}>
        <motion.button
          onClick={press}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          whileTap={{ scale: 0.96 }}
          animate={{ 
            scale: 1 + Math.min(0.15, streak * 0.005),
            rotate: currentVariant.style === 'transcendent' ? [0, 1, -1, 0] : 0
          }}
          transition={{ type: "spring", stiffness: 180, damping: 12 }}
          style={getButtonStyle()}
        >
          <div style={{ fontSize: 14, opacity: 0.8 }}>
            {currentVariant.name.toLowerCase()}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {count.toLocaleString()}
          </div>
          {streak > 10 && (
            <div style={{ fontSize: 10, opacity: 0.6 }}>
              x{streak}
            </div>
          )}
        </motion.button>
      </div>

      {/* Active events */}
      {activeEvents.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <AnimatePresence>
            {activeEvents.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  padding: '10px 15px',
                  margin: '5px 0',
                  background: `hsla(${hue + 60}, 80%, 20%, 0.8)`,
                  border: `2px solid hsla(${hue + 60}, 80%, 60%, 0.6)`,
                  borderRadius: 10,
                  fontSize: '0.9rem',
                  boxShadow: `0 5px 20px hsla(${hue + 60}, 80%, 60%, 0.3)`
                }}
              >
                🌟 {event.name}: {event.desc}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upgrades */}
      {availableUpgrades.length > 0 && (
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 15, opacity: 0.9 }}>
            Available Upgrades
          </h3>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {availableUpgrades.slice(0, 4).map(upgrade => {
              const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => 
                currencies[currency] >= cost
              );
              
              return (
                <motion.button
                  key={upgrade.id}
                  onClick={() => buyUpgrade(upgrade.id)}
                  disabled={!canAfford}
                  whileHover={canAfford ? { scale: 1.02 } : {}}
                  whileTap={canAfford ? { scale: 0.98 } : {}}
                  style={{
                    padding: '12px',
                    background: canAfford ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                    border: canAfford ? `1px solid hsla(${hue}, 60%, 60%, 0.6)` : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: canAfford ? 'white' : 'rgba(255,255,255,0.4)',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {upgrade.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', marginBottom: 8, opacity: 0.8 }}>
                    {upgrade.desc}
                  </div>
                  <div style={{ fontSize: '0.8rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Object.entries(upgrade.cost).map(([currency, cost]) => (
                      <span key={currency} style={{
                        padding: '2px 6px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: 4,
                        color: currencies[currency] >= cost ? '#90EE90' : '#FFB6C1'
                      }}>
                        {cost} {CURRENCIES[currency]}
                      </span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feed */}
      <div style={{ marginBottom: 20 }}>
        <AnimatePresence>
          {feed.map((item, idx) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: -10, x: -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 10, x: 20 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                fontSize: item.type === 'whisper' ? 12 : 14,
                padding: item.type === 'whisper' ? '4px 8px' : '8px 12px',
                margin: '4px 0',
                borderRadius: item.type === 'whisper' ? 4 : 8,
                background: (() => {
                  switch (item.type) {
                    case 'whisper': return 'rgba(255,255,255,0.03)';
                    case 'reward': return `hsla(${hue + 60}, 70%, 20%, 0.6)`;
                    case 'glitch': return `hsla(${hue + 180}, 70%, 20%, 0.6)`;
                    case 'story': return `hsla(${hue + 120}, 70%, 20%, 0.6)`;
                    case 'event': return `hsla(${hue + 30}, 80%, 25%, 0.7)`;
                    case 'upgrade': return `hsla(${hue + 90}, 80%, 25%, 0.7)`;
                    case 'secret': return `hsla(${hue + 270}, 90%, 30%, 0.8)`;
                    default: return 'rgba(255,255,255,0.06)';
                  }
                })(),
                border: `1px solid ${(() => {
                  switch (item.type) {
                    case 'whisper': return 'rgba(255,255,255,0.05)';
                    case 'reward': return `hsla(${hue + 60}, 70%, 50%, 0.4)`;
                    case 'glitch': return `hsla(${hue + 180}, 70%, 50%, 0.4)`;
                    case 'story': return `hsla(${hue + 120}, 70%, 50%, 0.4)`;
                    case 'event': return `hsla(${hue + 30}, 80%, 60%, 0.5)`;
                    case 'upgrade': return `hsla(${hue + 90}, 80%, 60%, 0.5)`;
                    case 'secret': return `hsla(${hue + 270}, 90%, 70%, 0.6)`;
                    default: return 'rgba(255,255,255,0.1)';
                  }
                })()}`,
                fontStyle: item.type === 'whisper' ? 'italic' : 'normal',
                opacity: item.type === 'whisper' ? 0.7 : 1,
                textShadow: item.type === 'secret' ? `0 0 10px hsla(${hue + 270}, 90%, 70%, 0.8)` : 'none'
              }}
            >
              {item.type === 'secret' && '✨ '}
              {item.type === 'event' && '🌟 '}
              {item.type === 'upgrade' && '⚡ '}
              {item.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Story */}
      <div style={{ marginTop: 30, maxWidth: '600px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 15, opacity: 0.9 }}>
          Chronicle
        </h3>
        {STORY_MAIN.slice(0, storyIndex).map((line, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: i * 0.1 }}
            style={{
              marginBottom: 8,
              padding: '4px 0',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              opacity: 0.8 + (i / STORY_MAIN.length) * 0.2
            }}
          >
            {line}
          </motion.div>
        ))}
      </div>

      {/* Statistics */}
      {count > 100 && (
        <div style={{
          marginTop: 40,
          padding: '20px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 15, opacity: 0.9 }}>
            Statistics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 15 }}>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Current Streak</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{streak}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Weirdness Level</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{Math.round(weird * 100)}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Secrets Found</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{secretsFound.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Upgrades Owned</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{Object.keys(upgrades).length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        fontSize: '0.75rem',
        opacity: 0.5,
        maxWidth: 200
      }}>
        {count >= 333 && <div>Space: Boost clicks</div>}
        {count >= 200 && <div>Ctrl+W: Whisper mode</div>}
        <div>Ctrl+Shift+B: Secret</div>
      </div>
    </div>
  );
}