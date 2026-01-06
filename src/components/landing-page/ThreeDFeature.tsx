export default function ThreeDFeature() {
  return (
    <section className="relative py-32 w-full overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Text */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 z-10 order-2 lg:order-1">
            <div className="flex items-center gap-4 mb-2">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xl border border-indigo-200">
                3
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-indigo-200 to-transparent"></span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Matematika dalam <span className="text-indigo-500">Dimensi</span>.
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Bebas dari halaman datar. Visualisasikan geometri kompleks seperti
              Kubus dan Piramida mengambang di ruangan Anda melalui Augmented
              Reality. Manipulasi bentuk dengan tangan Anda dan pahami hubungan
              spasial secara intuitif.
            </p>
            <ul className="space-y-4 mt-4">
              <li className="flex items-center gap-3">
                <span className="text-indigo-500 text-2xl">📦</span>
                <span className="text-gray-700">Proyeksi 3D Imersif</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-indigo-500 text-2xl">👆</span>
                <span className="text-gray-700">
                  Manipulasi Objek Interaktif
                </span>
              </li>
            </ul>
          </div>

          {/* SVG Illustration */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-full max-w-[600px] aspect-square">
              <svg
                className="w-full h-full drop-shadow-2xl"
                viewBox="0 0 500 500"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="cube_grad"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
                <g stroke="#818cf8" strokeOpacity="0.3" strokeWidth="1">
                  <path d="M100 350 L400 350" />
                  <path d="M130 380 L430 380" />
                  <path d="M70 320 L370 320" />
                  <path d="M150 300 L70 420" />
                  <path d="M250 300 L170 420" />
                  <path d="M350 300 L270 420" />
                </g>
                <g transform="translate(250, 250)">
                  <path
                    d="M-60 -60 L60 -60 L60 60 L-60 60 Z"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="4"
                  />
                  <path
                    d="M-30 -90 L90 -90 L90 30 L-30 30 Z"
                    fill="url(#cube_grad)"
                    opacity="0.1"
                  />
                  <path
                    d="M-60 -60 L-30 -90 M60 -60 L90 -90 M60 60 L90 30 M-60 60 L-30 30"
                    stroke="#4f46e5"
                    strokeWidth="2"
                  />
                </g>
                <rect
                  fill="none"
                  height="40"
                  stroke="#ec4899"
                  strokeWidth="2"
                  transform="translate(350, 170) rotate(15)"
                  width="40"
                />
                <polygon
                  fill="none"
                  points="0,-20 17,10 -17,10"
                  stroke="#a855f7"
                  strokeWidth="2"
                  transform="translate(130, 300) rotate(-15) scale(1.5)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
