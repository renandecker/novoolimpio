import React, {useState, useCallback, useEffect} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {ReactNode} from 'react';

export interface WizardStep {
    key: string;
    label: string;
    content: ReactNode;
    nextDisabled?: boolean;
    nextLabel?: string;
    validate?: (currentData: any) => Promise<string | boolean> | string | boolean;
    onEnter?: (currentData: any) => Promise<void> | void;
}

interface WizardProps {
    steps: WizardStep[];
    initial?: number;
    stepIndex?: number;
    completeLabel?: string;
    onComplete?: (data: any) => void;
    initialData?: any;
    data?: any;
    onDataChange?: (data: any) => void;
    hideNavButtons?: boolean;
}

export function Wizard({
                           steps,
                           initial = 0,
                           stepIndex,
                           completeLabel = 'Finalizar',
                           onComplete,
                           initialData = {},
                           data,
                           onDataChange,
                           hideNavButtons = false,
                       }: WizardProps) {
    const [index, setIndex] = useState(initial);
    const [internalData, setInternalData] = useState(initialData);
    const [isValidating, setIsValidating] = useState(false);

    const currentData = data ?? internalData;
    const current = steps[Math.min(index, steps.length - 1)];
    const last = index >= steps.length - 1;

    useEffect(() => {
        if (data === undefined) {
            setInternalData(initialData);
        }
    }, [initialData, data]);

    useEffect(() => {
        if (stepIndex === undefined) return;
        setIndex(Math.max(0, Math.min(stepIndex, steps.length - 1)));
    }, [stepIndex, steps.length]);

    const updateData = useCallback((newData: any) => {
        const merged = {...currentData, ...newData};
        if (data === undefined) {
            setInternalData(merged);
        }
        onDataChange?.(merged);
    }, [currentData, data, onDataChange]);

    const validateStep = async (stepIndex: number, direction: 'next' | 'back'): Promise<boolean> => {
        if (direction === 'back') return true;

        const step = steps[stepIndex];
        if (!step.validate) return true;

        setIsValidating(true);
        try {
            const result = await step.validate(currentData);
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
                await step.onEnter(currentData);
            } catch (error) {
                console.error('Step preparation error:', error);
            }
        }
    };

    const goNext = async () => {
        if (last) {
            if (await validateStep(index, 'next')) {
                onComplete?.(currentData);
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
        <View style={styles.page}>
            <ScrollView style={styles.stepsScroll} horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.stepsRow}>
                    {steps.map((step, stepIndex) => {
                        const state =
                            stepIndex < index
                                ? styles.stepDone
                                : stepIndex === index
                                ? styles.stepActive
                                : styles.stepPending;
                        const numberState =
                            stepIndex < index
                                ? styles.numberDone
                                : stepIndex === index
                                ? styles.numberActive
                                : styles.numberPending;
                        const labelState =
                            stepIndex === index ? styles.labelActive : stepIndex < index ? styles.labelDone : styles.labelPending;
                        return (
                            <Pressable key={step.key} style={[styles.step, state]} onPress={() => goToStep(stepIndex)}>
                                <Text style={[styles.number, numberState]}>{stepIndex + 1}</Text>
                                <Text style={[styles.stepLabel, labelState]}>{step.label}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={styles.content}>{current?.content}</View>

            {!hideNavButtons && (
            <View style={styles.actions}>
                <Pressable
                    style={[styles.backButton, index === 0 && styles.buttonDisabled]}
                    disabled={index === 0 || isValidating}
                    onPress={goBack}
                >
                    <Text style={styles.backButtonText}>Anterior</Text>
                </Pressable>
                <Pressable
                    style={[styles.nextButton, current?.nextDisabled && styles.buttonDisabled]}
                    disabled={current?.nextDisabled || isValidating}
                    onPress={goNext}
                >
                    <Text style={styles.nextButtonText}>
                        {isValidating ? 'Validando...' : last ? current?.nextLabel ?? completeLabel : current?.nextLabel ?? 'Próximo'}
                    </Text>
                </Pressable>
            </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, padding: 12},
    stepsScroll: {flexGrow: 0, marginBottom: 12},
    stepsRow: {flexDirection: 'row', paddingVertical: 4},
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 6,
        paddingVertical: 5,
        marginRight: 8,
    },
    number: {
        width: 20,
        height: 20,
        borderRadius: 10,
        textAlign: 'center',
        lineHeight: 20,
        fontSize: 11,
        fontWeight: '700',
        marginRight: 6,
        overflow: 'hidden',
    },
    stepLabel: {fontSize: 13},
    stepActive: {backgroundColor: '#2a5a88', borderColor: '#265a88'},
    stepDone: {backgroundColor: '#e8f4e8', borderColor: '#7fbf7f'},
    stepPending: {backgroundColor: '#f5f5f5', borderColor: '#d3d3d3', opacity: 0.75},
    numberActive: {backgroundColor: '#ffffff', color: '#2a5a88'},
    numberDone: {backgroundColor: '#2e7d32', color: '#ffffff'},
    numberPending: {backgroundColor: '#cccccc', color: '#ffffff'},
    labelActive: {color: '#ffffff', fontWeight: '700'},
    labelDone: {color: '#2e7d32'},
    labelPending: {color: '#333333'},
    content: {flex: 1},
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 12,
        marginTop: 10
    },
    backButton: {backgroundColor: '#faa523', borderRadius: 4, paddingHorizontal: 16, paddingVertical: 10},
    backButtonText: {color: '#ffffff', fontSize: 14, fontWeight: '700'},
    nextButton: {backgroundColor: '#2a5a88', borderRadius: 4, paddingHorizontal: 18, paddingVertical: 10},
    nextButtonText: {color: '#ffffff', fontSize: 14, fontWeight: '700'},
    buttonDisabled: {opacity: 0.5},
});