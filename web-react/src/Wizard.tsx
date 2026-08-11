import { useState } from 'react';
import type { ReactNode } from 'react';
import './Wizard.css';

export interface WizardStep {
  key: string;
  label: string;
  content: ReactNode;
  nextLabel?: string;
  nextDisabled?: boolean;
}

interface WizardProps {
  steps: WizardStep[];
  initial?: number;
  completeLabel?: string;
  onComplete?: () => void;
}

export function Wizard({ steps, initial = 0, completeLabel = 'Finalizar', onComplete }: WizardProps) {
  const [index, setIndex] = useState(initial);
  const current = steps[Math.min(index, steps.length - 1)];
  const last = index >= steps.length - 1;

  const goNext = () => {
    if (last) {
      onComplete?.();
      return;
    }
    setIndex((value) => Math.min(steps.length - 1, value + 1));
  };

  return (
    <div className="wizard">
      <nav className="wizard-steps">
        {steps.map((step, stepIndex) => {
          const state = stepIndex < index ? 'wizard-step-done' : stepIndex === index ? 'wizard-step-active' : 'wizard-step-pending';
          return (
            <button
              key={step.key}
              type="button"
              className={`wizard-step ${state}`}
              onClick={() => setIndex(stepIndex)}
            >
              <span className="wizard-step-number">{stepIndex + 1}</span>
              <span className="wizard-step-label">{step.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="wizard-content">{current?.content}</div>
      <div className="wizard-actions">
        <button
          type="button"
          className="btn-form-back wizard-btn-back"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0}
        >
          Anterior
        </button>
        <button
          type="button"
          className="btn-form-save wizard-btn-next"
          onClick={goNext}
          disabled={current?.nextDisabled}
        >
          {last ? current?.nextLabel ?? completeLabel : current?.nextLabel ?? 'Próximo'}
        </button>
      </div>
    </div>
  );
}
