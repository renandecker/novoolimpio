import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {Tabs} from '../Tabs';
import {ModuleList, ModuleListExtraAction} from '../ModuleListScreen';
import {executeAction} from '../actions';
import type {ApiItem} from '../types';

interface EtapaNap {
    id: number;
    descricao: string;
}

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const extraActions: ModuleListExtraAction[] = [
    {
        key: 'detalhes',
        title: 'Detalhes',
        icon: 'ℹ️',
        permission: 'READ',
        onPress: async (item) => {
            await executeAction('ligacao-nap', 'carregarDetalhes', JSON.stringify({contrato: asRecord(item).contrato}), 'educacao');
        },
    },
    {
        key: 'ligacao',
        title: 'Ligação',
        icon: '📞',
        permission: 'EXECUTE',
        onPress: async (item) => {
            await executeAction('ligacao-nap', 'iniciarLigacao', JSON.stringify({nap: asRecord(item).nap, contrato: asRecord(item).contrato}), 'educacao');
        },
    },
    {
        key: 'email',
        title: 'E-mail',
        icon: '✉️',
        permission: 'EXECUTE',
        onPress: async (item) => {
            await executeAction('ligacao-nap', 'prepararEnvioEmail', JSON.stringify({id: item.id}), 'educacao');
        },
    },
];

export default function ViewNapListLigacaoNapListScreen() {
    const etapasQuery = useQuery({
        queryKey: ['etapas-nap'],
        queryFn: async () => (await api.get<EtapaNap[]>('/api/educacao/etapas-nap')).data,
    });
    const etapas = etapasQuery.data ?? [];

    if (etapasQuery.isLoading && etapas.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator/>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Ligação NAP</Text>
            {etapasQuery.isError ? <Text style={styles.errorText}>Erro ao carregar as etapas.</Text> : null}
            <Tabs
                tabs={etapas.map((etapa) => ({
                    key: String(etapa.id),
                    label: etapa.descricao || `Etapa ${etapa.id}`,
                    content: (
                        <ModuleList
                            path="/api/view/nap/listLigacaoNap"
                            params={{etapasNapId: etapa.id}}
                            extraActions={extraActions}
                            outcome="view/nap/listLigacaoNap/actions"
                            hideCreate={true}
                            hideUpdate={true}
                            hideDelete={true}
                        />
                    ),
                }))}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, padding: 16},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    title: {fontSize: 22, fontWeight: 'bold', color: '#2b2b2b', marginBottom: 12},
    errorText: {color: '#a61b29', fontSize: 14, marginBottom: 8},
});
