export default function EmotionAwareFeature() {
  return (
    <section className="relative py-32 w-full overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* SVG Illustration - Koordinat Kartesius */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-start order-1">
            <div className="relative w-full max-w-[600px] aspect-square">
              <svg
                className="w-full h-full drop-shadow-2xl"
                viewBox="0 0 500 500"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="axis_grad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
                  </marker>
                </defs>

                {/* Major grid lines - lighter */}
                <g stroke="#e5e7eb" strokeWidth="1" opacity="0.3">
                  <line x1="100" y1="50" x2="100" y2="450" />
                  <line x1="150" y1="50" x2="150" y2="450" />
                  <line x1="200" y1="50" x2="200" y2="450" />
                  <line x1="300" y1="50" x2="300" y2="450" />
                  <line x1="350" y1="50" x2="350" y2="450" />
                  <line x1="400" y1="50" x2="400" y2="450" />

                  <line x1="50" y1="100" x2="450" y2="100" />
                  <line x1="50" y1="150" x2="450" y2="150" />
                  <line x1="50" y1="200" x2="450" y2="200" />
                  <line x1="50" y1="300" x2="450" y2="300" />
                  <line x1="50" y1="350" x2="450" y2="350" />
                  <line x1="50" y1="400" x2="450" y2="400" />
                </g>

                {/* Y-Axis */}
                <line
                  x1="250"
                  y1="450"
                  x2="250"
                  y2="50"
                  stroke="#6b7280"
                  strokeWidth="2.5"
                  markerEnd="url(#arrowhead)"
                />

                {/* X-Axis */}
                <line
                  x1="50"
                  y1="250"
                  x2="450"
                  y2="250"
                  stroke="#6b7280"
                  strokeWidth="2.5"
                  markerEnd="url(#arrowhead)"
                />

                {/* Axis Labels */}
                <text
                  x="265"
                  y="40"
                  fill="#374151"
                  fontSize="18"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  y
                </text>
                <text
                  x="460"
                  y="240"
                  fill="#374151"
                  fontSize="18"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  x
                </text>
                <text
                  x="260"
                  y="268"
                  fill="#9ca3af"
                  fontSize="13"
                  fontWeight="500"
                  fontFamily="sans-serif"
                >
                  0
                </text>

                {/* Smooth Parabola */}
                <path
                  d="M 80,420 Q 165,80 250,50 T 420,420"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  // opacity="0.8"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="1000"
                    to="0"
                    dur="7s"
                    repeatCount="indefinite"
                  />
                </path>

                {/* Smooth Exponential curve */}
                <path
                  d="M 80,400 C 120,380 160,320 200,220 S 280,80 350,60"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  // opacity="0.75"
                  strokeDasharray="800"
                  strokeDashoffset="800"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="800"
                    to="0"
                    dur="4s"
                    begin="0.5s"
                    repeatCount="indefinite"
                  />
                </path>

                {/* Smooth Sine Wave */}
                <path
                  d="M 50,250 Q 100,150 150,250 T 250,250 Q 300,350 350,250 T 450,250"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  // opacity="0.7"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="1000"
                    to="0"
                    dur="5s"
                    begin="1s"
                    repeatCount="indefinite"
                  />
                </path>

                {/* Coordinate Numbers - X Axis */}
                <g
                  fill="#6b7280"
                  fontSize="11"
                  fontFamily="sans-serif"
                  opacity="0.8"
                >
                  <text x="95" y="273" textAnchor="middle">
                    -3
                  </text>
                  <text x="145" y="273" textAnchor="middle">
                    -2
                  </text>
                  <text x="195" y="273" textAnchor="middle">
                    -1
                  </text>
                  <text x="295" y="273" textAnchor="middle">
                    1
                  </text>
                  <text x="345" y="273" textAnchor="middle">
                    2
                  </text>
                  <text x="395" y="273" textAnchor="middle">
                    3
                  </text>
                </g>

                {/* Coordinate Numbers - Y Axis */}
                <g
                  fill="#6b7280"
                  fontSize="11"
                  fontFamily="sans-serif"
                  opacity="0.8"
                >
                  <text x="230" y="105" textAnchor="end">
                    3
                  </text>
                  <text x="230" y="155" textAnchor="end">
                    2
                  </text>
                  <text x="230" y="205" textAnchor="end">
                    1
                  </text>
                  <text x="230" y="305" textAnchor="end">
                    -1
                  </text>
                  <text x="230" y="355" textAnchor="end">
                    -2
                  </text>
                  <text x="230" y="405" textAnchor="end">
                    -3
                  </text>
                </g>

                {/* Decorative points */}
                <circle cx="250" cy="50" r="5" fill="#ec4899">
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>

                <circle cx="200" cy="220" r="5" fill="#a855f7">
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur="2s"
                    begin="0.5s"
                    repeatCount="indefinite"
                  />
                </circle>

                <circle cx="350" cy="250" r="5" fill="#3b82f6">
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur="2s"
                    begin="1s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Scale marks */}
                <g stroke="#9ca3af" strokeWidth="1.5" opacity="0.6">
                  <line x1="100" y1="245" x2="100" y2="255" />
                  <line x1="150" y1="245" x2="150" y2="255" />
                  <line x1="200" y1="245" x2="200" y2="255" />
                  <line x1="300" y1="245" x2="300" y2="255" />
                  <line x1="350" y1="245" x2="350" y2="255" />
                  <line x1="400" y1="245" x2="400" y2="255" />

                  <line x1="245" y1="100" x2="255" y2="100" />
                  <line x1="245" y1="150" x2="255" y2="150" />
                  <line x1="245" y1="200" x2="255" y2="200" />
                  <line x1="245" y1="300" x2="255" y2="300" />
                  <line x1="245" y1="350" x2="255" y2="350" />
                  <line x1="245" y1="400" x2="255" y2="400" />
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
