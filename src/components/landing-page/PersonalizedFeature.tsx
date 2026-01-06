export default function PersonalizedFeature() {
  return (
    <section className="relative py-32 w-full overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Text */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 z-10 order-2 lg:order-1">
            <div className="flex items-center gap-4 mb-2">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold text-xl border border-purple-200">
                1
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent"></span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Dirancang untuk <span className="text-purple-600">Pikiran</span>{" "}
              Anda.
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Tidak ada dua otak yang belajar sama. AI kami memetakan lanskap
              kognitif unik Anda—mendeteksi apakah Anda berkembang dengan
              visual, suara, atau interaksi—untuk membangun jalur pembelajaran
              yang terasa alami.
            </p>
            <ul className="space-y-4 mt-4">
              <li className="flex items-center gap-3">
                <span className="text-purple-600 text-2xl">✓</span>
                <span className="text-gray-700">
                  Profil Visual, Auditori, & Kinestetik
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-600 text-2xl">✓</span>
                <span className="text-gray-700">
                  Kesulitan Kurikulum Adaptif
                </span>
              </li>
            </ul>
          </div>

          {/* SVG Illustration */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-full max-w-[600px] aspect-square">
              <svg
                className="w-full h-full drop-shadow-2xl"
                fill="none"
                viewBox="0 0 600 600"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="cubeGrad"
                    x1="0%"
                    x2="0%"
                    y1="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#818cf8"
                      stopOpacity="0.2"
                    ></stop>
                    <stop
                      offset="100%"
                      stopColor="#4f46e5"
                      stopOpacity="0.8"
                    ></stop>
                  </linearGradient>
                </defs>
                <path
                  d="M100 400 L 300 350 L 500 400 L 300 450 Z"
                  fill="none"
                  opacity="0.3"
                  stroke="#6366f1"
                  strokeWidth="1"
                ></path>
                <path
                  d="M150 412 L 350 362"
                  opacity="0.2"
                  stroke="#6366f1"
                  strokeWidth="0.5"
                ></path>
                <path
                  d="M200 425 L 400 375"
                  opacity="0.2"
                  stroke="#6366f1"
                  strokeWidth="0.5"
                ></path>
                <g transform="translate(300, 300)">
                  <path
                    d="M-100 -50 L 0 -100 L 100 -50 L 0 0 Z"
                    fill="#a5b4fc"
                    opacity="0.4"
                    stroke="#4f46e5"
                    strokeWidth="2"
                  ></path>
                  <path
                    d="M-100 -50 L 0 0 L 0 100 L -100 50 Z"
                    fill="url(#cubeGrad)"
                    stroke="#4f46e5"
                    strokeWidth="2"
                  ></path>
                  <path
                    d="M100 -50 L 0 0 L 0 100 L 100 50 Z"
                    fill="#6366f1"
                    opacity="0.8"
                    stroke="#4f46e5"
                    strokeWidth="2"
                  ></path>
                </g>
                <rect
                  fill="none"
                  height="60"
                  opacity="0.8"
                  stroke="#ec4899"
                  strokeWidth="2"
                  transform="rotate(45 430 130)"
                  width="60"
                  x="400"
                  y="100"
                ></rect>
                <path
                  d="M100 150 L 140 220 L 60 220 Z"
                  fill="none"
                  opacity="0.8"
                  stroke="#a855f7"
                  strokeWidth="2"
                ></path>
                <path
                  d="M300 200 L 300 100"
                  opacity="0.5"
                  stroke="#8b5cf6"
                  strokeDasharray="5 5"
                ></path>
                <circle cx="300" cy="100" fill="#8b5cf6" r="5"></circle>
                <text
                  fill="#8b5cf6"
                  fontFamily="sans-serif"
                  fontSize="12"
                  x="310"
                  y="105"
                >
                  h = 10cm
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
