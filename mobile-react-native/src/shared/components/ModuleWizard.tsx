import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {ModuleList} from './ModuleListScreen';
import {MasterDetail} from './MasterDetail';
import type {MasterDetailColumn} from './MasterDetail';
import {Wizard} from './Wizard';
import type {WizardStep} from './Wizard';
import type {ApiItem} from './types';

export interface ModuleWizardMasterDetail {
    label: string;
    source: string;
    valueKey?: string;
    searchKeys?: string[];
    columns?: MasterDetailColumn[];
}

export interface ModuleWizardField {
    label: string;
    placeholder?: string;
    secure?: boolean;
}

export interface ModuleWizardStep {
    key: string;
    label: string;
    path?: string;
    empty?: string;
    masterDetail?: ModuleWizardMasterDetail;
    fields?: ModuleWizardField[];
    nextLabel?: string;
}

function MasterDetailStep({config}: { config: ModuleWizardMasterDetail }) {
    const [items, setItems] = useState<ApiItem[]>([]);
    return (
        <MasterDetail
            label={config.label}
            source={config.source}
            valueKey={config.valueKey}
            searchKeys={config.searchKeys}
            columns={config.columns}
            items={items}
            onChange={setItems}
        />
    );
}

function FieldsStep({fields}: { fields: ModuleWizardField[] }) {
    return (
        <View style={styles.formGrid}>
            {fields.map((field) => (
                <View key={field.label} style={styles.formField}>
                    <Text style={styles.formLabel}>{field.label}</Text>
                    <TextInput
                        style={styles.formInput}
                        placeholder={field.placeholder ?? field.label}
                        secureTextEntry={field.secure}
                    />
                </View>
            ))}
        </View>
    );
}

export function ModuleWizard({steps, completeLabel}: { steps: ModuleWizardStep[]; completeLabel?: string }) {
    const lastStep = steps[steps.length - 1];
    const wizardSteps: WizardStep[] = steps.map((step, index) => ({
        key: step.key,
        label: step.label,
        content: step.masterDetail ? (
            <MasterDetailStep config={step.masterDetail}/>
        ) : step.fields ? (
            <FieldsStep fields={step.fields}/>
        ) : step.path ? (
            <ModuleList path={step.path}/>
        ) : (
            <View style={styles.emptyBox}>
                <Text style={styles.empty}>{step.empty ?? 'Sem conteúdo nesta etapa.'}</Text>
            </View>
        ),
        nextLabel: index === steps.length - 1 ? undefined : step.nextLabel,
    }));

    return <Wizard steps={wizardSteps} completeLabel={lastStep?.nextLabel ?? completeLabel}/>;
}

const styles = StyleSheet.create({
    emptyBox: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32},
    empty: {color: '#888', fontStyle: 'italic', textAlign: 'center'},
    formGrid: {paddingVertical: 8, gap: 12},
    formField: {marginBottom: 4},
    formLabel: {fontSize: 13, fontWeight: '700', color: '#2b2b2b', marginBottom: 4},
    formInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        backgroundColor: '#ffffff'
    },
});
