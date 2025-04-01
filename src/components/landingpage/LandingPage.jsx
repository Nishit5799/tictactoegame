"use client";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import { TextureLoader } from "three";
import { DoubleSide } from "three";

import TictactoeText from "./TictactoeText";
import Link from "next/link";

const RotatingSphere = () => {
  const texture = useLoader(TextureLoader, "/mainbg.jpg");
  const sphereRef = useRef();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const setArgs = isSmallScreen ? [700, 1000, 1000] : [950, 1500, 1500];

  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.0009;
    }
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={setArgs} />
      <meshStandardMaterial map={texture} side={DoubleSide} />
    </mesh>
  );
};

const LandingPage = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fov = isSmallScreen ? 132 : 100;

  return (
    <div className="w-full h-screen bg-black text-white relative">
      <Canvas camera={{ position: [-0.3, 0.5, 5], fov: fov }}>
        <directionalLight position={[0, 5, 5]} intensity={4} color={"white"} />
        <ambientLight intensity={0.5} />

        <RotatingSphere />
        <TictactoeText animate={false} />
      </Canvas>

      <div className="absolute left-1/2 transform -translate-x-1/2 top-[60%] sm:w-[20%] rounded-full sm:h-[5%] w-[65%] h-[5%]">
        <Link href="/enterwallet/maingame">
          <button className="sm:w-[70%] w-full  h-full bg-gradient-to-r font-choco from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-black font-bold text-xl sm:text-2xl rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl active:scale-95">
            PLAY
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
