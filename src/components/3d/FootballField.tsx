import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Plane } from "@react-three/drei";
import * as THREE from "three";

const FootballField: React.FC = () => {
  const fieldRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    // Animation can be added here if needed
  });

  return (
    <group>
      {/* Main Field */}
      <Plane
        ref={fieldRef}
        args={[100, 50]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
      >
        <meshStandardMaterial color="#2d5016" roughness={0.8} metalness={0.1} />
      </Plane>

      {/* Grass Texture Layer */}
      <Plane
        args={[100, 50]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#3a5f23"
          roughness={0.9}
          metalness={0.05}
          transparent
          opacity={0.7}
        />
      </Plane>

      {/* Field Markings */}
      <group>
        {/* Center Line */}
        <Plane
          args={[0.5, 50]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
        >
          <meshStandardMaterial color="white" />
        </Plane>

        {/* 50 Yard Line */}
        <Plane
          args={[0.3, 50]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
        >
          <meshStandardMaterial color="white" />
        </Plane>

        {/* Hash Marks */}
        {Array.from({ length: 20 }, (_, i) => (
          <Plane
            key={i}
            args={[0.2, 2]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, -40 + i * 4]}
          >
            <meshStandardMaterial color="white" />
          </Plane>
        ))}

        {/* End Zones */}
        <Plane
          args={[10, 50]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-45, 0.01, 0]}
        >
          <meshStandardMaterial color="#1e3a8a" />
        </Plane>
        <Plane
          args={[10, 50]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[45, 0.01, 0]}
        >
          <meshStandardMaterial color="#1e3a8a" />
        </Plane>
      </group>
    </group>
  );
};

export default FootballField;
