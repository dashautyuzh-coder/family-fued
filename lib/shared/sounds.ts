// lib/shared/sounds.ts
// type SoundName =
//   | "strike"
//   | "award"
//   | "fireworks"
//   | "countdown"
//   | "buzzA"
//   | "buzzB"
//   | "ready"
//   | "theme"
//   | "correct:random"
//   | "wrong:random"
//   | "faceoff"
//   | "winner"
//   | string; // allow any future name

const BASE = "/sounds/shannon";

export const POOL_MAP = {
  "correct:random": [
    `${BASE}/correct/Track3.m4a`,
    `${BASE}/correct/Track5.m4a`,
  ],
  "points:random": [`${BASE}/points/Track7.m4a`, `${BASE}/points/Track8.m4a`],
  "wrong:random": [
    `${BASE}/wrong/Track1.m4a`,
    `${BASE}/wrong/Track10.m4a`,
    `${BASE}/wrong/Track11.m4a`,
    `${BASE}/wrong/Track12.m4a`,
    `${BASE}/wrong/Track13.m4a`,
    `${BASE}/wrong/Track14.m4a`,
  ],
  "faceoff:random": [
    `${BASE}/faceoff/Track2.m4a`,
    `${BASE}/faceoff/Track4.m4a`,
  ],
  winner: [`${BASE}/winner/Track6.m4a`],
  // If you already had separate strike/award assets, set them here;
  // otherwise you can point them to any single file you like.
  strike: [`/sounds/strike.wav`], // example
  award: [`/sounds/award.wav`], // example
  fireworks: [`/sounds/fireworks.wav`], // example
  countdown: [`/sounds/countdown.wav`], // example
  bonding: [`/sounds/bonding.m4a`], // example
} as const;

export type SoundName = keyof typeof POOL_MAP | "ding";
const POOLS: Record<keyof typeof POOL_MAP, readonly string[]> = POOL_MAP;
//ToDo: BuzzA and BuzzB

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** A short synthesized bell tone for lightweight click feedback — not a
 * pre-recorded voice line, just a clean "ding" with no audio file needed. */
function playDing(volume: number): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return Promise.resolve();

  const ctx = new AudioCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(1318.5, now); // E6 — bright, short bell ding
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.4);

  return new Promise((resolve) => {
    osc.onended = () => {
      ctx.close();
      resolve();
    };
  });
}

class SoundQueue {
  private muted = false;
  // How many sounds are currently playing right now.
  private activeCount = 0;
  // Cap concurrent sounds so mashing a button doesn't stack up a growing
  // pile of overlapping audio — but distinct sounds triggered close together
  // (a click sound, then a judging sound, etc.) still play right away rather
  // than queueing silently behind each other for several seconds.
  private static readonly MAX_CONCURRENT = 4;

  setMuted(m: boolean) {
    this.muted = m;
  }

  /** Play a sound now (sounds can overlap — that's normal for game UI).
   * Resolves once it finishes playing. */
  play(name: SoundName, { volume = 1.0 }: { volume?: number } = {}) {
    if (this.muted) return Promise.resolve();
    if (this.activeCount >= SoundQueue.MAX_CONCURRENT) return Promise.resolve();

    if (name === "ding") {
      this.activeCount++;
      return playDing(volume).finally(() => this.activeCount--);
    }

    const srcList = POOLS[name];
    if (!srcList.length) return Promise.resolve();

    const src = name.endsWith(":random") ? pick(srcList) : srcList[0];

    this.activeCount++;
    return new Promise<void>((resolve) => {
      const audio = new Audio(src);
      audio.volume = volume;
      const done = () => {
        this.activeCount--;
        resolve();
      };
      audio.onended = done;
      // on iOS, quick fallback just in case onended doesn't fire
      audio.onerror = done;
      audio.play().catch(done);
    });
  }

  /** Play a list of sounds one after another, waiting for each to finish. */
  async sequence(names: SoundName[], opts?: { volume?: number }) {
    for (const n of names) {
      await this.play(n, opts);
    }
  }
}

export const sound = new SoundQueue();

/** (Optional) Compatibility wrapper if you were importing playSound previously */
export function playSound(name: SoundName) {
  return sound.play(name);
}
