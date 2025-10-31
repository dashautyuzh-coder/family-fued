// /lib/sounds.ts
type SoundName =
  | "strike"
  | "award"
  | "fireworks"
  | "countdown"
  | "buzzA"
  | "buzzB"
  | "ready"
  | "theme"
  | string; // allow any future name

export function playSound(type: SoundName) {
  // Map default known sounds
  const soundMap: Record<string, string> = {
    strike: "/sounds/strike.wav",
    award: "/sounds/award.wav",
    fireworks: "/sounds/fireworks.wav",
    countdown: "/sounds/countdown.wav",
    buzzA: "/sounds/award.wav",
    buzzB: "/sounds/award.wav",
    ready: "/sounds/award.wav",
    theme: "/sounds/award.wav",
  };

  // Try to use custom manager-provided sound if it exists
  // For example, "bonus", "win", "lose", etc. just need matching files
  const src = soundMap[type] ?? `/sounds/${type}.mp3`; // auto-load if dropped into /public/sounds

  const audio = new Audio(src);
  // Use slightly different defaults depending on context
  if (type === "fireworks" || type.startsWith("buzz")) {
    audio.volume = 0.8;
  } else {
    audio.volume = 0.5;
  }

  void audio.play().catch((e) => {
    console.warn(`Could not play '${type}' sound from ${src}:`, e);
  });
}
