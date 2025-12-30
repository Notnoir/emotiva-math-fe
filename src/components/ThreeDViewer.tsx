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
import { OrbitControls, Text, PerspectiveCamera } from "@react-three/drei";
import { useRef, useEffect } from "react";
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

  useEffect(() => {
    if (meshRef.current && rotate) {
      const animate = () => {
        if (meshRef.current) {
          meshRef.current.rotation.y += 0.01;
        }
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, [rotate]);

  const getGeometry = () => {
    switch (obj.type) {
      case "box":
        return <boxGeometry args={obj.scale} />;
      case "sphere":
        return <sphereGeometry args={[obj.scale[0], 32, 32]} />;
      case "cylinder":
        return (
          <cylinderGeometry
            args={[obj.scale[0], obj.scale[0], obj.scale[1], 32]}
          />
        );
      case "cone":
        return <coneGeometry args={[obj.scale[0], obj.scale[1], 32]} />;
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
      >
        {getGeometry()}
        <meshStandardMaterial
          color={obj.color}
          wireframe={obj.wireframe || false}
          transparent={true}
          opacity={obj.opacity || 1}
        />
      </mesh>

      {obj.label && (
        <Text
          position={[
            obj.position[0],
            obj.position[1] + obj.scale[1] + 0.5,
            obj.position[2],
          ]}
          fontSize={0.4}
          color="black"
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
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

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
          fontSize={0.3}
          color={annotation.color}
          anchorX="left"
          anchorY="middle"
        >
          {annotation.text}
        </Text>
      ))}

      {/* Grid Helper */}
      <gridHelper args={[10, 10]} />

      {/* Orbit Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
      />
    </>
  );
}

export default function ThreeDViewer({ data }: ThreeDViewerProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-inner">
      <div className="p-4 bg-white border-b">
        <h3 className="text-2xl font-bold text-gray-800">{data.title}</h3>
        <p className="text-sm text-gray-600">{data.description}</p>
      </div>

      <div className="w-full h-[500px]">
        <Canvas shadows>
          <Scene data={data} />
        </Canvas>
      </div>

      <div className="p-3 bg-white border-t text-xs text-gray-500 text-center">
        💡 Drag untuk rotasi | Scroll untuk zoom | Klik kanan untuk geser
      </div>
    </div>
  );
}
