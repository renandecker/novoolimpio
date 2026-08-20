import {useState, useCallback} from 'react';
import type {ReactNode} from 'react';
import './Wizard.css';

export interface WizardStep {
    key: string;
    label: string;
    content: ReactNode;
    nextLabel?: string;
    nextDisabled?: boolean;
    validate?: (currentData: any) => Promise<string | boolean> | string | boolean;
    onEnter?: (currentData: any) => Promise<void> | void;
}

interface WizardProps {
    steps: WizardStep[];
    initial?: number;
    completeLabel?: string;
    onComplete?: (data: any) => void;
    initialData?: any;
    onDataChange?: (data: any) => void;
}

interface FlowEvent {
    oldStep: string;
    newStep: string;
    direction: 'next' | 'back';
}

export function Wizard({
                           steps,
                           initial = 0,
                           completeLabel = 'Finalizar',
                           onComplete,
                           initialData = {},
                           onDataChange,
                       }: WizardProps) {
    const [index, setIndex] = useState(initial);
    const [data, setData] = useState(initialData);
    const [isValidating, setIsValidating] = useState(false);

    const current = steps[Math.min(index, steps.length - 1)];
    const last = index >= steps.length - 1;

    const updateData = useCallback((newData: any) => {
        const merged = {...data, ...newData};
        setData(merged);
        onDataChange?.(merged);
    }, [data, onDataChange]);

    const validateStep = async (stepIndex: number, direction: 'next' | 'back'): Promise<boolean> => {
        if (direction === 'back') return true;

        const step = steps[stepIndex];
        if (!step.validate) return true;

        setIsValidating(true);
        try {
            const result = await step.validate(data);
            setIsValidating(false);
            if (result === true || result === '') return true;
            if (typeof result === 'string') {
                alert(result);
            }
            return false;
        } catch (error) {
            setIsValidating(false);
            console.error('Validation error:', error);
            return false;
        }
    };

    const prepareStep = async (stepIndex: number) => {
        const step = steps[stepIndex];
        if (step.onEnter) {
            try {
                await step.onEnter(data);
            } catch (error) {
                console.error('Step preparation error:', error);
            }
        }
    };

    const goNext = async () => {
        if (last) {
            if (await validateStep(index, 'next')) {
                onComplete?.(data);
            }
            return;
        }

        if (await validateStep(index, 'next')) {
            const newIndex = index + 1;
            setIndex(newIndex);
            await prepareStep(newIndex);
        }
    };

    const goBack = async () => {
        if (index === 0) return;
        const newIndex = index - 1;
        setIndex(newIndex);
        await prepareStep(newIndex);
    };

    const goToStep = async (stepIndex: number) => {
        if (stepIndex === index) return;
        const direction = stepIndex > index ? 'next' : 'back';

        if (direction === 'next') {
            for (let i = index; i < stepIndex; i++) {
                if (!(await validateStep(i, 'next'))) return;
            }
        }

        setIndex(stepIndex);
        await prepareStep(stepIndex);
    };

    return (
        <div className="wizard">
            <nav className="wizard-steps" role="navigation" aria-label="Passos do assistente">
                {steps.map((step, stepIndex) => {
                    const state = stepIndex < index ? 'wizard-step-done' : stepIndex === index ? 'wizard-step-active' : 'wizard-step-pending';
                    return (
                        <button
                            key={step.key}
                            type="button"
                            className={`wizard-step ${state}`}
                            onClick={() => goToStep(stepIndex)}
                            disabled={isValidating}
                            aria-current={stepIndex === index ? 'step' : undefined}
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
                    onClick={goBack}
                    disabled={index === 0 || isValidating}
                >
                    Anterior
                </button>
                <button
                    type="button"
                    className="btn-form-save wizard-btn-next"
                    onClick={goNext}
                    disabled={current?.nextDisabled || isValidating}
                >
                    {isValidating ? 'Validando...' : last ? current?.nextLabel ?? completeLabel : current?.nextLabel ?? 'Próximo'}
                </button>
            </div>
        </div>
    );
}

export function useWizardData<T extends Record<string, any>>(initialData: T) {
    const [data, setData] = useState<T>(initialData);

    const updateField = useCallback((key: keyof T, value: any) => {
        setData(prev => ({...prev, [key]: value}));
    }, []);

    const updateFields = useCallback((fields: Partial<T>) => {
        setData(prev => ({...prev, ...fields}));
    }, []);

    const reset = useCallback(() => {
        setData(initialData);
    }, [initialData]);

    return {data, updateField, updateFields, reset, setData};
}