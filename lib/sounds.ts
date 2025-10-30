export function playSound(type: "strike" | "award") {
  const audio = new Audio(
    type === "strike" ? "/sounds/strike.wav" : "/sounds/award.wav"
  );
  audio.volume = 0.5;
  void audio.play();
}
