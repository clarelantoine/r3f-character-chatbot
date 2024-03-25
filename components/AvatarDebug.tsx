import { useControls } from "leva";

export default function AvatarDebug() {
  const { playAudio, script, position, scale } = useControls({
    playAudio: false,
    script: {
      value: "introduction",
      options: ["introduction", "angry"],
    },
    position: { value: [0, 0, 0], label: "Position" },
    scale: { value: [1, 1, 1], label: "Scale" },
  });

  return { playAudio, script, position, scale };
}
