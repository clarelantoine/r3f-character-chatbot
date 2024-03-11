"use client";

import { Experience } from "@/components/Experience";
import { Canvas } from "@react-three/fiber";

export default function Home() {
  return (
    <main className="h-screen min-h-screen">
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
        <Experience />
      </Canvas>
    </main>
  );
}
