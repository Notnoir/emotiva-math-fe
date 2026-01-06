export default function EmotionAwareFeature() {
  return (
    <section className="relative py-32 w-full overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* SVG Illustration */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-start order-1">
            <div className="relative w-full max-w-[600px] aspect-square">
              <svg
                className="w-full h-full drop-shadow-2xl"
                viewBox="0 0 500 500"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="emotion_grad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <circle
                  cx="250"
                  cy="250"
                  fill="url(#emotion_grad)"
                  opacity="0.1"
                  r="220"
                />
                <g
                  fill="none"
                  stroke="url(#emotion_grad)"
                  strokeLinecap="round"
                  strokeWidth="20"
                >
                  <path d="M150,250 Q250,50 350,250 T450,250" opacity="0.6" />
                  <path d="M50,250 Q150,450 250,250 T450,250" opacity="0.4" />
                  <circle
                    cx="250"
                    cy="250"
                    r="100"
                    strokeDasharray="20 10"
                    strokeWidth="4"
                  />
                </g>
              </svg>
            </div>
          </div>

          {/* Text */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 z-10 order-2">
            <div className="flex items-center gap-4 mb-2 lg:flex-row-reverse">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 text-pink-600 font-bold text-xl border border-pink-200">
                2
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-pink-200 to-transparent"></span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight lg:text-right">
              Merasakan Bagaimana Anda{" "}
              <span className="text-pink-500">Merasa</span>.
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed lg:text-right">
              Frustrasi? Kami melambat. Bosan? Kami mempercepat. Algoritma sadar
              emosi kami menyesuaikan kecepatan pembelajaran secara real-time,
              menjaga Anda dalam kondisi flow optimal untuk retensi dan
              kenikmatan maksimal.
            </p>
            <ul className="space-y-4 mt-4 lg:items-end lg:flex lg:flex-col">
              <li className="flex items-center gap-3 lg:flex-row-reverse">
                <span className="text-pink-500 text-2xl">❤️</span>
                <span className="text-gray-700">
                  Deteksi Frustrasi Real-time
                </span>
              </li>
              <li className="flex items-center gap-3 lg:flex-row-reverse">
                <span className="text-pink-500 text-2xl">⚡</span>
                <span className="text-gray-700">
                  Penyesuaian Kecepatan Dinamis
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
