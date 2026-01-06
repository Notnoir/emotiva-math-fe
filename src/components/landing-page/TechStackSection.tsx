export default function TechStackSection() {
  return (
    <section className="py-16 w-full bg-slate-50 border-t border-gray-100">
      <div className="flex flex-col items-center gap-8 w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 mx-auto">
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
          Didukung Oleh
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 opacity-70 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-2xl">⚛️</span>
            <span className="font-semibold">React + Vite</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden sm:block"></div>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-2xl">🎨</span>
            <span className="font-semibold">Tailwind CSS</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden sm:block"></div>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-2xl">🐍</span>
            <span className="font-semibold">Flask + MySQL</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden sm:block"></div>
          <div className="flex items-center gap-2 text-purple-500 font-bold">
            <span className="text-2xl">🤖</span>
            <span>Artificial Intelligence</span>
          </div>
        </div>
      </div>
    </section>
  );
}
