import {
  HeroSection,
  PersonalizedFeature,
  EmotionAwareFeature,
  ThreeDFeature,
  // TechStackSection,
} from "../components/landing-page";

export default function HomePage() {
  return (
    <main className="flex-grow flex flex-col w-full relative overflow-x-hidden">
      <HeroSection />
      <PersonalizedFeature />
      <EmotionAwareFeature />
      <ThreeDFeature />
      {/* <TechStackSection /> */}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </main>
  );
}
