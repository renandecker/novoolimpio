import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ModuleList } from './ModuleListScreen';
import { Wizard } from './Wizard';
import type { WizardStep } from './Wizard';

export interface ModuleWizardStep {
  key: string;
  label: string;
  path?: string;
  empty?: string;
  nextLabel?: string;
}

export function ModuleWizard({ steps, completeLabel }: { steps: ModuleWizardStep[]; completeLabel?: string }) {
  const lastStep = steps[steps.length - 1];
  const wizardSteps: WizardStep[] = steps.map((step, index) => ({
    key: step.key,
    label: step.label,
    content: step.path ? (
      <ModuleList path={step.path} />
    ) : (
      <View style={styles.emptyBox}>
        <Text style={styles.empty}>{step.empty ?? 'Sem conteúdo nesta etapa.'}</Text>
      </View>
    ),
    nextLabel: index === steps.length - 1 ? undefined : step.nextLabel,
  }));

  return <Wizard steps={wizardSteps} completeLabel={lastStep?.nextLabel ?? completeLabel} />;
}

const styles = StyleSheet.create({
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32 },
  empty: { color: '#888', fontStyle: 'italic', textAlign: 'center' },
});
