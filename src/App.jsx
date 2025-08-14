import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  THEBUTTON - Viral Progressive Chaos Experience
  - Calm at start, ramps to wild as clicks rise
  - Chaos influences drift, blur, skew, color shift, hidden sections, scrambled text
  - Rare events: fake 404 veil, screen tear, UI melt, quantum split
  - Particles, scanline grain, low opacity weird SVGs
  - Spacebar triggers press, Ctrl+Shift+B toggles dev panel
  - Console logs sprinkled throughout for debugging
*/

// helpers
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const rb = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// tiny audio
function useTinyAudio() {
  const ctxRef = useRef(null);
  const enabledRef = useRef(false);
  const gainRef = useRef(null);

  useEffect(() => {
    const enable = () => {
      if (!ctxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        ctxRef.current = new Ctx();
        gainRef.current = ctxRef.current.createGain();
        gainRef.current.gain.value = 0.18;
        gainRef.current.connect(ctxRef.current.destination);
      }
      enabledRef.current = true;
      console.log("[audio] enabled");
    };
    window.addEventListener("pointerdown", enable, { once: true });
    window.addEventListener("keydown", enable, { once: true });
  }, []);

  const blip = useCallback((f = 300, dur = 0.05, type = "sine") => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(gainRef.current);
    osc.start(t);
    osc.stop(t + dur + 0.01);
  }, []);

  return { blip };
}

// particles
const Falling = ({ type, delay = 0, onDone }) => {
  const startX = Math.random() * window.innerWidth;
  const size = rb(2, 8);
  const rot = rb(-180, 180);
  const style = (() => {
    if (type === "pix") return { width: size, height: size, background: `hsl(${Math.random() * 360}, 85%, 60%)` };
    if (type === "frag") return { width: size * 1.5, height: 1, background: "rgba(255,255,255,0.8)", transform: `rotate(${rot}deg)` };
    if (type === "tear") return { width: size, height: size * 2, borderRadius: "50%", background: "rgba(120,200,255,0.85)" };
    if (type === "glitch") return { width: size, height: size, background: `hsl(${Math.random() * 360}, 100%, 50%)`, filter: "blur(1px)" };
    return { width: size, height: size, borderRadius: "50%", background: "rgba(255,255,255,0.6)" };
  })();

  return (
    <motion.div
      initial={{ x: startX, y: -20, opacity: 0 }}
      animate={{ x: startX + rb(-120, 120), y: window.innerHeight + 30, opacity: [0, 1, 1, 0], rotate: rot * 2 }}
      transition={{ delay, duration: rb(3, 8), ease: "linear" }}
      onAnimationComplete={onDone}
      style={{ position: "fixed", zIndex: 1000, pointerEvents: "none", ...style }}
    />
  );
};

// low opacity weird overlays
const WeirdOverlay = ({ chaos }) => {
  const which = chaos < 0.25 ? "sigil" : chaos < 0.5 ? "eye" : chaos < 0.8 ? "spiral" : "glyphs";
  const size = 120 + chaos * 260;
  const opacity = 0.04 + chaos * 0.12;
  const drift = rb(10, 40) * (Math.random() < 0.5 ? -1 : 1);
  const rot = rb(-10, 10);
  const dur = 6 - Math.min(4, chaos * 4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity, y: [0, drift, 0], rotate: [rot, -rot, rot] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}
    >
      {which === "sigil" && (
        <svg width={size} height={size} viewBox="0 0 200 200" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.05))" }}>
          <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeOpacity="0.32" />
          <path d="M100 20 L120 180 L80 180 Z" fill="none" stroke="white" strokeOpacity="0.2" />
          <circle cx="100" cy="100" r="6" fill="white" fillOpacity="0.35" />
        </svg>
      )}
      {which === "eye" && (
        <svg width={size} height={size} viewBox="0 0 200 200">
          <ellipse cx="100" cy="100" rx="90" ry="55" fill="none" stroke="white" strokeOpacity="0.32" />
          <circle cx="100" cy="100" r="22" fill="white" fillOpacity="0.28" />
          <circle cx="100" cy="100" r="7" fill="black" fillOpacity="0.6" />
        </svg>
      )}
      {which === "spiral" && (
        <svg width={size} height={size} viewBox="0 0 200 200">
          <path d="M100,100 m-75,0 a75,75 0 1,0 150,0 a75,75 0 1,0 -150,0" fill="none" stroke="white" strokeOpacity="0.25" />
          <path d="M100,100 m-55,0 a55,55 0 1,0 110,0 a55,55 0 1,0 -110,0" fill="none" stroke="white" strokeOpacity="0.25" />
          <path d="M100,100 m-35,0 a35,35 0 1,0 70,0 a35,35 0 1,0 -70,0" fill="none" stroke="white" strokeOpacity="0.25" />
        </svg>
      )}
      {which === "glyphs" && (
        <div style={{ fontSize: 140, letterSpacing: 6, opacity }}>
          ⌘ ∴ ∷ ◌ ◍ ◐ ◑ ◒ ◓
        </div>
      )}
    </motion.div>
  );
};

export default function App() {
  // state
  const [clicks, setClicks] = useState(() => Number(localStorage.getItem("tb-clicks") || 0));
  const [streak, setStreak] = useState(0);
  const [feed, setFeed] = useState([]);
  const [particles, setParticles] = useState([]);
  const [glitch, setGlitch] = useState(false);
  const [qState, setQState] = useState("stable");
  const [devOpen, setDevOpen] = useState(false);
  const [scramble, setScramble] = useState(false);
  const [fake404, setFake404] = useState(false);
  const [screenTear, setScreenTear] = useState(false);

  const lastClickRef = useRef(0);
  const { blip } = useTinyAudio();

  // chaos curve - reaches 1 near 50k clicks
  const chaos = useMemo(() => clamp(clicks / 50000, 0, 1), [clicks]);

  // environment color
  const hue = (Date.now() * 0.01 + chaos * 240) % 360;
  const sat = 30 + chaos * 50;
  const light = Math.max(6, 16 - chaos * 10);

  useEffect(() => {
    localStorage.setItem("tb-clicks", String(clicks));
  }, [clicks]);

  // particles and random events
  useEffect(() => {
    const tick = setInterval(() => {
      if (Math.random() < 0.08 + chaos * 0.12) spawnParticles(pick(["pix", "frag", "tear", "glitch"]), Math.floor(rb(1, 4)));

      if (Math.random() < 0.035 + chaos * 0.06) {
        const m = pick([
          "The room inhales.",
          "Pixels shed like rain.",
          "Time hesitates.",
          "You are observed.",
          "A seam in the wall opens.",
          "Something reverses.",
          "You forget a second.",
          "A small bell rings nowhere.",
          "Shadows nod.",
        ]);
        pushFeed(m, "mystery");
      }

      // scramble text pulses
      if (Math.random() < 0.01 + chaos * 0.03) {
        setScramble(true);
        console.log("[event] scramble on");
        setTimeout(() => {
          setScramble(false);
          console.log("[event] scramble off");
        }, 1200 + chaos * 1200);
      }

      // fake 404 veil - rare
      if (!fake404 && Math.random() < 0.002 + chaos * 0.003) {
        setFake404(true);
        console.log("[event] fake 404 shown");
        setTimeout(() => {
          setFake404(false);
          console.log("[event] fake 404 hidden");
        }, 2500 + chaos * 2000);
      }

      // screen tear slice - rare
      if (!screenTear && Math.random() < 0.002 + chaos * 0.004) {
        setScreenTear(true);
        console.log("[event] screen tear");
        setTimeout(() => setScreenTear(false), 1200);
      }

      // periodic glitch
      if (Math.random() < 0.015 + chaos * 0.04) {
        setGlitch(true);
        pushFeed("Reality tears for a moment", "glitch");
        console.log("[event] glitch on");
        setTimeout(() => {
          setGlitch(false);
          console.log("[event] glitch off");
        }, 2200 + chaos * 2800);
      }
    }, Math.max(300, 1800 - chaos * 1400));
    return () => clearInterval(tick);
  }, [chaos, fake404, screenTear]);

  // keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        press();
      }
      if (e.ctrlKey && e.shiftKey && e.code === "KeyB") setDevOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  // logging chaos shifts
  useEffect(() => {
    console.log("[chaos]", { clicks, chaos: Number(chaos.toFixed(3)) });
  }, [clicks, chaos]);

  // utility
  const pushFeed = (msg, type) => {
    setFeed((f) => [{ id: Date.now(), msg, type, t: new Date().toLocaleTimeString() }, ...f].slice(0, 20));
  };

  const spawnParticles = (type, n = 3) => {
    console.log("[particles] spawn", { type, n });
    for (let i = 0; i < n; i++) {
      const id = Date.now() + i;
      setParticles((p) => [...p, { id, type, delay: i * 0.08 }]);
    }
  };

  const press = useCallback(() => {
    const now = performance.now();
    if (now - lastClickRef.current < 10) return;
    lastClickRef.current = now;

    // audio
    const freq = 220 + Math.floor(chaos * 480) + Math.floor(Math.random() * 60);
    blip(freq, 0.05, qState === "stable" ? "sine" : "square");

    // clicks and streak
    setClicks((c) => {
      const nc = c + 1;
      console.log("[press] click", { next: nc });
      return nc;
    });
    setStreak((s) => Math.min(999999, s + 1));

    // particle ping
    if (Math.random() < 0.1 + chaos * 0.2) spawnParticles(pick(["pix", "frag", "tear"]), 1);

    // large events
    if (clicks > 0 && clicks % 1000 === 0) {
      pushFeed("Something rotates above you", "dim");
      spawnParticles("glitch", 15);
    }
    if (clicks > 0 && clicks % 8000 === 0) {
      setQState("superposition");
      pushFeed("You exist in two places", "quantum");
      console.log("[quantum] superposition");
      setTimeout(() => {
        setQState("stable");
        console.log("[quantum] stable");
      }, 9000);
    }
  }, [chaos, qState, clicks, blip]);

  // story lines that grow with chaos
  const lines = useMemo(() => {
    const steps = Math.min(7, Math.floor(clicks / 120) + 1);
    const pool = [
      "You find a button in a room that remembers.",
      "The room blinks. You were not always here.",
      "Shadows move without owners.",
      "Light forgets where to land.",
      "The floor shifts. You feel heavier than usual.",
      "You are observed by something patient.",
      "A corner folds inward and keeps folding.",
      "Air changes shape when you are not looking.",
      "A quiet clicking answers your click.",
    ];
    const arr = Array.from({ length: steps }, () => pick(pool));
    if (chaos > 0.65) arr.push("Letters detach from words and exit the sentence.");
    if (chaos > 0.85) arr.push("Geometry asks for your name.");
    return arr.slice(0, 8);
  }, [clicks, chaos]);

  // random section hiding decisions
  const hideHeader = chaos > 0.75 && Math.random() < 0.02;
  const hideLog = chaos > 0.6 && Math.random() < 0.025;
  const hideStory = chaos > 0.5 && Math.random() < 0.02;

  // transforms
  const skew = chaos * 6;
  const rot = Math.sin(Date.now() * 0.002) * chaos * 2;
  const scale = 1 + Math.sin(Date.now() * 0.003) * chaos * 0.012;
  const blur = chaos * 1.3;
  const grain = 0.05 + chaos * 0.34;

  // scramble helper
  const maybeScramble = (text) => {
    if (!scramble) return text;
    return text
      .split("")
      .map((ch) => (Math.random() < 0.15 ? pick(["@", "#", "%", "&", "?", "∗", "∆"]) : ch))
      .join("");
  };

  return (
    <div
      style={{
        fontFamily: "Courier New, monospace",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        padding: 12,
        color: chaos > 0.55 ? `hsl(${hue + 180}, 80%, 90%)` : "#e6e6e6",
        background: `linear-gradient(180deg, hsl(${hue}, ${sat}%, ${light}%) 0%, hsl(${(hue + 36) % 360}, ${sat}%, ${Math.max(
          4,
          light - 6
        )}%) 100%)`,
        transform: glitch ? `rotate(${Math.sin(Date.now() * 0.01)}deg) scale(${1 + Math.sin(Date.now() * 0.02) * 0.012})` : "none",
        filter: qState === "superposition" ? `hue-rotate(${Math.sin(Date.now() * 0.01) * 30}deg)` : "none",
      }}
    >
      {/* global noise */}
      <div
        aria-hidden
        style={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,${grain}), rgba(255,255,255,0) 2px)`,
          mixBlendMode: "overlay",
          opacity: 0.07 + chaos * 0.22,
          filter: `blur(${blur}px)`,
          zIndex: 1,
        }}
      />

      {/* rare fake 404 veil */}
      <AnimatePresence>
        {fake404 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "#0b0c10",
              color: "#e8edf7",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: 20,
            }}
          >
            <div>
              <div style={{ fontSize: 48, marginBottom: 10 }}>404</div>
              <div style={{ fontSize: 16, opacity: 0.85 }}>
                The page you are looking for has drifted. Please try again later.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* screen tear slice */}
      <AnimatePresence>
        {screenTear && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "linear" }}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              height: 80,
              top: 0,
              zIndex: 5000,
              background:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.05) 6px, rgba(255,255,255,0.05) 12px)",
              mixBlendMode: "screen",
              filter: "blur(1px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* weird overlay */}
      <WeirdOverlay chaos={chaos} />

      {/* particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <Falling
            key={p.id}
            type={p.type}
            delay={p.delay}
            onDone={() => setParticles((arr) => arr.filter((x) => x.id !== p.id))}
          />
        ))}
      </AnimatePresence>

      {/* header */}
      {!hideHeader && (
        <motion.div
          style={{
            textAlign: "center",
            borderBottom: "2px dashed rgba(255,255,255,0.3)",
            paddingBottom: 10,
            marginBottom: 16,
            fontSize: 12,
            letterSpacing: 1,
            position: "relative",
            zIndex: 2,
          }}
          animate={{ x: [0, chaos * 4, 0, -chaos * 4, 0], rotate: [0, rot, 0], skewX: skew }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>═══ THE BUTTON ═══</div>
          <div>PROGRESSIVE CHAOS SYSTEM</div>
          <div>CLICKS: {clicks.toLocaleString()}</div>
          <div>STREAK: {streak.toLocaleString()}</div>
          <div>STATE: {qState.toUpperCase()}</div>
          <div>{new Date().toLocaleString()}</div>
        </motion.div>
      )}

      {/* main button */}
      <div style={{ display: "flex", justifyContent: "center", margin: "20px 0", position: "relative", zIndex: 3 }}>
        <motion.button
          onClick={press}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale,
            boxShadow: `0 0 ${glitch ? 40 : 16}px hsl(${hue}, 80%, 60%)`,
            x: chaos * rb(-12, 12),
            y: chaos * rb(-8, 8),
            rotate: rot * 1.3,
            filter: scramble ? "contrast(1.3) saturate(1.4)" : "none",
          }}
          transition={{ type: "spring", stiffness: 140, damping: 12 }}
          style={{
            width: 130,
            height: 130,
            borderRadius: chaos > 0.35 ? `${40 + Math.sin(Date.now() * 0.01) * 12}%` : "50%",
            border: `2px solid hsl(${hue}, 70%, 60%)`,
            background: `radial-gradient(circle at 40% 40%, hsl(${hue}, 80%, 50%) 0%, hsl(${(hue + 60) % 360}, 70%, 40%) 50%, hsl(${(hue + 120) % 360}, 60%, 30%) 100%)`,
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textShadow: "0 0 6px rgba(0,0,0,0.45)",
            userSelect: "none",
          }}
        >
          <div style={{ fontSize: 10, opacity: 0.85 }}>{maybeScramble("PRESS")}</div>
          <div style={{ fontSize: 18 }}>{clicks.toLocaleString()}</div>
          {streak > 5 && <div style={{ fontSize: 9 }}>x{streak.toLocaleString()}</div>}
        </motion.button>
      </div>

      {/* activity log */}
      {!hideLog && (
        <motion.div
          style={{
            border: "1px dashed rgba(255,255,255,0.3)",
            padding: 10,
            marginBottom: 14,
            fontSize: 10,
            maxHeight: 200,
            overflowY: "auto",
            position: "relative",
            zIndex: 2,
          }}
          animate={{ x: [0, -chaos * 2, 0, chaos * 2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={{ textAlign: "center", marginBottom: 8, fontSize: 12 }}>─── ACTIVITY LOG ───</div>
          {feed.length === 0 ? (
            <div style={{ textAlign: "center", opacity: 0.6, padding: 10 }}>{maybeScramble("Click the button to begin")}</div>
          ) : (
            feed.slice(0, 10).map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                style={{
                  padding: "4px 0",
                  borderBottom: "1px dotted rgba(255,255,255,0.12)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: 1 - idx * 0.08,
                  filter: idx > 5 ? `blur(${chaos * 0.7}px)` : "none",
                }}
              >
                <span>{maybeScramble(item.msg)}</span>
                <span style={{ fontSize: 8, opacity: 0.6 }}>{item.t}</span>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* chronicle */}
      {!hideStory && (
        <motion.div
          style={{
            border: "1px dashed rgba(255,255,255,0.3)",
            padding: 10,
            marginBottom: 14,
            fontSize: 11,
            position: "relative",
            zIndex: 2,
          }}
          animate={{ rotate: rot * 0.25, skewX: skew * 0.3 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={{ textAlign: "center", marginBottom: 8, fontSize: 12 }}>─── CHRONICLE ───</div>
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 }}
              style={{
                marginBottom: 6,
                padding: 6,
                background: "rgba(255,255,255,0.04)",
                borderLeft: `2px solid hsl(${(hue + i * 30) % 360}, 60%, 50%)`,
                paddingLeft: 8,
                lineHeight: 1.4,
                filter: i > 2 ? `hue-rotate(${chaos * 40}deg)` : "none",
              }}
            >
              {maybeScramble(line)}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* footer */}
      <div
        style={{
          position: "fixed",
          bottom: 10,
          left: 10,
          right: 10,
          zIndex: 6,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 860,
            background: `rgba(10,12,16,${0.74 + chaos * 0.1})`,
            border: "1px solid rgba(255,255,255,0.26)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
            borderRadius: 10,
            padding: "10px 14px",
            textAlign: "center",
            fontSize: 11,
            color: "#eaf0ff",
            backdropFilter: "blur(8px)",
          }}
        >
          <div>REALITY STATUS: {glitch ? "CORRUPTED" : "STABLE"}</div>
          <div>QUANTUM STATE: {qState.toUpperCase()}</div>
          <div style={{ marginTop: 4, fontSize: 10 }}>
            {chaos < 0.1 && "THE JOURNEY BEGINS"}
            {chaos >= 0.1 && chaos < 0.3 && "REALITY SHIFTS"}
            {chaos >= 0.3 && chaos < 0.5 && "BOUNDARIES BLUR"}
            {chaos >= 0.5 && chaos < 0.7 && "DIMENSIONS INTERSECT"}
            {chaos >= 0.7 && chaos < 0.9 && "INFINITY APPROACHES"}
            {chaos >= 0.9 && "TRANSCENDENCE IMMINENT"}
          </div>
          {clicks > 20 && <div style={{ fontSize: 10, marginTop: 4 }}>Spacebar: click - Ctrl+Shift+B: dev panel</div>}
        </div>
      </div>

      {/* dev panel */}
      <AnimatePresence>
        {devOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: "fixed",
              right: 12,
              top: 12,
              zIndex: 7,
              background: "rgba(20,20,26,0.92)",
              color: "#fff",
              padding: 12,
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 10,
              width: 260,
              fontSize: 12,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Dev</div>
            <button
              onClick={() => {
                setClicks(0);
                setStreak(0);
                setFeed([]);
                console.log("[dev] reset");
              }}
              style={{ display: "block", width: "100%", marginBottom: 6 }}
            >
              Reset
            </button>
            <button
              onClick={() => {
                setGlitch((v) => !v);
                console.log("[dev] toggle glitch");
              }}
              style={{ display: "block", width: "100%", marginBottom: 6 }}
            >
              Toggle glitch
            </button>
            <button
              onClick={() => {
                setQState((s) => (s === "stable" ? "superposition" : "stable"));
                console.log("[dev] toggle quantum");
              }}
              style={{ display: "block", width: "100%" }}
            >
              Toggle quantum
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* watermark */}
      {chaos > 0.82 && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 200,
            opacity: 0.02,
            pointerEvents: "none",
            zIndex: 0,
            animation: `spin ${10 + Math.sin(Date.now() * 0.001) * 5}s linear infinite`,
          }}
        >
          ∞
        </div>
      )}

      {/* styles */}
      <style>{`
        @keyframes spin { 
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
      `}</style>
    </div>
  );
}

