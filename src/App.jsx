import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  THEBUTTON - Receipt Edition (Slow Burn to Wild)
  This is a full receipt-themed experience that starts calm and ramps into surreal chaos.
  - Real thermal-receipt vibe: narrow width, dashed perforations, subtotal/tax/total, barcode, QR-like block, cashier line, tender, change due
  - 500+ progressive events generated procedurally. First ~10 clicks are quiet. Elements appear and grow over time.
  - The button moves, splits, shatters, hides, recombines, smears ink, jams the printer, causes paper curl, misprints.
  - Activity log uses receipt lines. Story lines print as ITEMS.
  - Space toggles press; Ctrl+Shift+B opens a tiny dev panel.

  New in this version
  - Boss sequence with timer and HP bar. Click to defeat before time ends.
  - Paper burn edges with dynamic scorch intensity.
  - Coupon mini-choices that apply 60s modifiers: Tax Holiday, Ink Surge, Low Gravity.
*/

// ===== Helpers =====
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const rb = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pad = (n, w = 6) => String(n).padStart(w, "0");
const fmt = (n) => n.toLocaleString();

const BASE_TAX = 0.0825;

// ===== Tiny audio =====
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

// ===== Visual Bits =====
const Barcode = ({ seed = 0 }) => {
  // Simple pseudo barcode made of div bars
  const bars = useMemo(() => {
    const arr = [];
    const count = 60;
    for (let i = 0; i < count; i++) {
      const w = (i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1) + (Math.random() < 0.07 ? 1 : 0);
      const h = 40 + (i % 5) * 3;
      const o = i % 9 === 0 ? 0.9 : 0.7;
      arr.push({ w, h, o });
    }
    return arr;
  }, [seed]);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 60 }}>
      {bars.map((b, i) => (
        <div key={i} style={{ width: b.w, height: b.h, background: `rgba(0,0,0,${b.o})` }} />
      ))}
    </div>
  );
};

const QRish = ({ chaos = 0 }) => {
  // Tiny QR-like block with random dots
  const sz = 7;
  const cells = useMemo(() => {
    const c = [];
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const on = Math.random() < 0.38 + chaos * 0.1;
        c.push({ x, y, on });
      }
    }
    return c;
  }, [chaos]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${sz}, 6px)`, gap: 1, padding: 3, background: "#000" }}>
      {cells.map((c, i) => (
        <div key={i} style={{ width: 6, height: 6, background: c.on ? "#fff" : "#111" }} />
      ))}
    </div>
  );
};

const TearBand = ({ active }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: "100%" }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: "linear" }}
        style={{ position: "fixed", left: 0, right: 0, height: 80, top: 0, zIndex: 50, background: "repeating-linear-gradient(90deg, rgba(0,0,0,0.12), rgba(0,0,0,0.12) 6px, rgba(0,0,0,0.02) 6px, rgba(0,0,0,0.02) 12px)" }}
      />
    )}
  </AnimatePresence>
);

const BurnEdges = ({ intensity = 0 }) => {
  // Render radial burn spots along edges. Intensity controls opacity and size.
  const o = clamp(intensity, 0, 1);
  const sz = 20 + o * 40;
  return (
    <div
      aria-hidden
      style={{
        pointerEvents: "none",
        position: "absolute",
        inset: 0,
        borderRadius: 10,
        // multiple radial gradients to fake scorch at edges and corners
        background:
          `radial-gradient(${sz}px ${sz}px at 0% 0%, rgba(0,0,0,${0.12 + o * 0.25}), transparent 60%),
           radial-gradient(${sz}px ${sz}px at 100% 0%, rgba(0,0,0,${0.12 + o * 0.25}), transparent 60%),
           radial-gradient(${sz}px ${sz}px at 0% 100%, rgba(0,0,0,${0.12 + o * 0.25}), transparent 60%),
           radial-gradient(${sz}px ${sz}px at 100% 100%, rgba(0,0,0,${0.12 + o * 0.25}), transparent 60%),
           radial-gradient(${sz * 0.8}px ${sz * 0.8}px at 50% 0%, rgba(0,0,0,${0.08 + o * 0.2}), transparent 55%),
           radial-gradient(${sz * 0.8}px ${sz * 0.8}px at 50% 100%, rgba(0,0,0,${0.08 + o * 0.2}), transparent 55%)`,
        mixBlendMode: "multiply",
        opacity: 0.7,
      }}
    />
  );
};

// ===== Procedural Event Plan =====
const EVENTS_COUNT = 520; // 500+ events
const RAMP_DIVISOR = 60000; // chaos reaches 1 near 60k clicks

function seededRNG(seed) {
  // tiny LCG for deterministic variety per event index
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function buildEventPlan(count = EVENTS_COUNT) {
  const plan = [];
  const adj = ["faint", "light", "thin", "quiet", "soft", "narrow", "cold", "warm", "loose", "woven", "odd", "patient", "curious", "tilted", "bent", "melted", "quantum", "shimmering", "fractal", "paper", "thermal", "burnt", "ghost"];
  const obj = ["outline", "shadow", "staple", "barcode", "total", "subtotal", "ink", "paper curl", "smudge", "stamp", "glyph", "tear", "hole", "fold", "crease", "sticker", "receipt copy", "ghost line", "rewind", "duplicate", "silhouette", "price tag", "coupon", "cashier id", "register id", "item code", "time code", "inventory line"];
  const act = ["appears", "grows", "slides", "twitches", "hides", "returns", "splits", "recombines", "burns a little", "prints sideways", "repeats", "smears", "crackles", "asks for a name", "hums", "breathes", "shifts left", "shifts right", "unprices itself", "doubles", "stutters", "jumps a line", "misaligns", "fades", "darkens", "inverts"]; 

  let clicksAt = 10; // first event appears after 10 clicks
  for (let i = 0; i < count; i++) {
    const rng = seededRNG(i + 1337);
    // Make early events close together, later ones spread out
    const step = i < 20 ? 5 : i < 60 ? 10 : i < 120 ? 20 : i < 200 ? 30 : i < 300 ? 40 : 60;
    clicksAt += step + Math.floor(rng() * Math.max(1, step * 0.5));

    const title = `${pick(adj)} ${pick(obj)} ${pick(act)}`;

    // Choose an effect bucket
    const bucketRoll = rng();
    let effect = "story";
    if (bucketRoll < 0.14) effect = "moveButton";
    else if (bucketRoll < 0.26) effect = "shatterButton";
    else if (bucketRoll < 0.39) effect = "receiptVisual";
    else if (bucketRoll < 0.49) effect = "addLine";
    else if (bucketRoll < 0.57) effect = "glitch";
    else if (bucketRoll < 0.66) effect = "ink";
    else if (bucketRoll < 0.75) effect = "paper";
    else if (bucketRoll < 0.8) effect = "burn";        // new burn edge bumps
    else if (bucketRoll < 0.86) effect = "coupon";     // new coupon choices
    else if (bucketRoll < 0.9) effect = "boss";        // new boss encounters
    else if (bucketRoll < 0.96) effect = "barcode";
    else if (bucketRoll < 0.99) effect = "qr";
    else effect = "meta";

    plan.push({ at: clicksAt, title, effect });
  }
  return plan;
}

// ===== App =====
export default function App() {
  // core counters
  const [clicks, setClicks] = useState(() => Number(localStorage.getItem("rb-clicks") || 0));
  const [streak, setStreak] = useState(0);

  // receipt data
  const [lines, setLines] = useState([]); // { k, left, right, type }
  const [notes, setNotes] = useState([]); // small centered notes
  const [stamps, setStamps] = useState([]); // stickers on receipt
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);

  // button visuals
  const [btn, setBtn] = useState({ x: 0, y: 0, r: 0, s: 1, broken: false, hidden: false });
  const [scramble, setScramble] = useState(false);

  // overlays
  const [tear, setTear] = useState(false);
  const [fake404, setFake404] = useState(false);

  // burn edges
  const [burn, setBurn] = useState(0); // 0..1

  // coupon system
  const [couponOffer, setCouponOffer] = useState(null); // { id, opts: [...] }
  const [activeMods, setActiveMods] = useState([]); // [{ id, type, label, ends }]

  // boss system
  const [boss, setBoss] = useState({ active: false, name: "", ends: 0, hp: 0, hpMax: 0 });

  // dev
  const [dev, setDev] = useState(false);

  const planRef = useRef(buildEventPlan());
  const lastClickRef = useRef(0);

  const { blip } = useTinyAudio();

  // chaos level based on clicks
  const chaos = useMemo(() => clamp(clicks / RAMP_DIVISOR, 0, 1), [clicks]);

  useEffect(() => {
    localStorage.setItem("rb-clicks", String(clicks));
  }, [clicks]);

  // derived modifiers
  const mods = useMemo(() => {
    const now = Date.now();
    const live = activeMods.filter((m) => m.ends > now);
    const taxMult = live.some((m) => m.type === "taxHoliday") ? 0 : 1;
    const stampBoost = 1 + live.filter((m) => m.type === "inkBoost").length; // each adds 1x
    const buttonFloat = live.some((m) => m.type === "lowGravity");
    return { live, taxMult, stampBoost, buttonFloat };
  }, [activeMods]);

  // cleanup expired mods
  useEffect(() => {
    const t = setInterval(() => {
      setActiveMods((list) => list.filter((m) => m.ends > Date.now()));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ===== Press handler =====
  const press = useCallback(() => {
    const now = performance.now();
    if (now - lastClickRef.current < 12) return; // debounce
    lastClickRef.current = now;

    const freq = boss.active ? 420 : 200 + Math.floor(chaos * 420) + Math.floor(Math.random() * 50);
    blip(freq, 0.05, scramble || boss.active ? "square" : "sine");

    setClicks((c) => {
      const nc = c + 1;
      console.log("[press]", { clicks: nc });
      return nc;
    });
    setStreak((s) => Math.min(999999, s + 1));

    // Boss damage
    if (boss.active) {
      setBoss((b) => {
        const damage = 1; // could scale with streak
        const nhp = Math.max(0, b.hp - damage);
        return { ...b, hp: nhp };
      });
    }

    // tiny chance to spawn tear band on press at high chaos
    if (Math.random() < 0.002 + chaos * 0.01) setTear(true);
    if (tear) setTimeout(() => setTear(false), 900);
  }, [chaos, scramble, tear, boss.active, blip]);

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        press();
      }
      if (e.ctrlKey && e.shiftKey && e.code === "KeyB") setDev((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  // helper: grant modifier
  const grantMod = useCallback((type, label, seconds = 60) => {
    const ends = Date.now() + seconds * 1000;
    const id = `${type}-${ends}`;
    setActiveMods((arr) => [{ id, type, label, ends }, ...arr]);
    setLines((prev) => [{ k: `mod${ends}`, left: `${label} active`, right: `${seconds}s`, type: "sys" }, ...prev].slice(0, 80));
  }, []);

  // ===== Event processing =====
  useEffect(() => {
    if (clicks === 0) return;
    const plan = planRef.current;
    // find events that should fire now
    const due = plan.filter((e) => e.at === clicks);
    if (due.length === 0) return;

    due.forEach((ev) => {
      console.log("[event]", ev.at, ev.effect, ev.title);
      const timestamp = new Date().toLocaleTimeString();

      switch (ev.effect) {
        case "story": {
          setLines((prev) => [{ k: `s${ev.at}`, left: ev.title, right: "", type: "story" }, ...prev].slice(0, 80));
          setNotes((n) => [
            { k: `n${ev.at}`, msg: pick(["The room inhales.", "Paper remembers.", "Ink dries slower.", "The subtotal watches.", "You are observed."]) },
            ...n
          ].slice(0, 18));
          break;
        }
        case "moveButton": {
          const amp = mods.buttonFloat ? 1.8 : 1;
          const nx = Math.round(rb(-160 * amp, 160 * amp));
          const ny = Math.round(rb(-80 * amp, 120 * amp));
          const nr = Math.round(rb(-25, 25));
          const ns = clamp(1 + rb(-0.2, 0.25), 0.6, 1.4);
          setBtn((b) => ({ ...b, x: nx, y: ny, r: nr, s: ns }));
          setLines((prev) => [{ k: `m${ev.at}`, left: `Button moved`, right: `${nx},${ny}`, type: "sys" }, ...prev].slice(0, 80));
          break;
        }
        case "shatterButton": {
          setBtn((b) => ({ ...b, broken: true }));
          setTimeout(() => setBtn((b) => ({ ...b, broken: false })), 3000);
          setLines((prev) => [{ k: `b${ev.at}`, left: `Button fragments`, right: "x6", type: "alert" }, ...prev].slice(0, 80));
          break;
        }
        case "receiptVisual": {
          const count = 1 + Math.floor(Math.random() * (mods.stampBoost));
          for (let i = 0; i < count; i++) {
            const kind = pick(["SMUDGE", "STAMP", "MISPRINT", "REPRINT", "VOID*", "COPY", "PAID", "DUP"]);
            setStamps((s) => [{ k: `st${ev.at}-${i}`, kind, x: rb(10, 260), y: rb(120, 620), r: rb(-18, 18), o: 0.06 + Math.random() * 0.14 }, ...s].slice(0, 30));
          }
          setLines((prev) => [{ k: `v${ev.at}`, left: `visual mark added`, right: timestamp, type: "vis" }, ...prev].slice(0, 80));
          break;
        }
        case "addLine": {
          const price = Math.round(rb(1, 19)) + (Math.random() < 0.25 ? 0.99 : 0.49);
          setLines((prev) => [{ k: `i${ev.at}`, left: ev.title.toUpperCase(), right: `$${price.toFixed(2)}`, type: "item" }, ...prev].slice(0, 80));
          setSubtotal((s) => s + price);
          setTax((t) => t + price * BASE_TAX * mods.taxMult);
          break;
        }
        case "glitch": {
          setScramble(true);
          setTimeout(() => setScramble(false), 1400);
          setLines((prev) => [{ k: `g${ev.at}`, left: "Text scrambles briefly", right: "", type: "glitch" }, ...prev].slice(0, 80));
          break;
        }
        case "ink": {
          setNotes((n) => [{ k: `ink${ev.at}`, msg: pick(["Ink low", "Head cooling", "Thermal fade", "Ribbon drag"]) }, ...n].slice(0, 18));
          break;
        }
        case "paper": {
          setNotes((n) => [{ k: `pp${ev.at}`, msg: pick(["Paper curls", "Fold detected", "Edge warm", "Perforation loose"]) }, ...n].slice(0, 18));
          break;
        }
        case "burn": {
          setBurn((b) => clamp(b + 0.15, 0, 1));
          setLines((prev) => [{ k: `brn${ev.at}`, left: "Edges singe a little", right: "*", type: "alert" }, ...prev].slice(0, 80));
          break;
        }
        case "coupon": {
          // show 60s choice overlay
          setCouponOffer({ id: `cp${ev.at}`, opts: [
            { type: "taxHoliday", label: "Tax Holiday 60s" },
            { type: "inkBoost", label: "Ink Surge 60s" },
            { type: "lowGravity", label: "Low Gravity 60s" },
          ]});
          setLines((prev) => [{ k: `cp${ev.at}`, left: "Coupon offer printed", right: "60s", type: "sys" }, ...prev].slice(0, 80));
          break;
        }
        case "boss": {
          const name = pick(["Receipt Keeper", "Subtotal Warden", "Ink Wraith", "Barcode Serpent", "Thermal Titan"]);
          const dur = 45000; // 45s
          const hpMax = 60 + Math.floor(chaos * 120);
          setBoss({ active: true, name, ends: Date.now() + dur, hp: hpMax, hpMax });
          setScramble(true);
          setLines((prev) => [{ k: `boss${ev.at}`, left: `${name} approaches`, right: "45s", type: "alert" }, ...prev].slice(0, 80));
          break;
        }
        case "barcode": {
          setLines((prev) => [{ k: `bc${ev.at}`, left: "Barcode updated", right: pad(ev.at, 5), type: "sys" }, ...prev].slice(0, 80));
          break;
        }
        case "qr": {
          setLines((prev) => [{ k: `qr${ev.at}`, left: "QR refresh", right: pad(ev.at, 4), type: "sys" }, ...prev].slice(0, 80));
          break;
        }
        case "meta": {
          setFake404(true);
          setTimeout(() => setFake404(false), 2200);
          setLines((prev) => [{ k: `x${ev.at}`, left: "Page drifts from itself", right: "404", type: "alert" }, ...prev].slice(0, 80));
          break;
        }
        default:
          break;
      }
    });
  }, [clicks, mods]);

  // Boss timer and end handling
  useEffect(() => {
    if (!boss.active) return;
    const id = setInterval(() => {
      const now = Date.now();
      if (now >= boss.ends) {
        // time up
        const win = boss.hp <= 0;
        if (win) {
          setLines((prev) => [{ k: `bw${now}`, left: `${boss.name} defeated`, right: "PAID", type: "alert" }, ...prev].slice(0, 80));
          setStamps((s) => [{ k: `paid${now}`, kind: "PAID", x: rb(40, 240), y: rb(120, 520), r: rb(-8, 8), o: 0.18 }, ...s].slice(0, 30));
        } else {
          setLines((prev) => [{ k: `bl${now}`, left: `${boss.name} escapes`, right: "VOID", type: "alert" }, ...prev].slice(0, 80));
          setStamps((s) => [{ k: `void${now}`, kind: "VOID*", x: rb(40, 240), y: rb(120, 520), r: rb(-8, 8), o: 0.16 }, ...s].slice(0, 30));
        }
        setBoss({ active: false, name: "", ends: 0, hp: 0, hpMax: 0 });
        setScramble(false);
      }
    }, 120);
    return () => clearInterval(id);
  }, [boss]);

  // totals recompute on change
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  // ===== Render helpers =====
  const maybeScramble = (text) => {
    if (!scramble) return text;
    return text
      .split("")
      .map((ch) => (Math.random() < 0.12 ? pick(["@", "#", "%", "&", "*", "?", "∴"]) : ch))
      .join("");
  };

  // ===== UI =====
  const paperHue = 0; // thermal paper near white
  const paperLight = 100 - chaos * 8; // darker as chaos rises

  // Active mods badges
  const modBadges = (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
      {mods.live.map((m) => (
        <div key={m.id} style={{ fontSize: 10, border: "1px solid rgba(0,0,0,0.4)", padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.06)" }}>{m.label}</div>
      ))}
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at 50% 0%, rgba(240,240,240,1) 0%, rgba(208,208,208,1) 70%, rgba(180,180,180,1) 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: 20,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
        color: "#111",
      }}
    >
      {/* Fake 404 overlay */}
      <AnimatePresence>
        {fake404 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ position: "fixed", inset: 0, background: "#0b0c10", color: "#e8edf7", display: "grid", placeItems: "center", zIndex: 100 }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>404</div>
              <div style={{ opacity: 0.9 }}>The page you want has drifted. Try again later.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tear band */}
      <TearBand active={tear} />

      {/* Receipt container */}
      <motion.div
        style={{
          width: 340,
          maxWidth: "100%",
          background: `hsl(${paperHue}, 20%, ${paperLight}%)`,
          boxShadow: "0 14px 40px rgba(0,0,0,0.25)",
          borderRadius: 10,
          position: "relative",
        }}
        animate={{ rotate: scramble ? rb(-0.6, 0.6) : 0, x: scramble ? rb(-2, 2) : 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Burn edges overlay */}
        <BurnEdges intensity={burn} />

        {/* Perforation top */}
        <div style={{ height: 14, background: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 10px)` }} />

        {/* Receipt inner */}
        <div style={{ padding: 14, paddingTop: 6 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>THE BUTTON MART</div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>INFINITE RECEIPT SYSTEM</div>
            <div style={{ fontSize: 10, opacity: 0.8 }}>TXN #{pad(clicks, 8)} • REG 07 • CASHIER 000</div>
            <div style={{ fontSize: 10, opacity: 0.8 }}>{new Date().toLocaleString()}</div>
          </div>

          {/* Boss overlay within receipt */}
          <AnimatePresence>
            {boss.active && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  border: "1px dashed rgba(0,0,0,0.5)",
                  padding: 8,
                  marginBottom: 8,
                  background: "rgba(255,110,110,0.12)",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, textAlign: "center" }}>{boss.name}</div>
                <div style={{ height: 8, background: "rgba(0,0,0,0.12)", borderRadius: 4, overflow: "hidden", marginTop: 6 }}>
                  <div style={{ width: `${(1 - boss.hp / boss.hpMax) * 100}%`, height: "100%", background: "#d33" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 4 }}>
                  <div>HP {boss.hp}/{boss.hpMax}</div>
                  <BossTimer ends={boss.ends} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button zone */}
          <div style={{ display: "grid", placeItems: "center", margin: "8px 0 12px 0" }}>
            <div style={{ position: "relative", height: 140 }}>
              {/* shards when broken */}
              <AnimatePresence>
                {btn.broken && Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={`sh${i}`}
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{ opacity: 1, x: rb(-80, 80), y: rb(-80, 80), rotate: rb(-90, 90) }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ position: "absolute", top: 60, left: 60, width: 20, height: 20, background: "#333", border: "1px solid #111" }}
                  />
                ))}
              </AnimatePresence>

              {/* main button */}
              {!btn.hidden && (
                <motion.button
                  onClick={press}
                  whileTap={{ scale: 0.94 }}
                  animate={{ x: btn.x, y: btn.y, rotate: btn.r, scale: btn.s }}
                  transition={{ type: "spring", stiffness: 140, damping: 12 }}
                  style={{
                    position: "absolute",
                    left: 60,
                    top: 60,
                    width: 120,
                    height: 120,
                    borderRadius: scramble ? "22%" : "50%",
                    border: "1px solid rgba(0,0,0,0.7)",
                    background: boss.active ? "linear-gradient(180deg, #ff8c8c 0%, #c84040 100%)" : "linear-gradient(180deg, #f15f5f 0%, #b53030 100%)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 14,
                    letterSpacing: 1,
                    textShadow: "0 1px 0 rgba(0,0,0,0.4)",
                    cursor: "pointer",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
                  }}
                >
                  PRESS
                  <div style={{ fontSize: 10, opacity: 0.9 }}>{fmt(clicks)}</div>
                </motion.button>
              )}
            </div>
          </div>

          {/* Items title row */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, borderTop: "1px dashed rgba(0,0,0,0.4)", paddingTop: 6, marginTop: 4 }}>
            <div>ITEM</div>
            <div>AMOUNT</div>
          </div>

          {/* Lines */}
          <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 6 }}>
            {lines.length === 0 && (
              <div style={{ fontSize: 10, opacity: 0.6, textAlign: "center", padding: 8 }}>
                Nothing prints yet. First ten clicks are quiet.
              </div>
            )}
            {lines.map((ln) => (
              <div key={ln.k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "2px 0", borderBottom: "1px dotted rgba(0,0,0,0.08)" }}>
                <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>{maybeScramble(ln.left)}</div>
                <div>{ln.right}</div>
              </div>
            ))}
          </div>

          {/* Notes center */}
          {notes.length > 0 && (
            <div style={{ textAlign: "center", fontSize: 10, opacity: 0.85, marginTop: 6 }}>
              {notes.slice(0, 3).map((n) => (
                <div key={n.k}>{maybeScramble(n.msg)}</div>
              ))}
            </div>
          )}

          {/* Subtotals */}
          <div style={{ borderTop: "1px dashed rgba(0,0,0,0.4)", marginTop: 6, paddingTop: 6, fontSize: 11 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>SUBTOTAL</div>
              <div>${subtotal.toFixed(2)}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>TAX</div>
              <div>${tax.toFixed(2)}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, borderTop: "1px dotted rgba(0,0,0,0.35)", marginTop: 4, paddingTop: 4 }}>
              <div>TOTAL</div>
              <div>${total.toFixed(2)}</div>
            </div>
            {mods.live.length > 0 && modBadges}
          </div>

          {/* Barcode and QR */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <Barcode seed={clicks} />
            <QRish chaos={chaos} />
          </div>

          {/* Footer blocks */}
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <div style={{ fontSize: 10 }}>TENDER: CASH</div>
            <div style={{ fontSize: 10 }}>CHANGE DUE: $0.00</div>
            <div style={{ fontSize: 10, opacity: 0.8 }}>Thank you for clicking</div>
          </div>

          {/* Stamps overlay */}
          <div style={{ position: "relative", height: 0 }}>
            {stamps.map((s) => (
              <div key={s.k} style={{ position: "absolute", left: s.x, top: s.y, transform: `rotate(${s.r}deg)`, opacity: s.o, fontSize: 72, fontWeight: 900, letterSpacing: 2, color: "#000" }}>
                {s.kind}
              </div>
            ))}
          </div>
        </div>

        {/* Perforation bottom */}
        <div style={{ height: 14, background: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 10px)` }} />
      </motion.div>

      {/* Coupon overlay */}
      <AnimatePresence>
        {couponOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 120 }}
          >
            <div style={{ width: 320, background: "#fff", color: "#111", borderRadius: 10, padding: 12, boxShadow: "0 12px 30px rgba(0,0,0,0.4)" }}>
              <div style={{ textAlign: "center", fontWeight: 800, fontSize: 14, marginBottom: 8 }}>COUPON CHOICES</div>
              <div style={{ display: "grid", gap: 8 }}>
                {couponOffer.opts.map((o) => (
                  <button
                    key={o.type}
                    onClick={() => {
                      grantMod(o.type, o.label, 60);
                      setCouponOffer(null);
                    }}
                    style={{
                      border: "1px solid rgba(0,0,0,0.3)",
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "#fafafa",
                      cursor: "pointer",
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dev panel */}
      <AnimatePresence>
        {dev && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            style={{ position: "fixed", right: 16, top: 16, background: "rgba(0,0,0,0.86)", color: "#fff", padding: 12, borderRadius: 8, fontSize: 12, zIndex: 200 }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Dev</div>
            <button onClick={() => setClicks(0)} style={{ display: "block", width: "100%", marginBottom: 6 }}>Reset clicks</button>
            <button onClick={() => setBtn((b) => ({ ...b, hidden: !b.hidden }))} style={{ display: "block", width: "100%", marginBottom: 6 }}>Toggle button</button>
            <button onClick={() => setScramble((v) => !v)} style={{ display: "block", width: "100%", marginBottom: 6 }}>Toggle scramble</button>
            <button onClick={() => setLines([])} style={{ display: "block", width: "100%", marginBottom: 6 }}>Clear lines</button>
            <button onClick={() => setBurn((x) => clamp(x + 0.2, 0, 1))} style={{ display: "block", width: "100%", marginBottom: 6 }}>Add burn</button>
            <button onClick={() => setCouponOffer({ id: "manual", opts: [{ type: "taxHoliday", label: "Tax Holiday 60s" }, { type: "inkBoost", label: "Ink Surge 60s" }, { type: "lowGravity", label: "Low Gravity 60s" }] })} style={{ display: "block", width: "100%", marginBottom: 6 }}>Test coupon</button>
            <button onClick={() => setBoss({ active: true, name: "Test Boss", ends: Date.now() + 30000, hp: 40, hpMax: 40 })} style={{ display: "block", width: "100%" }}>Test boss</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BossTimer({ ends }) {
  const [left, setLeft] = useState(Math.max(0, ends - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, ends - Date.now())), 120);
    return () => clearInterval(id);
  }, [ends]);
  const s = Math.ceil(left / 1000);
  return <div>TIME {s}s</div>;
}


