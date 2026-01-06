/**
 * 2D Net (Jaring-jaring) Viewer Component
 * Menampilkan jaring-jaring bangun ruang dalam format 2D
 */
import { useRef, useEffect, useState } from "react";

interface NetViewerProps {
  shape: "kubus" | "balok" | "tabung" | "kerucut" | "limas" | "prisma";
  size?: number;
  showLabels?: boolean;
  interactive?: boolean;
}

export default function NetViewer({
  shape,
  size = 400,
  showLabels = true,
  interactive = true,
}: NetViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredFace, setHoveredFace] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Apply scale for zoom
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    // Draw based on shape
    switch (shape) {
      case "kubus":
        drawKubusNet(ctx, canvas.width, canvas.height, hoveredFace);
        break;
      case "balok":
        drawBalokNet(ctx, canvas.width, canvas.height, hoveredFace);
        break;
      case "tabung":
        drawTabungNet(ctx, canvas.width, canvas.height, hoveredFace);
        break;
      case "kerucut":
        drawKerucutNet(ctx, canvas.width, canvas.height, hoveredFace);
        break;
      case "limas":
        drawLimasNet(ctx, canvas.width, canvas.height, hoveredFace);
        break;
      case "prisma":
        drawPrismaNet(ctx, canvas.width, canvas.height, hoveredFace);
        break;
    }

    ctx.restore();
  }, [shape, hoveredFace, scale]);

  const drawKubusNet = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    hovered: string | null
  ) => {
    const sideSize = 80;
    const startX = width / 2 - sideSize * 1.5;
    const startY = height / 2 - sideSize * 2;

    // Define 6 faces in cross pattern
    const faces = [
      { x: startX + sideSize, y: startY, label: "Atas" },
      { x: startX, y: startY + sideSize, label: "Kiri" },
      { x: startX + sideSize, y: startY + sideSize, label: "Depan" },
      { x: startX + sideSize * 2, y: startY + sideSize, label: "Kanan" },
      { x: startX + sideSize * 3, y: startY + sideSize, label: "Belakang" },
      { x: startX + sideSize, y: startY + sideSize * 2, label: "Bawah" },
    ];

    faces.forEach((face) => {
      const isHovered = hovered === face.label;

      // Draw square
      ctx.fillStyle = isHovered ? "#8b5cf6" : "#60a5fa";
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;

      ctx.fillRect(face.x, face.y, sideSize, sideSize);
      ctx.strokeRect(face.x, face.y, sideSize, sideSize);

      // Draw label
      if (showLabels) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(face.label, face.x + sideSize / 2, face.y + sideSize / 2);
      }

      // Draw diagonal for depth indication
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(face.x, face.y);
      ctx.lineTo(face.x + sideSize, face.y + sideSize);
      ctx.moveTo(face.x + sideSize, face.y);
      ctx.lineTo(face.x, face.y + sideSize);
      ctx.stroke();
    });

    // Draw fold lines (dashed)
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;

    // Vertical folds
    ctx.beginPath();
    ctx.moveTo(startX + sideSize, startY);
    ctx.lineTo(startX + sideSize, startY + sideSize * 3);
    ctx.moveTo(startX + sideSize * 2, startY + sideSize);
    ctx.lineTo(startX + sideSize * 2, startY + sideSize * 2);
    ctx.stroke();

    // Horizontal folds
    ctx.beginPath();
    ctx.moveTo(startX, startY + sideSize);
    ctx.lineTo(startX + sideSize * 4, startY + sideSize);
    ctx.moveTo(startX + sideSize, startY + sideSize * 2);
    ctx.lineTo(startX + sideSize * 2, startY + sideSize * 2);
    ctx.stroke();

    ctx.setLineDash([]);
  };

  const drawBalokNet = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    hovered: string | null
  ) => {
    const w = 100;
    const h = 60;
    const d = 70;
    const startX = width / 2 - w - d / 2;
    const startY = height / 2 - h - d;

    const faces = [
      { x: startX + d, y: startY, w: w, h: d, label: "Atas" },
      { x: startX, y: startY + d, w: d, h: h, label: "Kiri" },
      { x: startX + d, y: startY + d, w: w, h: h, label: "Depan" },
      { x: startX + d + w, y: startY + d, w: d, h: h, label: "Kanan" },
      {
        x: startX + d + w + d,
        y: startY + d,
        w: w,
        h: h,
        label: "Belakang",
      },
      { x: startX + d, y: startY + d + h, w: w, h: d, label: "Bawah" },
    ];

    faces.forEach((face) => {
      const isHovered = hovered === face.label;

      ctx.fillStyle = isHovered ? "#8b5cf6" : "#34d399";
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;

      ctx.fillRect(face.x, face.y, face.w, face.h);
      ctx.strokeRect(face.x, face.y, face.w, face.h);

      if (showLabels) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(face.label, face.x + face.w / 2, face.y + face.h / 2);
      }
    });

    // Fold lines
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX + d, startY);
    ctx.lineTo(startX + d, startY + d + h + d);
    ctx.moveTo(startX + d + w, startY + d);
    ctx.lineTo(startX + d + w, startY + d + h);
    ctx.moveTo(startX, startY + d);
    ctx.lineTo(startX + d + w + d + w, startY + d);
    ctx.moveTo(startX + d, startY + d + h);
    ctx.lineTo(startX + d + w, startY + d + h);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawTabungNet = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    hovered: string | null
  ) => {
    const radius = 60;
    const rectHeight = 150;
    const rectWidth = 2 * Math.PI * radius;
    const startX = width / 2 - rectWidth / 2;
    const startY = height / 2 - rectHeight / 2 - radius;

    // Top circle
    ctx.fillStyle = hovered === "Atas" ? "#8b5cf6" : "#fbbf24";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2, startY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (showLabels) {
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Tutup", width / 2, startY);
    }

    // Rectangle (selimut)
    const rectY = startY + radius + 10;
    ctx.fillStyle = hovered === "Selimut" ? "#8b5cf6" : "#fb923c";
    ctx.fillRect(startX, rectY, rectWidth, rectHeight);
    ctx.strokeRect(startX, rectY, rectWidth, rectHeight);

    if (showLabels) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("Selimut Tabung", width / 2, rectY + rectHeight / 2);
    }

    // Bottom circle
    ctx.fillStyle = hovered === "Bawah" ? "#8b5cf6" : "#fbbf24";
    const bottomY = rectY + rectHeight + radius + 10;
    ctx.beginPath();
    ctx.arc(width / 2, bottomY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (showLabels) {
      ctx.fillStyle = "#1e293b";
      ctx.fillText("Alas", width / 2, bottomY);
    }

    // Fold lines
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, rectY);
    ctx.lineTo(startX + rectWidth, rectY);
    ctx.moveTo(startX, rectY + rectHeight);
    ctx.lineTo(startX + rectWidth, rectY + rectHeight);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawKerucutNet = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    hovered: string | null
  ) => {
    const baseRadius = 70;
    const slantHeight = 180;
    const sectorAngle = (2 * Math.PI * baseRadius) / slantHeight;

    const centerX = width / 2;
    const centerY = height / 2 - 50;

    // Draw sector (selimut kerucut)
    ctx.fillStyle = hovered === "Selimut" ? "#8b5cf6" : "#f472b6";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY - slantHeight);
    ctx.arc(
      centerX,
      centerY - slantHeight,
      slantHeight,
      Math.PI / 2 - sectorAngle / 2,
      Math.PI / 2 + sectorAngle / 2
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (showLabels) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Selimut", centerX, centerY - slantHeight / 2);
    }

    // Draw base circle
    ctx.fillStyle = hovered === "Alas" ? "#8b5cf6" : "#fbbf24";
    const baseY = centerY + 60;
    ctx.beginPath();
    ctx.arc(centerX, baseY, baseRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (showLabels) {
      ctx.fillStyle = "#1e293b";
      ctx.fillText("Alas", centerX, baseY);
    }

    // Arrow showing connection
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, baseY - baseRadius - 5);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawLimasNet = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    hovered: string | null
  ) => {
    const baseSize = 120;
    const triangleHeight = 100;
    const centerX = width / 2;
    const centerY = height / 2;

    // Base square
    ctx.fillStyle = hovered === "Alas" ? "#8b5cf6" : "#a78bfa";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.fillRect(
      centerX - baseSize / 2,
      centerY - baseSize / 2,
      baseSize,
      baseSize
    );
    ctx.strokeRect(
      centerX - baseSize / 2,
      centerY - baseSize / 2,
      baseSize,
      baseSize
    );

    if (showLabels) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Alas", centerX, centerY);
    }

    // Four triangular faces
    const triangles = [
      {
        label: "Depan",
        points: [
          [centerX - baseSize / 2, centerY + baseSize / 2],
          [centerX + baseSize / 2, centerY + baseSize / 2],
          [centerX, centerY + baseSize / 2 + triangleHeight],
        ],
      },
      {
        label: "Kanan",
        points: [
          [centerX + baseSize / 2, centerY - baseSize / 2],
          [centerX + baseSize / 2, centerY + baseSize / 2],
          [centerX + baseSize / 2 + triangleHeight, centerY],
        ],
      },
      {
        label: "Belakang",
        points: [
          [centerX - baseSize / 2, centerY - baseSize / 2],
          [centerX + baseSize / 2, centerY - baseSize / 2],
          [centerX, centerY - baseSize / 2 - triangleHeight],
        ],
      },
      {
        label: "Kiri",
        points: [
          [centerX - baseSize / 2, centerY - baseSize / 2],
          [centerX - baseSize / 2, centerY + baseSize / 2],
          [centerX - baseSize / 2 - triangleHeight, centerY],
        ],
      },
    ];

    triangles.forEach((triangle) => {
      const isHovered = hovered === triangle.label;
      ctx.fillStyle = isHovered ? "#8b5cf6" : "#c084fc";

      ctx.beginPath();
      ctx.moveTo(triangle.points[0][0], triangle.points[0][1]);
      ctx.lineTo(triangle.points[1][0], triangle.points[1][1]);
      ctx.lineTo(triangle.points[2][0], triangle.points[2][1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (showLabels) {
        const centroidX =
          (triangle.points[0][0] +
            triangle.points[1][0] +
            triangle.points[2][0]) /
          3;
        const centroidY =
          (triangle.points[0][1] +
            triangle.points[1][1] +
            triangle.points[2][1]) /
          3;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText(triangle.label, centroidX, centroidY);
      }
    });

    // Fold lines
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      centerX - baseSize / 2,
      centerY - baseSize / 2,
      baseSize,
      baseSize
    );
    ctx.setLineDash([]);
  };

  const drawPrismaNet = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    hovered: string | null
  ) => {
    const baseSize = 80;
    const prismHeight = 140;
    const centerX = width / 2;
    const startY = height / 2 - 80;

    // Top triangle
    const topTriangle = [
      [centerX, startY],
      [centerX - baseSize / 2, startY + baseSize * 0.866],
      [centerX + baseSize / 2, startY + baseSize * 0.866],
    ];

    ctx.fillStyle = hovered === "Atas" ? "#8b5cf6" : "#10b981";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(topTriangle[0][0], topTriangle[0][1]);
    ctx.lineTo(topTriangle[1][0], topTriangle[1][1]);
    ctx.lineTo(topTriangle[2][0], topTriangle[2][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (showLabels) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Tutup", centerX, startY + baseSize * 0.577);
    }

    // Three rectangular faces
    const rectY = startY + baseSize * 0.866 + 5;
    const rects = [
      { x: centerX - baseSize * 1.5, w: baseSize, label: "Sisi 1" },
      { x: centerX - baseSize * 0.5, w: baseSize, label: "Sisi 2" },
      { x: centerX + baseSize * 0.5, w: baseSize, label: "Sisi 3" },
    ];

    rects.forEach((rect) => {
      const isHovered = hovered === rect.label;
      ctx.fillStyle = isHovered ? "#8b5cf6" : "#34d399";
      ctx.fillRect(rect.x, rectY, rect.w, prismHeight);
      ctx.strokeRect(rect.x, rectY, rect.w, prismHeight);

      if (showLabels) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(rect.label, rect.x + rect.w / 2, rectY + prismHeight / 2);
      }
    });

    // Bottom triangle
    const bottomY = rectY + prismHeight + 5;
    const bottomTriangle = [
      [centerX, bottomY],
      [centerX - baseSize / 2, bottomY + baseSize * 0.866],
      [centerX + baseSize / 2, bottomY + baseSize * 0.866],
    ];

    ctx.fillStyle = hovered === "Bawah" ? "#8b5cf6" : "#10b981";
    ctx.beginPath();
    ctx.moveTo(bottomTriangle[0][0], bottomTriangle[0][1]);
    ctx.lineTo(bottomTriangle[1][0], bottomTriangle[1][1]);
    ctx.lineTo(bottomTriangle[2][0], bottomTriangle[2][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (showLabels) {
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Alas", centerX, bottomY + baseSize * 0.577);
    }

    // Fold lines
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - baseSize * 1.5, rectY);
    ctx.lineTo(centerX + baseSize * 1.5, rectY);
    ctx.moveTo(centerX - baseSize * 1.5, rectY + prismHeight);
    ctx.lineTo(centerX + baseSize * 1.5, rectY + prismHeight);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const _x = e.clientX - rect.left;
    const _y = e.clientY - rect.top;

    // Simple hover detection (can be improved with proper hit testing)
    // For now, just show that hover is working
    setHoveredFace("Hover Active");
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setScale(1);
  };

  const getShapeTitle = () => {
    const titles: Record<typeof shape, string> = {
      kubus: "Jaring-jaring Kubus",
      balok: "Jaring-jaring Balok",
      tabung: "Jaring-jaring Tabung",
      kerucut: "Jaring-jaring Kerucut",
      limas: "Jaring-jaring Limas Segiempat",
      prisma: "Jaring-jaring Prisma Segitiga",
    };
    return titles[shape];
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined">auto_awesome</span>
          {getShapeTitle()}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-white text-lg">
              zoom_out
            </span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white text-xs font-bold"
            title="Reset Zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-white text-lg">
              zoom_in
            </span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-slate-50">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="w-full cursor-move"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredFace(null)}
        />

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-200">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">info</span>
            Legenda
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500 border-dashed border border-red-600"></div>
              <span>Garis lipat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 border border-slate-800"></div>
              <span>Sisi bangun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
        <div className="flex items-start gap-2 text-xs text-slate-600">
          <span className="material-symbols-outlined text-sm text-purple-600 mt-0.5">
            lightbulb
          </span>
          <div>
            <p className="font-semibold text-slate-800 mb-1">
              Cara Membuat Bangun Ruang:
            </p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Gambar jaring-jaring di kertas/karton</li>
              <li>
                Gunting mengikuti <strong>garis tepi hitam</strong>
              </li>
              <li>
                Lipat pada <strong>garis merah putus-putus</strong>
              </li>
              <li>Rekatkan sisi-sisi yang bertemu</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
