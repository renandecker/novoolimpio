import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { alunoApi, Boletim, formatarData, formatarNota, formatarPercentual } from '../aluno';

const STATUS_ROTULO: Record<string, string> = {
  APROVADO: 'Aprovado',
  'EM EXAME': 'Em exame',
  'REPROVADO POR FREQUÊNCIA': 'Reprovado por frequência',
  'SEM NOTAS': 'Sem notas',
};

const STATUS_COLOR: Record<string, string> = {
  APROVADO: '#1e7e34',
  'EM EXAME': '#a06b00',
  'REPROVADO POR FREQUÊNCIA': '#a61b29',
  'SEM NOTAS': '#666',
};

export default function AlunoBoletimScreen() {
  const [boletins, setBoletins] = useState<Boletim[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let active = true;
    alunoApi
      .boletim()
      .then((data) => {
        if (active) setBoletins(data ?? []);
      })
      .catch((e: any) => {
        if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar o boletim.');
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (busy) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.page}>
        <Text style={styles.title}>Boletim</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (boletins.length === 0) {
    return (
      <View style={styles.page}>
        <Text style={styles.title}>Boletim</Text>
        <Text style={styles.empty}>Nenhum boletim encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Boletim</Text>
      {boletins.map((b) => (
        <View style={styles.section} key={b.matricula.id}>
          <View style={styles.itemHeader}>
            <View style={styles.itemHeaderText}>
              <Text style={styles.itemTitle}>{b.matricula.componente || b.matricula.curso || 'Disciplina'}</Text>
              <Text style={styles.itemMeta}>
                {[b.matricula.curso, b.matricula.turma ? `Turma ${b.matricula.turma}` : null, b.matricula.periodo]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLOR[b.status] ?? '#666') + '22' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLOR[b.status] ?? '#666' }]}>
                {STATUS_ROTULO[b.status] ?? b.status}
              </Text>
            </View>
          </View>

          {b.graus.map((grau) => (
            <View style={styles.grau} key={grau.id}>
              <Text style={styles.grauTitle}>{grau.descricao}</Text>
              {grau.notas.length === 0 ? (
                <Text style={styles.empty}>Sem notas lançadas.</Text>
              ) : (
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCell, styles.tableCellWide, styles.tableHeaderText]}>Avaliação</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText]}>Peso</Text>
                    <Text style={[styles.tableCell, styles.tableHeaderText]}>Nota</Text>
                  </View>
                  {grau.notas.map((nota) => (
                    <View style={styles.tableRow} key={nota.id}>
                      <Text style={[styles.tableCell, styles.tableCellWide]}>
                        {nota.nome}
                        {nota.numeroNota ? ` (${nota.numeroNota}ª)` : ''}
                      </Text>
                      <Text style={styles.tableCell}>{nota.peso != null ? formatarNota(nota.peso) : '-'}</Text>
                      <Text style={styles.tableCell}>
                        {nota.nota != null ? formatarNota(nota.nota) : 'pendente'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {grau.mediaFinal != null && grau.mediaFinal !== grau.mediaSemExame && (
                <Text style={styles.grauFooter}>
                  Média para aprovação: <Text style={styles.bold}>{formatarNota(grau.mediaFinal)}</Text>
                </Text>
              )}
            </View>
          ))}

          <View style={styles.itemData}>
            <Text style={styles.itemDataText}>
              <Text style={styles.bold}>Média final:</Text> {formatarNota(b.media)}
            </Text>
            <Text style={styles.itemDataText}>
              <Text style={styles.bold}>Frequência:</Text> {formatarPercentual(b.frequenciaPerc)}
            </Text>
          </View>
        </View>
      ))}
      <Text style={styles.emitted}>Emitido em {formatarData(new Date().toISOString())}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  content: { paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2b2b2b', marginBottom: 12 },
  errorText: { color: '#a61b29', fontSize: 14 },
  empty: { color: '#888', fontSize: 13, marginTop: 4 },
  section: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, padding: 14, marginBottom: 14 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemHeaderText: { flex: 1, marginRight: 8 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#2b2b2b' },
  itemMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  grau: { marginTop: 14 },
  grauTitle: { fontSize: 14, fontWeight: '700', color: '#2b2b2b', marginBottom: 6 },
  table: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 6, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee' },
  tableHeader: { backgroundColor: '#f4f7fa' },
  tableHeaderText: { fontWeight: '700', color: '#555' },
  tableCell: { flex: 1, fontSize: 12, color: '#333', padding: 8, textAlign: 'center' },
  tableCellWide: { flex: 2, textAlign: 'left' },
  grauFooter: { fontSize: 12, color: '#555', marginTop: 6 },
  bold: { fontWeight: '700', color: '#2b2b2b' },
  itemData: { flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
  itemDataText: { fontSize: 13, color: '#444', marginRight: 16 },
  emitted: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 4 },
});
