'use client';

import { useEffect, useState } from 'react';
import { Loader2, Brain, Check } from 'lucide-react';

interface ProgressIndicatorProps {
  message?: string | null;
  isVisible?: boolean;
}

const progressSteps = [
  { icon: Loader2, text: 'Enviando mensagem...', duration: 1000 },
  { icon: Brain, text: 'Processando com IA...', duration: 0 }, // Indefinido
  { icon: Brain, text: 'Quase pronto, finalizando...', duration: 5000 },
  { icon: Check, text: 'Concluído!', duration: 1000 },
];

export const ProgressIndicator = ({ message, isVisible = true }: ProgressIndicatorProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setElapsed(prev => prev + 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setElapsed(0);
      return;
    }

    // Auto-advance steps based on elapsed time
    if (elapsed >= 2000 && currentStep === 0) {
      setCurrentStep(1); // Move to "Processing with IA"
    } else if (elapsed >= 30000 && currentStep === 1) {
      setCurrentStep(2); // Move to "Almost ready" after 30s
    }

    // Handle message-based transitions
    if (message === 'Enviando mensagem...' && currentStep !== 0) {
      setCurrentStep(0);
    } else if (message === 'Processando com IA...' && currentStep !== 1) {
      setCurrentStep(1);
    } else if (message === 'Concluído!' && currentStep !== 3) {
      setCurrentStep(3);
    }
  }, [elapsed, currentStep, message, isVisible]);

  if (!isVisible) return null;

  const step = progressSteps[currentStep] || progressSteps[0]!;
  const Icon = step.icon;

  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-lg max-w-md">
      <Icon className={`h-5 w-5 ${Icon === Loader2 || Icon === Brain ? 'animate-spin' : ''}`} />
      <div className="flex-1">
        <p className="text-sm font-medium">
          {message || step.text}
        </p>
        {currentStep === 1 && elapsed > 10000 && (
          <p className="text-xs text-blue-600 mt-1">
            Processamento em andamento... ({Math.round(elapsed / 1000)}s)
          </p>
        )}
      </div>
    </div>
  );
};