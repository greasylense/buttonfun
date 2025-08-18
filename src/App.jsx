import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./App.css";

/**
 * Minimal single-file build:
 * - Progressive story driven by click count
 * - Rare events with a seeded RNG
 * - Optional branches at milestones
 * - Reduced motion support
 * - LocalStorage persistence with versioning
 * - Hidden debug panel via long press on the title
 * - Clean, responsive layout that looks good in an iframe on Framer
 */

/* ----------------------------- Content Schema ----------------------------- */

const storySchema = {
  milestones: [
    { at: 1, title: "The room is quiet.", ui: { accent: "#6C8EF5" } },
    { at: 5, title: "Something listens back.", effects: ["gentlePulse"] },
    { at: 12, title: "A note appears under the button.", effects: ["noteReveal"] },
    { at: 25, title: "You hear the vent breathe.", effects: ["vignette"], sound: "air" },
    { at: 50, title: "The timestamp counts backward.", effects: ["timeSkew"] },
    { at: 75, title: "You are not the only one pressing.", effects: ["ghostTap"] },
    { at: 100, title: "A handle appears. Do you pull it or keep pressing?", branch: ["pull_handle", "keep_pressing"] },
  ],
  rareEvents: [
    { chance: 0.02, title: "The button presses itself once.", effects: ["autoTap"], key: "autoTap" },
    { chance: 0.01, title: "A distant hallway flickers.", effects: ["cameraGlitch"], key: "cameraGlitch" },
  ],
  branches: {
    pull_handle: [
      { title: "A corridor unfolds.", effects: ["depthOpen"] },
      { title: "Footsteps align with yours.", effects: ["parallax"] },
    ],
    keep_pressing: [{ title: "The surface warms.", effects: ["heatHaze"] }],
  },
};

/* ------------------------------ Small Utilities --------------------------- */

const PERSIST_KEY = "tbs:v1";

function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function useLongPress(callback, ms = 900) {
  const timer = useRef(null);
  const start = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(callback, ms);
  };
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  return { start, clear };
}

/* ---------------------------- Effects Layer UI ---------------------------- */

function EffectsLayer({ effects = [], accent = "#6C8EF5", clickCount = 0 }) {
  const reduced = useReducedMotion();
  const has = (k) => effects.includes(k);

  // Ghost tap ring that appears occasionally
  const [ghostKey, setGhostKey] = useState(0);
  useEffect(() => {
    if (!has("ghostTap")) return;
    const t = setTimeout(() => setGhostKey((v) => v + 1), 900 + (clickCount % 400));
    return () => clearTimeout(t);
  }, [effects, clickCount]);

  return (
    <div className="tbs-effects">
      {has("vignette") && (
        <div className="tbs-vignette" aria-hidden />
      )}

      {has("gentlePulse") && !reduced && (
        <motion.div
          className="tbs-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.14, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.6 }}
          style={{ "--accent": accent }}
          aria-hidden
        />
      )}

      {has("cameraGlitch") && !reduced && (
        <div className="tbs-glitch" aria-hidden>
          {new Array(12).fill(0).map((_, i) => (
            <motion.div
              key={i}
              className="tbs-glitch-line"
              initial={{ x: "-100%" }}
              animate={{ x: ["-100%", "10%", "-60%", "100%"] }}
              transition={{ duration: 0.8 + i * 0.02 }}
              style={{ top: `${(i + 1) * 7}%` }}
            />
          ))}
        </div>
      )}

      {has("ghostTap") && !reduced && (
        <motion.div
          key={ghostKey}
          className="tbs-ghost"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.0, 0.2, 0.0], scale: [0.6, 1.2, 1.6] }}
          transition={{ duration: 1.2 }}
          aria-hidden
        >
          <div className="tbs-ghost-ring" />
        </motion.div>
      )}

      {has("timeSkew") && !reduced && <div className="tbs-scan" aria-hidden />}

      {has("heatHaze") && !reduced && (
        <motion.div
          className="tbs-heat"
          initial={{ filter: "blur(0px)" }}
          animate={{ filter: ["blur(0px)", "blur(1.1px)", "blur(0.4px)"] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          aria-hidden
        />
      )}
    </div>
  );
}

/* ------------------------------ Main Component ---------------------------- */

export default function App() {
  const reduced = useReducedMotion();

  // Load persisted
  const initial = () => {
    try {
      const raw = localStorage.getItem(PERSIST_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const persisted = initial();
  const [seed] = useState(() => persisted?.seed ?? Math.floor(Math.random() * 1e9));
  const rng = useMemo(() => mulberry32(seed), [seed]);

  const [clickCount, setClickCount] = useState(persisted?.clickCount ?? 0);
  const [title, setTitle] = useState(persisted?.title ?? "Press to begin.");
  const [effects, setEffects] = useState(persisted?.effects ?? []);
  const [accent, setAccent] = useState(persisted?.accent ?? "#6C8EF5");
  const [branchId, setBranchId] = useState(persisted?.branchId ?? null);
  const [branchIndex, setBranchIndex] = useState(persisted?.branchIndex ?? 0);
  const [audio, setAudio] = useState(false);
  const [lastEvent, setLastEvent] = useState("none");
  const [showDebug, setShowDebug] = useState(false);

  // Update document theme color
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  // Persist on change
  useEffect(() => {
    const toSave = {
      v: 1,
      seed,
      clickCount,
      title,
      effects,
      accent,
      branchId,
      branchIndex,
    };
    try {
      localStorage.setItem(PERSIST_KEY, JSON.stringify(toSave));
    } catch {}
  }, [seed, clickCount, title, effects, accent, branchId, branchIndex]);

  // WebAudio beep without external libs
  const audioCtxRef = useRef(null);
  const beep = useCallback(
    (kind = "tap") => {
      if (!audio) return;
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = kind === "tap" ? 340 : 180;
        gain.gain.value = 0.0001;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        const now = ctx.currentTime;
        gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.12);
        osc.stop(now + 0.14);
      } catch {}
    },
    [audio]
  );

  // Rare event picker
  const pickRare = () => {
    const factor = reduced ? 0.5 : 1;
    for (const e of storySchema.rareEvents) {
      const r = rng();
      if (r < e.chance * factor) return e;
    }
    return null;
  };

  const computeMilestoneTitle = (count) => {
    const past = [...storySchema.milestones]
      .filter((m) => m.at <= count)
      .sort((a, b) => b.at - a.at)[0];
    return past?.title ?? null;
  };

  const next = () => {
    // Rare events can override normal step
    const rare = pickRare();
    if (rare) {
      setTitle(rare.title);
      setEffects((prev) => Array.from(new Set([...(prev || []), ...(rare.effects || [])])));
      setLastEvent(`rare:${rare.key || "rare"}`);
      setClickCount((c) => c + 1);
      beep("tap");
      return;
    }

    setClickCount((c) => {
      const nextCount = c + 1;

      // Branch mode advance
      if (branchId) {
        const steps = storySchema.branches[branchId] || [];
        const idx = Math.min(branchIndex + 1, steps.length - 1);
        setBranchIndex(idx);
        const step = steps[idx];
        if (step) {
          setTitle(step.title);
          if (step.effects) setEffects((prev) => Array.from(new Set([...(prev || []), ...step.effects])));
        }
        setLastEvent("branch-step");
        beep("tap");
        return nextCount;
      }

      // Regular milestone
      const hit = storySchema.milestones.find((m) => m.at === nextCount);
      if (hit) {
        setTitle(hit.title);
        if (hit.effects) setEffects((prev) => Array.from(new Set([...(prev || []), ...hit.effects])));
        if (hit.ui?.accent) {
          setAccent(hit.ui.accent);
          setLastEvent("ui");
        }
        if (hit.branch && hit.branch.length > 0) {
          // Choices shown in UI below
        }
        setLastEvent(`milestone:${hit.at}`);
        beep("tap");
        return nextCount;
      }

      // Soft procedural lines between milestones
      if (nextCount % 3 === 0) setTitle("You press. Something notes it.");
      else if (nextCount % 7 === 0) setTitle("A faint tick traces the air.");
      else setTitle("Press again.");

      setLastEvent("click");
      beep("tap");
      return nextCount;
    });
  };

  const setBranch = (id) => {
    setBranchId(id);
    setBranchIndex(0);
    const first = storySchema.branches[id]?.[0];
    if (first) {
      setTitle(first.title);
      if (first.effects) setEffects((prev) => Array.from(new Set([...(prev || []), ...first.effects])));
    }
    setLastEvent(`branch:${id}`);
  };

  const reset = () => {
    setClickCount(0);
    setTitle("Press to begin.");
    setEffects([]);
    setAccent("#6C8EF5");
    setBranchId(null);
    setBranchIndex(0);
    setLastEvent("reset");
  };

  // Keyboard support
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " " || e.key.toLowerCase() === "enter") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [branchId, branchIndex, next]);

  // Long press to open debug
  const { start: startLong, clear: clearLong } = useLongPress(() => setShowDebug(true), 900);

  // Branch options visible only when the current click hit a branching milestone
  const branchOptions = useMemo(() => {
    const ms = storySchema.milestones.find((m) => m.at === clickCount && m.branch);
    return ms?.branch ?? null;
  }, [clickCount]);

  // For initial rehydration title if needed
  useEffect(() => {
    if (!persisted) return;
    // On reload compute a reasonable title
    if (title === "Press to begin.") {
      const t = computeMilestoneTitle(clickCount);
      if (t) setTitle(t);
    }
  }, []); // run once

  const showAudioToggle = clickCount >= 10;

  return (
    <div className="tbs-root">
      <div
        className="tbs-header"
        onMouseDown={startLong}
        onMouseUp={clearLong}
        onTouchStart={startLong}
        onTouchEnd={clearLong}
      >
        <h1 className="tbs-title">The Button Story</h1>
        <p className="tbs-sub">A quiet room. A single choice.</p>
      </div>

      <div className="tbs-card">
        <EffectsLayer effects={effects} accent={accent} clickCount={clickCount} />

        <motion.button
          className="tbs-button"
          onClick={next}
          whileTap={{ scale: 0.98 }}
          aria-live="polite"
          aria-label="The Button"
        >
          <span className="tbs-button-label">Press</span>
          <span className="tbs-button-sub">Count {clickCount}</span>
        </motion.button>

        <motion.p
          key={title + ":" + clickCount}
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.28 }}
          className="tbs-line"
        >
          {title}
        </motion.p>

        {branchOptions && (
          <div className="tbs-branches">
            {branchOptions.map((id) => (
              <button key={id} onClick={() => setBranch(id)} className="tbs-branch-btn">
                {id.replace("_", " ")}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tbs-controls">
        {showAudioToggle && (
          <button
            onClick={() => setAudio((v) => !v)}
            aria-pressed={audio}
            className="tbs-pill"
            title="Toggle sound"
          >
            {audio ? "Sound on" : "Sound off"}
          </button>
        )}
        <button onClick={reset} className="tbs-pill" title="Reset progress">
          Reset
        </button>
        <div className="tbs-counter">{clickCount}</div>
        <span className="tbs-accent-dot" style={{ background: accent }} aria-hidden />
      </div>

      {showDebug && (
        <div className="tbs-debug">
          <div className="tbs-debug-head">
            <strong>Debug</strong>
            <button onClick={() => setShowDebug(false)} className="tbs-debug-close">
              Close
            </button>
          </div>
          <div className="tbs-debug-grid">
            <div>Clicks</div>
            <div className="tbs-right">{clickCount}</div>
            <div>Branch</div>
            <div className="tbs-right">{branchId ?? "none"}</div>
            <div>Seed</div>
            <div className="tbs-right">{seed}</div>
            <div>Last</div>
            <div className="tbs-right">{lastEvent}</div>
          </div>
          <div className="tbs-debug-jumps">
            {[1, 5, 12, 25, 50, 75, 100].map((n) => (
              <button
                key={n}
                onClick={() => {
                  reset();
                  for (let i = 0; i < n; i++) next();
                }}
                className="tbs-jump"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
