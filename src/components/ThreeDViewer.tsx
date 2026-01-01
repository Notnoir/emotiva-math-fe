/**
 * 3D Visualization Viewer Component
 * CRITICAL: Renders DECLARATIVE JSON only (NO eval, NO arbitrary code execution)
 *
 * Supports:
 * - Box (Kubus, Balok)
 * - Sphere (Bola)
 * - Cylinder (Tabung)
 * - Cone (Kerucut, Limas)
 */
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  PerspectiveCamera,
  Grid,
  ContactShadows,
} from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

interface VisualizationObject {
  id: string;
  type: "box" | "sphere" | "cylinder" | "cone";
  color: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  wireframe?: boolean;
  label?: string;
  opacity?: number;
}

interface VisualizationAnnotation {
  text: string;
  position: [number, number, number];
  color: string;
}

interface VisualizationData {
  type: "visualization";
  title: string;
  description: string;
  objects: VisualizationObject[];
  camera?: {
    position: [number, number, number];
    lookAt: [number, number, number];
  };
  annotations?: VisualizationAnnotation[];
  animation?: {
    rotate: boolean;
    speed: number;
  };
}

interface ThreeDViewerProps {
  data: VisualizationData;
}

function Shape({ obj, rotate }: { obj: VisualizationObject; rotate: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Auto-rotation disabled - user can rotate manually with mouse
  // useEffect(() => {
  //   if (meshRef.current && rotate) {
  //     const animate = () => {
  //       if (meshRef.current) {
  //         meshRef.current.rotation.y += 0.01;
  //       }
  //       requestAnimationFrame(animate);
  //     };
  //     animate();
  //   }
  // }, [rotate]);

  const getGeometry = () => {
    switch (obj.type) {
      case "box":
        return <boxGeometry args={obj.scale} />;
      case "sphere":
        return <sphereGeometry args={[obj.scale[0], 64, 64]} />;
      case "cylinder":
        return (
          <cylinderGeometry
            args={[obj.scale[0], obj.scale[0], obj.scale[1], 64]}
          />
        );
      case "cone":
        return <coneGeometry args={[obj.scale[0], obj.scale[1], 64]} />;
      default:
        return <boxGeometry args={obj.scale} />;
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={obj.position}
        rotation={
          obj.rotation.map((r) => (r * Math.PI) / 180) as [
            number,
            number,
            number
          ]
        }
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.05 : 1}
      >
        {getGeometry()}
        <meshPhysicalMaterial
          color={obj.color}
          wireframe={obj.wireframe || false}
          transparent={true}
          opacity={obj.opacity || 1}
          metalness={0.3}
          roughness={0.4}
          clearcoat={1}
          clearcoatRoughness={0.3}
          reflectivity={0.5}
        />
      </mesh>

      {/* Edge outline for better definition */}
      {!obj.wireframe && (
        <mesh
          position={obj.position}
          rotation={
            obj.rotation.map((r) => (r * Math.PI) / 180) as [
              number,
              number,
              number
            ]
          }
        >
          {getGeometry()}
          <meshBasicMaterial
            color="#000000"
            wireframe={true}
            transparent={true}
            opacity={0.1}
          />
        </mesh>
      )}

      {obj.label && (
        <Text
          position={[
            obj.position[0],
            obj.position[1] + obj.scale[1] + 0.8,
            obj.position[2],
          ]}
          fontSize={0.5}
          color="#1e293b"
          anchorX="center"
          anchorY="middle"
        >
          {obj.label}
        </Text>
      )}
    </group>
  );
}

function Scene({ data }: { data: VisualizationData }) {
  const rotate = data.animation?.rotate || false;

  return (
    <>
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.6} />

      {/* Key light - main directional light with shadows */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill light - softer light from opposite side */}
      <directionalLight
        position={[-8, 10, -8]}
        intensity={0.5}
        color="#e0f2fe"
      />

      {/* Rim light - highlights edges */}
      <pointLight position={[0, 5, -10]} intensity={0.8} color="#fef3c7" />

      {/* Bottom light for subtle fill */}
      <pointLight position={[0, -5, 0]} intensity={0.3} color="#e0e7ff" />

      {/* Camera */}
      {data.camera && (
        <PerspectiveCamera
          makeDefault
          position={data.camera.position}
          fov={50}
        />
      )}

      {/* Objects */}
      {data.objects.map((obj) => (
        <Shape key={obj.id} obj={obj} rotate={rotate} />
      ))}

      {/* Annotations */}
      {data.annotations?.map((annotation, idx) => (
        <Text
          key={`annotation-${idx}`}
          position={annotation.position}
          fontSize={0.35}
          color={annotation.color}
          anchorX="left"
          anchorY="middle"
        >
          {annotation.text}
        </Text>
      ))}

      {/* Modern Grid - Disabled for cleaner view */}
      {/* <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#94a3b8"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#475569"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
      /> */}

      {/* Contact Shadows for grounded feel */}
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.5}
        scale={20}
        blur={2}
        far={4}
      />

      {/* Axes Helper for orientation */}
      <axesHelper args={[3]} />

      {/* Enhanced Orbit Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={25}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={false}
        autoRotateSpeed={0.5}
        dampingFactor={0.05}
        enableDamping={true}
      />
    </>
  );
}

export default function ThreeDViewer({ data }: ThreeDViewerProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden shadow-2xl border border-slate-700">
      <div className="w-full h-[600px] relative">
        <Canvas
          shadows
          camera={{ position: [8, 8, 8], fov: 50 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
          }}
        >
          <Scene data={data} />
        </Canvas>

        {/* Control hints overlay */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs px-4 py-3 rounded-lg space-y-1">
          <div className="flex items-center gap-2 font-bold text-indigo-300 mb-2">
            <span>🎮</span> Kontrol 3D
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5">🖱️</span> Drag kiri: Putar objek
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5">🖱️</span> Drag kanan: Geser view
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5">📜</span> Scroll: Zoom in/out
          </div>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 border-t border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time 3D</span>
          </div>
          <div className="w-px h-4 bg-slate-600"></div>
          <span className="text-slate-400">WebGL Renderer</span>
        </div>
        <div className="text-xs text-slate-500">
          Powered by Three.js + React Three Fiber
        </div>
      </div>
    </div>
  );
}
