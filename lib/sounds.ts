// /lib/sounds.ts
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

export type SoundName = keyof typeof POOL_MAP;
const POOLS: Record<SoundName, readonly string[]> = POOL_MAP;
//ToDo: BuzzA and BuzzB

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

class SoundQueue {
  private chain: Promise<void> = Promise.resolve();
  private muted = false;

  setMuted(m: boolean) {
    this.muted = m;
  }

  /** Enqueue a sound. Resolves when it has fully finished playing. */
  play(name: SoundName, { volume = 1.0 }: { volume?: number } = {}) {
    const srcList = POOLS[name];
    if (!srcList.length || this.muted) return Promise.resolve();

    const src = name.endsWith(":random") ? pick(srcList) : srcList[0];

    const job = () =>
      new Promise<void>((resolve) => {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.onended = () => resolve();
        // on iOS, quick fallback just in case onended doesn't fire
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });

    // 👇 chain ensures sequential playback with no overlap
    this.chain = this.chain.then(job);
    return this.chain;
  }

  /** Enqueue many in order */
  sequence(names: SoundName[], opts?: { volume?: number }) {
    let p = Promise.resolve();
    names.forEach((n) => (p = p.then(() => this.play(n, opts))));
    return p;
  }
}

export const sound = new SoundQueue();

/** (Optional) Compatibility wrapper if you were importing playSound previously */
export function playSound(name: SoundName) {
  return sound.play(name);
}
