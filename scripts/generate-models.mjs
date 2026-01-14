/**
 * GLB Model Generator
 * Generate 3D geometry models in GLB format for AR viewer
 * Run: npm run generate-models
 */
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, "../public/models");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Create materials
const materials = {
  default: new THREE.MeshStandardMaterial({
    color: 0x10b981,
    metalness: 0.3,
    roughness: 0.4,
  }),
};

// Create geometries
const geometries = {
  cube: () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const mesh = new THREE.Mesh(geometry, materials.default);
    mesh.name = "Kubus";
    return mesh;
  },

  box: () => {
    const geometry = new THREE.BoxGeometry(1.5, 1, 0.8);
    const mesh = new THREE.Mesh(geometry, materials.default);
    mesh.name = "Balok";
    return mesh;
  },

  sphere: () => {
    const geometry = new THREE.SphereGeometry(0.6, 64, 64);
    const mesh = new THREE.Mesh(geometry, materials.default);
    mesh.name = "Bola";
    return mesh;
  },

  cylinder: () => {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 64);
    const mesh = new THREE.Mesh(geometry, materials.default);
    mesh.name = "Tabung";
    return mesh;
  },

  cone: () => {
    const geometry = new THREE.ConeGeometry(0.6, 1.5, 64);
    const mesh = new THREE.Mesh(geometry, materials.default);
    mesh.name = "Kerucut";
    return mesh;
  },

  pyramid: () => {
    const geometry = new THREE.ConeGeometry(0.7, 1.4, 4);
    const mesh = new THREE.Mesh(geometry, materials.default);
    mesh.name = "Limas";
    return mesh;
  },

  prism: () => {
    // Create triangular prism
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.6);
    shape.lineTo(-0.6, -0.6);
    shape.lineTo(0.6, -0.6);
    shape.lineTo(0, 0.6);

    const extrudeSettings = {
      steps: 1,
      depth: 1.2,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(geometry, materials.default);
    mesh.rotation.x = Math.PI / 2;
    mesh.name = "Prisma";
    return mesh;
  },
};

// Export function
function exportGLB(mesh, filename) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();

    // Create scene with lighting for better AR appearance
    const scene = new THREE.Scene();
    scene.add(mesh);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    exporter.parse(
      scene,
      (gltf) => {
        const outputPath = path.join(OUTPUT_DIR, filename);
        const buffer = Buffer.from(gltf);

        fs.writeFileSync(outputPath, buffer);
        console.log(
          `✅ Generated: ${filename} (${(buffer.length / 1024).toFixed(2)} KB)`
        );
        resolve();
      },
      (error) => {
        console.error(`❌ Error generating ${filename}:`, error);
        reject(error);
      },
      { binary: true }
    );
  });
}

// Generate all models
async function generateAllModels() {
  console.log("🚀 Starting GLB model generation...\n");

  const models = [
    { name: "cube", filename: "cube.glb" },
    { name: "box", filename: "box.glb" },
    { name: "sphere", filename: "sphere.glb" },
    { name: "cylinder", filename: "cylinder.glb" },
    { name: "cone", filename: "cone.glb" },
    { name: "pyramid", filename: "pyramid.glb" },
    { name: "prism", filename: "prism.glb" },
  ];

  try {
    for (const model of models) {
      const mesh = geometries[model.name]();
      await exportGLB(mesh, model.filename);
    }

    console.log("\n✨ All models generated successfully!");
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error("\n❌ Error during model generation:", error);
    process.exit(1);
  }
}

// Run generator
generateAllModels();
