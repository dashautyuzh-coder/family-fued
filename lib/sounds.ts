export function playSound(
  type: "strike" | "award" | "fireworks" | "countdown"
) {
  const soundMap: Record<typeof type, string> = {
    strike: "/sounds/strike.wav",
    award: "/sounds/award.wav",
    fireworks: "/sounds/fireworks.wav",
    countdown: "/sounds/countdown.wav",
  };

  const src = soundMap[type];
  const audio = new Audio(src);
  audio.volume = type === "fireworks" ? 0.8 : 0.5; // a bit louder for fireworks
  void audio.play().catch((e) => {
    console.warn(`Could not play ${type} sound:`, e);
  });
}
