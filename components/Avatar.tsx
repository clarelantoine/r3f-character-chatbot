"use client";
import * as THREE from "three";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFResult, corresponding } from "@/utils/avatar.utils";

export function Avatar(props: JSX.IntrinsicElements["group"]) {
  // console.log("avatar rendered");

  const {
    playAudio,
    script,
    smoothMorphTarget,
    morphTargetSmoothing,
    headFollow,
  } = useControls({
    playAudio: false,
    smoothMorphTarget: true,
    morphTargetSmoothing: 0.5,
    headFollow: true,
    script: {
      value: "introduction",
      options: ["introduction", "angry"],
    },
  });

  const audio = useMemo(() => new Audio(`/audios/${script}.mp3`), [script]);
  const jsonFile: string = useLoader(
    THREE.FileLoader,
    `/audios/${script}.json`
  );
  const lipsync = JSON.parse(jsonFile);

  useFrame(() => {
    const currentAudioTime = audio.currentTime;

    if (audio.paused || audio.ended) {
      setAnimation("Idle");
      return;
    }

    Object.values(corresponding).forEach((value) => {
      if (!smoothMorphTarget) {
        // head
        const morphHeadIndex =
          nodes?.Wolf3D_Head?.morphTargetDictionary?.[value];
        const morphHeadInfluence = nodes?.Wolf3D_Head?.morphTargetInfluences;

        if (morphHeadInfluence && morphHeadIndex !== undefined)
          morphHeadInfluence[morphHeadIndex] = 0;

        // teeth
        const morphTeethIndex =
          nodes?.Wolf3D_Teeth?.morphTargetDictionary?.[value];
        const morphTeethInfluence = nodes?.Wolf3D_Teeth?.morphTargetInfluences;

        if (morphTeethInfluence && morphTeethIndex !== undefined)
          morphTeethInfluence[morphTeethIndex] = 0;
      } else {
        // head
        const morphHeadIndex =
          nodes?.Wolf3D_Head?.morphTargetDictionary?.[value];
        const morphHeadInfluence = nodes?.Wolf3D_Head?.morphTargetInfluences;
        if (morphHeadInfluence && morphHeadIndex !== undefined)
          morphHeadInfluence[morphHeadIndex] = THREE.MathUtils.lerp(
            morphHeadInfluence[morphHeadIndex],
            0,
            morphTargetSmoothing
          );

        // teeth
        const morphTeethIndex =
          nodes?.Wolf3D_Teeth?.morphTargetDictionary?.[value];
        const morphTeethInfluence = nodes?.Wolf3D_Teeth?.morphTargetInfluences;

        if (morphTeethInfluence && morphTeethIndex !== undefined)
          morphTeethInfluence[morphTeethIndex] = THREE.MathUtils.lerp(
            morphTeethInfluence[morphTeethIndex],
            0,
            morphTargetSmoothing
          );
      }
    });

    for (let i = 0; i < lipsync.mouthCues.length; i++) {
      const mouthCue = lipsync.mouthCues[i];
      if (
        currentAudioTime >= mouthCue.start &&
        currentAudioTime <= mouthCue.end
      ) {
        // console.log(mouthCue.value);

        if (!smoothMorphTarget) {
          // head
          const morphHeadIndex =
            nodes?.Wolf3D_Head?.morphTargetDictionary?.[
              corresponding[mouthCue.value as keyof typeof corresponding]
            ];
          const morphHeadInfluence = nodes?.Wolf3D_Head?.morphTargetInfluences;
          if (morphHeadInfluence && morphHeadIndex !== undefined)
            morphHeadInfluence[morphHeadIndex] = 1;

          // teeth
          const morphTeethIndex =
            nodes?.Wolf3D_Teeth?.morphTargetDictionary?.[
              mouthCue.value as keyof typeof corresponding
            ];
          const morphTeethInfluence =
            nodes?.Wolf3D_Teeth?.morphTargetInfluences;
          if (morphTeethInfluence && morphTeethIndex !== undefined)
            morphTeethInfluence[morphTeethIndex] = 1;
        } else {
          // head
          const morphHeadIndex =
            nodes?.Wolf3D_Head?.morphTargetDictionary?.[
              corresponding[mouthCue.value as keyof typeof corresponding]
            ];
          const morphHeadInfluence = nodes?.Wolf3D_Head?.morphTargetInfluences;
          if (morphHeadInfluence && morphHeadIndex !== undefined)
            morphHeadInfluence[morphHeadIndex] = THREE.MathUtils.lerp(
              morphHeadInfluence[morphHeadIndex],
              1,
              morphTargetSmoothing
            );

          // teeth
          const morphTeethIndex =
            nodes?.Wolf3D_Teeth?.morphTargetDictionary?.[
              mouthCue.value as keyof typeof corresponding
            ];
          const morphTeethInfluence =
            nodes?.Wolf3D_Teeth?.morphTargetInfluences;
          if (morphTeethInfluence && morphTeethIndex !== undefined)
            morphTeethInfluence[morphTeethIndex] = THREE.MathUtils.lerp(
              morphTeethInfluence[morphTeethIndex],
              1,
              morphTargetSmoothing
            );
        }

        break;
      }
    }
  });

  useEffect(() => {
    if (playAudio) {
      audio.play();
      if (script === "introduction") {
        setAnimation("Idle");
      } else {
        setAnimation("Angry");
      }
    } else {
      setAnimation("Idle");
      audio.pause();
    }
  }, [audio, playAudio, script]);

  const { nodes, materials } = useGLTF(
    "/models/65c41941bee65ecd7a20fc68_arkit_oculus_visemes.glb"
  ) as GLTFResult;

  const { animations } = useGLTF("/animations/animations.glb");

  const [animation, setAnimation] = useState("Idle");

  const group = useRef<THREE.Group>(null!);

  const { actions, mixer, names } = useAnimations(animations, group);

  // console.log(names);

  // Change animation when the index changes
  useEffect(() => {
    // Reset and fade in animation after an index has been changed
    actions[animation]?.reset().fadeIn(0.5).play();
    // In the clean-up phase, fade it out
    return () => {
      actions[animation]?.fadeOut(0.5);
    };
  }, [actions, names, animation]);

  // CODE ADDED AFTER THE TUTORIAL (but learnt in the portfolio tutorial ♥️)
  useFrame((state) => {
    if (headFollow) {
      group?.current?.getObjectByName("Head")?.lookAt(state.camera.position);
    }
  });

  return (
    <group
      {...props}
      dispose={null}
      ref={group}
      // onClick={() => setIndex(index + 1)}
    >
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
    </group>
  );
}

useGLTF.preload("/models/65c41941bee65ecd7a20fc68_arkit_oculus_visemes.glb");
useGLTF.preload("/animations/animations.glb");
