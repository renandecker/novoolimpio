import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

export interface WizardStep {
  key: string;
  label: string;
  content: ReactNode;
  nextDisabled?: boolean;
  nextLabel?: string;
}

export function Wizard({
  steps,
  initial = 0,
  completeLabel = 'Finalizar',
  onComplete,
}: {
  steps: WizardStep[];
  initial?: number;
  completeLabel?: string;
  onComplete?: () => void;
}) {
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
              <Pressable key={step.key} style={[styles.step, state]} onPress={() => setIndex(stepIndex)}>
                <Text style={[styles.number, numberState]}>{stepIndex + 1}</Text>
                <Text style={[styles.stepLabel, labelState]}>{step.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.content}>{current?.content}</View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.backButton, index === 0 && styles.buttonDisabled]}
          disabled={index === 0}
          onPress={() => setIndex((value) => Math.max(0, value - 1))}
        >
          <Text style={styles.backButtonText}>Anterior</Text>
        </Pressable>
        <Pressable
          style={[styles.nextButton, current?.nextDisabled && styles.buttonDisabled]}
          disabled={current?.nextDisabled}
          onPress={goNext}
        >
          <Text style={styles.nextButtonText}>{last ? completeLabel : current?.nextLabel ?? 'Próximo'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 12 },
  stepsScroll: { flexGrow: 0, marginBottom: 12 },
  stepsRow: { flexDirection: 'row', paddingVertical: 4 },
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
  stepLabel: { fontSize: 13 },
  stepActive: { backgroundColor: '#2a5a88', borderColor: '#265a88' },
  stepDone: { backgroundColor: '#e8f4e8', borderColor: '#7fbf7f' },
  stepPending: { backgroundColor: '#f5f5f5', borderColor: '#d3d3d3', opacity: 0.75 },
  numberActive: { backgroundColor: '#ffffff', color: '#2a5a88' },
  numberDone: { backgroundColor: '#2e7d32', color: '#ffffff' },
  numberPending: { backgroundColor: '#cccccc', color: '#ffffff' },
  labelActive: { color: '#ffffff', fontWeight: '700' },
  labelDone: { color: '#2e7d32' },
  labelPending: { color: '#333333' },
  content: { flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 12, marginTop: 10 },
  backButton: { backgroundColor: '#faa523', borderRadius: 4, paddingHorizontal: 16, paddingVertical: 10 },
  backButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  nextButton: { backgroundColor: '#2a5a88', borderRadius: 4, paddingHorizontal: 18, paddingVertical: 10 },
  nextButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  buttonDisabled: { opacity: 0.5 },
});
