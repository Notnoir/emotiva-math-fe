import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  step_number: number;
  title: string;
  content: string;
  formula?: string;
  calculation?: string;
  visual_hint?: string;
  duration: number;
}

interface SolutionData {
  problem: string;
  final_answer: string;
  steps: Step[];
  total_duration: number;
}

interface StepBySteViewerProps {
  data: SolutionData;
  onStepChange?: (step: Step) => void;
  onComplete?: () => void;
}

export default function StepBySteViewer({
  data,
  onStepChange,
  onComplete,
}: StepBySteViewerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || currentStep >= data.steps.length) return;

    const currentStepData = data.steps[currentStep];
    const duration = currentStepData.duration || 2500;

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = 100 / (duration / 50);
        return Math.min(prev + increment, 100);
      });
    }, 50);

    // Auto advance to next step
    const timer = setTimeout(() => {
      if (currentStep < data.steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
        setProgress(0);
      } else {
        setIsPlaying(false);
        setProgress(100);
        onComplete?.();
      }
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [isPlaying, currentStep, data.steps, onComplete]);

  // Notify parent of step change
  useEffect(() => {
    if (data.steps[currentStep]) {
      onStepChange?.(data.steps[currentStep]);
    }
  }, [currentStep, data.steps, onStepChange]);

  const handleNext = () => {
    if (currentStep < data.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setProgress(0);
    }
  };

  const handleReplay = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleJumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    setIsPlaying(false);
  };

  const step = data.steps[currentStep];
  const progressPercent = (currentStep / data.steps.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="text-xl">💡</span>
          </div>
          <h3 className="text-xl font-bold">Solusi Step-by-Step</h3>
        </div>
        <p className="text-indigo-100 text-sm">{data.problem}</p>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            Step {currentStep + 1} of {data.steps.length}
          </span>
          <span className="text-sm text-slate-500">
            {Math.round(progressPercent)}% Complete
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex gap-2 mt-4">
          {data.steps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleJumpToStep(index)}
              className={`flex-1 h-2 rounded-full transition-all ${
                index === currentStep
                  ? "bg-indigo-600"
                  : index < currentStep
                  ? "bg-indigo-300"
                  : "bg-slate-200"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="min-h-[200px]"
          >
            {/* Step Number Badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {step.step_number}
                </span>
              </div>
              <h4 className="text-2xl font-bold text-slate-800">
                {step.title}
              </h4>
            </div>

            {/* Step Content */}
            <div className="space-y-4">
              <p className="text-lg text-slate-700 leading-relaxed">
                {step.content}
              </p>

              {/* Formula Display */}
              {step.formula && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6"
                >
                  <div className="text-sm font-semibold text-purple-700 mb-2">
                    📐 Rumus:
                  </div>
                  <div className="text-3xl font-bold text-center text-indigo-900">
                    {step.formula}
                  </div>
                </motion.div>
              )}

              {/* Calculation Display */}
              {step.calculation && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6"
                >
                  <div className="text-sm font-semibold text-amber-700 mb-2">
                    🧮 Perhitungan:
                  </div>
                  <div className="text-xl font-mono text-amber-900">
                    {step.calculation}
                  </div>
                </motion.div>
              )}

              {/* Visual Hint Badge */}
              {step.visual_hint && (
                <div className="flex items-center gap-2 text-sm text-indigo-600">
                  <span className="inline-flex items-center gap-1 bg-indigo-100 px-3 py-1 rounded-full">
                    <span>👁️</span>
                    <span className="font-medium">
                      {step.visual_hint.replace(/_/g, " ")}
                    </span>
                  </span>
                </div>
              )}

              {/* Final Answer Display */}
              {currentStep === data.steps.length - 1 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mt-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">✅</span>
                    <div className="text-lg font-bold text-green-800">
                      Jawaban Akhir:
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {data.final_answer}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="border-t border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-center gap-2">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-slate-700 font-medium"
            aria-label="Previous step"
          >
            <span>⏮️</span>
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 font-medium"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <span className="text-xl">{isPlaying ? "⏸️" : "▶️"}</span>
            <span className="hidden sm:inline">
              {isPlaying ? "Pause" : "Play"}
            </span>
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentStep === data.steps.length - 1}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-slate-700 font-medium"
            aria-label="Next step"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <span>⏭️</span>
          </button>

          {/* Replay Button */}
          <button
            onClick={handleReplay}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 text-slate-700 font-medium"
            aria-label="Replay from beginning"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Ulang</span>
          </button>
        </div>

        {/* Auto-play Progress */}
        {isPlaying && (
          <div className="mt-3">
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
