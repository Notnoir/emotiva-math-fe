import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const items = itemsRef.current;
    const text = textRef.current;

    if (!container || items.length === 0 || !text) return;

    // Setup posisi awal: posisi fixed abstract (tidak random)
    const positions = [
      { x: -500, y: -280, z: -2000 }, // penggaris
      { x: 360, y: 280, z: -1100 }, // grafik batang
      { x: -350, y: 300, z: -1300 }, // abakus
      { x: 380, y: -140, z: -1700 }, // grafik garis
      { x: -400, y: 50, z: -900 }, // sigma
      { x: 420, y: -200, z: -1500 }, // integral
      { x: -320, y: -80, z: -1900 }, // pi
      { x: 500, y: 100, z: -1200 }, // infinity
    ];

    items.forEach((item, index) => {
      const pos = positions[index] || { x: 0, y: 0, z: -1000 };
      gsap.set(item, {
        xPercent: pos.x,
        yPercent: pos.y,
        z: pos.z,
        opacity: 0.7,
      });
    });

    // Buat timeline untuk scroll animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=200%", // Increase untuk lebih lama
        pin: true,
        pinSpacing: true, // Ensure proper spacing
        scrub: 1.5, // Slightly slower for smoother feel
        invalidateOnRefresh: true,
      },
    });

    // Animasi items: bergerak maju (z positif) tanpa rotasi
    items.forEach((item) => {
      tl.to(
        item,
        {
          z: "+=3000",
          opacity: 0,
          ease: "none",
        },
        0
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Data untuk floating items (bisa gambar matematika, simbol, dll)
  const floatingItems = [
    { emoji: "f(x)" },
    { emoji: "+" },
    { emoji: "∩" },
    { emoji: "∀" },
    { emoji: "∑" },
    { emoji: "∫" },
    { emoji: "π" },
    { emoji: "∞" },
  ];

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-white -mt-20"
      style={{
        perspective: "1000px",
        perspectiveOrigin: "center",
      }}
    >
      {/* Floating 3D Items */}
      {floatingItems.map((item, index) => (
        <div
          key={index}
          ref={(el) => {
            if (el) itemsRef.current[index] = el;
          }}
          className={`absolute w-[300px] h-[200px] rounded-xl flex items-center justify-center text-9xl `}
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform, opacity",
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Center Text Content */}
      <div
        ref={textRef}
        className="absolute z-[100] flex flex-col items-center text-center px-4 max-w-5xl mx-auto gap-8 pointer-events-none"
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 backdrop-blur-md mb-4 shadow-lg">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
          <span className="text-sm font-medium text-purple-700">
            Intelligent Learning Engine v2.0 Active
          </span>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-8xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-purple-800 to-pink-600 uppercase">
          EMOTIVA-MATH
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-lg text-gray-700 max-w-2xl leading-relaxed">
          Masuki dunia di mana matematika beradaptasi dengan{" "}
          <span className="text-purple-600 font-bold">Anda</span>. Perjalanan 3D
          Imersif melalui pembelajaran yang Dipersonalisasi dan Sadar Emosi.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mt-8 w-full justify-center pointer-events-auto">
          <Link
            to="/student-dashboard"
            className="group relative bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-lg shadow-xl shadow-purple-500/30 font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-105"
          >
            Mulai Belajar
          </Link>
          <Link
            to="/learn"
            className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-10 py-4 rounded-lg font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-lg"
          >
            Tonton Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
