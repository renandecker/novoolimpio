import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Tabs } from '../Tabs';
import { LoteEmailModal, LoteLigacaoModal, SITUACOES_NAP } from '../LoteModals';

interface EtapaNap {
  id: number;
  descricao: string;
}

const BASE_PATH = '/api/educacao/nap/lote';

export default function ViewNapListLoteListScreen() {
  const etapasQuery = useQuery({
    queryKey: ['etapas-nap'],
    queryFn: async () => (await api.get<EtapaNap[]>('/api/educacao/etapas-nap')).data,
  });
  const etapas = etapasQuery.data ?? [];
  const [emailEtapa, setEmailEtapa] = useState<EtapaNap | null>(null);
  const [ligacaoEtapa, setLigacaoEtapa] = useState<EtapaNap | null>(null);

  if (etapasQuery.isLoading && etapas.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Text style={styles.title}>NAP em lote</Text>
      {etapasQuery.isError ? <Text style={styles.errorText}>Erro ao carregar as etapas.</Text> : null}
      <Tabs
        tabs={etapas.map((etapa) => ({
          key: String(etapa.id),
          label: etapa.descricao || `Etapa ${etapa.id}`,
          content: (
            <View style={styles.actions}>
              <Pressable style={[styles.actionButton, styles.emailButton]} onPress={() => setEmailEtapa(etapa)}>
                <Text style={styles.actionButtonText}>@ E-mail</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, styles.ligacaoButton]} onPress={() => setLigacaoEtapa(etapa)}>
                <Text style={styles.actionButtonText}>Ligação</Text>
              </Pressable>
            </View>
          ),
        }))}
      />
      {emailEtapa && (
        <LoteEmailModal
          basePath={BASE_PATH}
          etapaKey="etapasNapId"
          etapaId={emailEtapa.id}
          etapaLabel={emailEtapa.descricao || `Etapa ${emailEtapa.id}`}
          situacoes={SITUACOES_NAP}
          onClose={() => setEmailEtapa(null)}
        />
      )}
      {ligacaoEtapa && (
        <LoteLigacaoModal
          basePath={BASE_PATH}
          etapaKey="etapasNapId"
          etapaId={ligacaoEtapa.id}
          etapaLabel={ligacaoEtapa.descricao || `Etapa ${ligacaoEtapa.id}`}
          situacoes={SITUACOES_NAP}
          onClose={() => setLigacaoEtapa(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2b2b2b', marginBottom: 12 },
  errorText: { color: '#a61b29', fontSize: 14, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 8, paddingVertical: 16 },
  actionButton: { borderRadius: 4, paddingHorizontal: 16, paddingVertical: 8 },
  emailButton: { backgroundColor: '#2a5a88' },
  ligacaoButton: { backgroundColor: '#faa523' },
  actionButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});
