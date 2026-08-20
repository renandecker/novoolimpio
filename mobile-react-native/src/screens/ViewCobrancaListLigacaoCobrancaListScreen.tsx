import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {Tabs} from '../Tabs';
import {ModuleList} from '../ModuleListScreen';

interface EtapaCobranca {
    id: number;
    descricao: string;
}

export default function ViewCobrancaListLigacaoCobrancaListScreen() {
    const etapasQuery = useQuery({
        queryKey: ['etapas-cobranca'],
        queryFn: async () => (await api.get<EtapaCobranca[]>('/api/financeiro/etapas-cobranca')).data,
    });
    const etapas = etapasQuery.data ? ? [];

    if (etapasQuery.isLoading && etapas.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator/>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Ligação Cobrança</Text>
            {etapasQuery.isError ? <Text style={styles.errorText}>Erro ao carregar as etapas.</Text> : null}
            <Tabs
                tabs={etapas.map((etapa) => ({
                    key: String(etapa.id),
                    label: etapa.descricao || `Etapa ${etapa.id}`,
                    content: (
                        <ModuleList
                            path="/api/view/cobranca/listLigacaoCobranca"
                            params={{etapasCobrancaId: etapa.id}}
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
