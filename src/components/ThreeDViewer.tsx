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
  Edges,
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
  visualHint?: string;
  activeLabel?: string;
  explodeEffect?: boolean;
}

function Shape({
  obj,
  rotate,
  visualHint,
  explodeOffset,
}: {
  obj: VisualizationObject;
  rotate: boolean;
  visualHint?: string;
  explodeOffset: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Determine if this shape should be highlighted
  const isHighlighted =
    visualHint === "highlight_sisi" || visualHint === "highlight";

  // Calculate explode position offset
  const explodedPosition: [number, number, number] = [
    obj.position[0] * (1 + explodeOffset),
    obj.position[1] * (1 + explodeOffset),
    obj.position[2] * (1 + explodeOffset),
  ];

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
        position={explodeOffset > 0 ? explodedPosition : obj.position}
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
        {/* Tampilkan solid hanya saat highlight, biasanya wireframe */}
        {isHighlighted ? (
          <meshPhysicalMaterial
            color="#fbbf24"
            transparent={true}
            opacity={0.7}
            metalness={0.3}
            roughness={0.4}
            emissive="#f59e0b"
            emissiveIntensity={0.5}
          />
        ) : (
          <meshBasicMaterial
            color={obj.color}
            transparent={true}
            opacity={0.1}
          />
        )}
        {/* Edges (rusuk) - selalu tampil */}
        <Edges
          scale={1.001}
          color={isHighlighted ? "#f59e0b" : obj.color}
          linewidth={2}
        />
      </mesh>

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

// Helper function to parse formula and extract dimension labels
function parseFormulaLabels(
  formula: string,
  shapeType: string,
  objectScale: [number, number, number],
  objectPosition: [number, number, number]
): Array<{ text: string; position: [number, number, number]; color: string }> {
  const labels: Array<{
    text: string;
    position: [number, number, number];
    color: string;
  }> = [];

  // Common dimension mappings
  const dimensionMap: Record<
    string,
    {
      pattern: RegExp;
      getPosition: (
        scale: [number, number, number],
        pos: [number, number, number]
      ) => [number, number, number];
      label: string;
    }
  > = {
    // Tinggi (height) - vertical
    t: {
      pattern: /\bt\b/gi,
      getPosition: (scale, pos) => [
        pos[0] + scale[0] / 2 + 1.5,
        pos[1] + scale[1] / 2,
        pos[2],
      ],
      label: "t",
    },
    tinggi: {
      pattern: /tinggi/gi,
      getPosition: (scale, pos) => [
        pos[0] + scale[0] / 2 + 1.5,
        pos[1] + scale[1] / 2,
        pos[2],
      ],
      label: "tinggi",
    },

    // Lebar (width)
    l: {
      pattern: /\bl\b/gi,
      getPosition: (scale, pos) => [
        pos[0],
        pos[1] - scale[1] / 2 - 1.5,
        pos[2],
      ],
      label: "l",
    },
    lebar: {
      pattern: /lebar/gi,
      getPosition: (scale, pos) => [
        pos[0],
        pos[1] - scale[1] / 2 - 1.5,
        pos[2],
      ],
      label: "lebar",
    },

    // Panjang (length)
    p: {
      pattern: /\bp\b/gi,
      getPosition: (scale, pos) => [
        pos[0] + scale[0] / 2,
        pos[1] - scale[1] / 2 - 1.5,
        pos[2] + scale[2] / 2 + 1,
      ],
      label: "p",
    },
    panjang: {
      pattern: /panjang/gi,
      getPosition: (scale, pos) => [
        pos[0] + scale[0] / 2,
        pos[1] - scale[1] / 2 - 1.5,
        pos[2] + scale[2] / 2 + 1,
      ],
      label: "panjang",
    },

    // Sisi (side - for cube)
    s: {
      pattern: /\bs\b/gi,
      getPosition: (scale, pos) => [
        pos[0] + scale[0] / 2 + 1.2,
        pos[1] - scale[1] / 2 - 1.2,
        pos[2] + scale[2] / 2,
      ],
      label: "s",
    },
    sisi: {
      pattern: /sisi/gi,
      getPosition: (scale, pos) => [
        pos[0] + scale[0] / 2 + 1.2,
        pos[1] - scale[1] / 2 - 1.2,
        pos[2] + scale[2] / 2,
      ],
      label: "sisi",
    },

    // Jari-jari (radius)
    r: {
      pattern: /\br\b/gi,
      getPosition: (scale, pos) => [pos[0] + scale[0] + 1.5, pos[1], pos[2]],
      label: "r",
    },
    "jari-jari": {
      pattern: /jari-jari/gi,
      getPosition: (scale, pos) => [pos[0] + scale[0] + 1.5, pos[1], pos[2]],
      label: "jari-jari",
    },

    // Diameter
    d: {
      pattern: /\bd\b/gi,
      getPosition: (scale, pos) => [pos[0] + scale[0] + 2, pos[1], pos[2]],
      label: "d",
    },
    diameter: {
      pattern: /diameter/gi,
      getPosition: (scale, pos) => [pos[0] + scale[0] + 2, pos[1], pos[2]],
      label: "diameter",
    },
  };

  // Check which dimensions are in the formula
  Object.entries(dimensionMap).forEach(([key, config]) => {
    if (config.pattern.test(formula)) {
      const position = config.getPosition(objectScale, objectPosition);
      labels.push({
        text: config.label,
        position,
        color: "#fbbf24", // amber color
      });
    }
  });

  return labels;
}

function Scene({
  data,
  visualHint,
  activeLabel,
  explodeEffect,
}: {
  data: VisualizationData;
  visualHint?: string;
  activeLabel?: string;
  explodeEffect?: boolean;
}) {
  const rotate = data.animation?.rotate || false;
  const explodeOffset = explodeEffect ? 0.3 : 0;

  // Parse formula labels when show_formula hint is active
  const formulaLabels =
    visualHint === "show_formula" && activeLabel
      ? parseFormulaLabels(
          activeLabel,
          data.objects[0]?.type || "box",
          data.objects[0]?.scale || [2, 2, 2],
          data.objects[0]?.position || [0, 0, 0]
        )
      : [];

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
        <Shape
          key={obj.id}
          obj={obj}
          rotate={rotate}
          visualHint={visualHint}
          explodeOffset={explodeOffset}
        />
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

      {/* Smart Formula Labels - positioned based on dimensions */}
      {formulaLabels.length > 0 ? (
        <>
          {/* Main formula at top */}
          <Text
            position={[0, 4, 0]}
            color="#fbbf24"
            fontSize={0.8}
            maxWidth={10}
            lineHeight={1}
            letterSpacing={0.02}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {activeLabel}
          </Text>

          {/* Individual dimension labels at their positions */}
          {formulaLabels.map((label, idx) => (
            <group key={`formula-label-${idx}`}>
              {/* Label text */}
              <Text
                position={label.position}
                color={label.color}
                fontSize={0.6}
                fontWeight="bold"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#000000"
              >
                {label.text}
              </Text>

              {/* Subtle glow effect */}
              <pointLight
                position={label.position}
                color="#fbbf24"
                intensity={0.3}
                distance={1.5}
              />
            </group>
          ))}
        </>
      ) : (
        /* Fallback: Dynamic active label from step-by-step */
        activeLabel && (
          <Text
            position={[0, 4, 0]}
            color="#fbbf24"
            fontSize={0.8}
            maxWidth={10}
            lineHeight={1}
            letterSpacing={0.02}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {activeLabel}
          </Text>
        )
      )}

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

export default function ThreeDViewer({
  data,
  visualHint,
  activeLabel,
  explodeEffect,
}: ThreeDViewerProps) {
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
          <Scene
            data={data}
            visualHint={visualHint}
            activeLabel={activeLabel}
            explodeEffect={explodeEffect}
          />
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
