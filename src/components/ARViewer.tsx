/**
 * AR Viewer Component
 * Augmented Reality visualization using Model Viewer
 * Allows students to view 3D shapes in their real environment
 */
import { useEffect, useRef, useState } from "react";
import "@google/model-viewer";
import "../types/model-viewer.d.ts";

interface ARViewerProps {
  shapeType:
    | "kubus"
    | "balok"
    | "bola"
    | "tabung"
    | "kerucut"
    | "limas"
    | "prisma";
  color?: string;
  scale?: [number, number, number];
  onClose: () => void;
}

export default function ARViewer({ shapeType, onClose }: ARViewerProps) {
  const modelViewerRef = useRef<any>(null);
  const [isARSupported, setIsARSupported] = useState(true);
  const [modelUrl, setModelUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate model URL based on shape type
    const generateInlineModel = () => {
      const modelMap: Record<string, string> = {
        kubus:
          "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb",
        balok:
          "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb",
        bola: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        tabung:
          "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Cylinder/glTF-Binary/Cylinder.glb",
        kerucut: "https://modelviewer.dev/shared-assets/models/cone.glb",
        limas: "https://modelviewer.dev/shared-assets/models/cone.glb",
        prisma:
          "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb",
      };

      return modelMap[shapeType] || modelMap.kubus;
    };

    setModelUrl(generateInlineModel());

    // Set loading false after a short delay to ensure model-viewer is initialized
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [shapeType]);

  useEffect(() => {
    // Check AR support
    const checkARSupport = async () => {
      if (modelViewerRef.current) {
        const supported = await modelViewerRef.current.canActivateAR;
        setIsARSupported(supported);
      }
    };

    const timer = setTimeout(() => {
      checkARSupport();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getShapeName = () => {
    const names: Record<string, string> = {
      kubus: "Kubus",
      balok: "Balok",
      bola: "Bola",
      tabung: "Tabung",
      kerucut: "Kerucut",
      limas: "Limas",
      prisma: "Prisma",
    };
    return names[shapeType] || "Bangun Ruang";
  };

  const handleARActivation = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.activateAR();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">
                view_in_ar
              </span>
              AR Mode - {getShapeName()}
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              {isARSupported
                ? "Ketuk tombol AR untuk melihat di dunia nyata"
                : "AR tidak didukung di perangkat ini"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-white text-2xl">
              close
            </span>
          </button>
        </div>
      </div>

      {/* Model Viewer */}
      <div className="w-full h-full flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4">Memuat model 3D...</p>
          </div>
        ) : (
          // @ts-expect-error model-viewer is a custom element
          <model-viewer
            ref={modelViewerRef}
            src={modelUrl}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            touch-action="pan-y"
            auto-rotate
            auto-rotate-delay="1000"
            rotation-per-second="30deg"
            shadow-intensity="1"
            shadow-softness="0.8"
            exposure="1"
            camera-orbit="45deg 75deg 2.5m"
            min-camera-orbit="auto auto 1m"
            max-camera-orbit="auto auto 10m"
            style={{
              width: "100%",
              height: "100%",
              background: "transparent",
            }}
            alt={`Model 3D ${getShapeName()}`}
          >
            {/* AR Button Slot */}
            <button
              slot="ar-button"
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 
                       bg-gradient-to-r from-green-500 to-emerald-600 
                       text-white px-10 py-5 rounded-full font-bold text-xl
                       shadow-2xl hover:shadow-emerald-500/50 transition-all
                       flex items-center gap-4 hover:scale-110 hover:from-green-600 hover:to-emerald-700
                       border-2 border-white/20 backdrop-blur-sm
                       animate-pulse"
              onClick={handleARActivation}
            >
              <span className="material-symbols-outlined text-4xl animate-bounce">
                view_in_ar
              </span>
              <span className="text-2xl">Lihat dalam AR</span>
            </button>

            {/* Loading Indicator */}
            <div slot="progress-bar" className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="text-white mt-2 text-sm">Loading 3D Model...</p>
            </div>
            {/* @ts-expect-error closing model-viewer tag */}
          </model-viewer>
        )}
      </div>

      {/* Instructions Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>
              Cara Menggunakan AR Mode
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-200">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-green-400">
                  phone_iphone
                </span>
                <div>
                  <p className="font-medium text-white">1. Buka di Mobile</p>
                  <p className="text-xs">
                    Scan QR atau buka link di smartphone
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-green-400">
                  photo_camera
                </span>
                <div>
                  <p className="font-medium text-white">2. Izinkan Kamera</p>
                  <p className="text-xs">Berikan akses kamera untuk AR</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-green-400">
                  touch_app
                </span>
                <div>
                  <p className="font-medium text-white">3. Tempatkan Model</p>
                  <p className="text-xs">Arahkan ke permukaan datar & tap</p>
                </div>
              </div>
            </div>
          </div>

          {!isARSupported && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
              <p className="text-yellow-200 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                <span>
                  AR tidak tersedia di browser desktop. Gunakan smartphone iOS
                  (Safari) atau Android (Chrome) untuk pengalaman AR penuh.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Gesture Hints */}
      <div className="absolute top-20 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-xs max-w-xs z-10">
        <p className="font-semibold mb-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">touch_app</span>
          Kontrol 3D
        </p>
        <ul className="space-y-1 text-gray-300">
          <li>
            • <strong>Rotate:</strong> Drag dengan 1 jari
          </li>
          <li>
            • <strong>Zoom:</strong> Pinch dengan 2 jari
          </li>
          <li>
            • <strong>Pan:</strong> Drag dengan 2 jari
          </li>
        </ul>
      </div>
    </div>
  );
}
