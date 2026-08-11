import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './api';

export interface ModeloEmail {
  id: number;
  descricao: string;
  assunto: string;
  mensagem: string;
}

export interface AlunoLote {
  contratoId: number;
  aluno: string;
  contratante: string;
  email: string | null;
}

export interface SituacaoOption {
  value: string;
  label: string;
}

export const SITUACOES_NAP: SituacaoOption[] = [
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'AGENDADO', label: 'Agendado' },
  { value: 'AGENDADO_SEM_RETORNO', label: 'Agendado sem retorno' },
  { value: 'COMUNICADO', label: 'Comunicado' },
  { value: 'CONTRATO_RECORENTE', label: 'Contrato recorrente' },
  { value: 'PRIORITARIO', label: 'Prioritário' },
  { value: 'PRIORITARIO_ATRASADO', label: 'Prioritário atrasado' },
  { value: 'RETORNO', label: 'Retorno' },
  { value: 'SEM_RETORNO', label: 'Sem retorno' },
];

export const SITUACOES_COBRANCA: SituacaoOption[] = [
  { value: 'NUNCA_CONTATADO', label: 'Nunca contatado' },
  { value: 'AGENDADO', label: 'Agendado' },
  { value: 'AGENDADO_ATRASADO', label: 'Agendado atrasado' },
  { value: 'CONTATADO_HOJE', label: 'Contatado hoje' },
  { value: 'CONTATO_PENDENTE', label: 'Contato pendente' },
  { value: 'CONTATO_RECORRENTE', label: 'Contato recorrente' },
  { value: 'PRIORITARIO', label: 'Prioritário' },
  { value: 'PRIORITARIO_ATRASADO', label: 'Prioritário atrasado' },
];

interface LoteApiProps {
  basePath: string;
  etapaKey: 'etapasNapId' | 'etapasCobrancaId';
  etapaId: number;
  etapaLabel: string;
  situacoes: SituacaoOption[];
  onClose: () => void;
}

const apiError = (error: unknown) =>
  (error as { response?: { data?: { error?: string } } })?.response?.data?.error
  ?? (error as Error)?.message
  ?? 'erro desconhecido';

function SituacaoPicker({
  situacoes,
  value,
  onChange,
}: {
  situacoes: SituacaoOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = situacoes.find((s) => s.value === value);
  return (
    <View>
      <Text style={styles.fieldLabel}>Situação</Text>
      <Pressable style={styles.picker} onPress={() => setOpen(true)}>
        <Text style={styles.pickerText}>{current?.label ?? 'Selecione'}</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={styles.optionsBox}>
            <ScrollView>
              {situacoes.map((s) => (
                <Pressable
                  key={s.value}
                  style={styles.option}
                  onPress={() => {
                    onChange(s.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, s.value === value && styles.optionTextActive]}>{s.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function AlunoRow({
  aluno,
  selected,
  onToggle,
}: {
  aluno: AlunoLote;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onToggle}>
      <Text style={[styles.checkbox, selected && styles.checkboxChecked]}>{selected ? '☑' : '☐'}</Text>
      <View style={styles.rowMain}>
        <Text style={styles.rowText}>{aluno.aluno}</Text>
        <Text style={styles.rowDetail}>
          {aluno.contratante} {aluno.email ? `· ${aluno.email}` : '· sem e-mail'}
        </Text>
      </View>
    </Pressable>
  );
}

export function LoteEmailModal({ basePath, etapaKey, etapaId, etapaLabel, situacoes, onClose }: LoteApiProps) {
  const [situacao, setSituacao] = useState(situacoes[0]?.value ?? '');
  const [q, setQ] = useState('');
  const [mensagemId, setMensagemId] = useState<number | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [enviado, setEnviado] = useState<{ processados: number; semEmail: number } | null>(null);
  const [error, setError] = useState('');

  const modelosQuery = useQuery({
    queryKey: [basePath, 'modelos-email'],
    queryFn: async () => (await api.get<ModeloEmail[]>(`${basePath}/modelos-email`)).data,
  });
  const modelos = modelosQuery.data ?? [];
  const modelo = modelos.find((m) => m.id === mensagemId) ?? null;

  const alunosQuery = useQuery({
    queryKey: [basePath, 'alunos', etapaKey, etapaId, situacao, q],
    queryFn: async () =>
      (
        await api.get<{ alunos: AlunoLote[]; total: number }>(`${basePath}/alunos`, {
          params: { [etapaKey]: etapaId, situacao, tipo: 0, q },
        })
      ).data,
  });
  const alunos = alunosQuery.data?.alunos ?? [];

  const toggle = (contratoId: number) =>
    setSelected((prev) =>
      prev.includes(contratoId) ? prev.filter((id) => id !== contratoId) : [...prev, contratoId],
    );

  const toggleTodos = () =>
    setSelected((prev) => {
      const ids = alunos.map((a) => a.contratoId);
      const todosSelecionados = ids.every((id) => prev.includes(id));
      return todosSelecionados ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]));
    });

  const enviarMutation = useMutation({
    mutationFn: async () =>
      (
        await api.post<{ processados: number; semEmail: number }>(`${basePath}/email`, {
          [etapaKey]: etapaId,
          mensagemId,
          contratoIds: selected,
        })
      ).data,
    onSuccess: (data) => setEnviado(data),
    onError: (err) => setError(apiError(err)),
  });

  const todasSelecionadas = alunos.length > 0 && alunos.every((a) => selected.includes(a.contratoId));

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>E-mail em lote · {etapaLabel}</Text>
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.fieldLabel}>Modelo de e-mail</Text>
            {modelosQuery.isLoading ? (
              <ActivityIndicator />
            ) : (
              <View>
                {modelos.map((m) => (
                  <Pressable
                    key={m.id}
                    style={[styles.option, mensagemId === m.id && styles.optionSelected]}
                    onPress={() => setMensagemId(m.id)}
                  >
                    <Text style={[styles.optionText, mensagemId === m.id && styles.optionTextActive]}>{m.descricao}</Text>
                  </Pressable>
                ))}
                {modelos.length === 0 && <Text style={styles.empty}>Nenhum modelo disponível.</Text>}
              </View>
            )}
            {modelo && (
              <View style={styles.preview}>
                <Text style={styles.previewTitle}>{modelo.assunto}</Text>
                <Text style={styles.previewBody}>{modelo.mensagem}</Text>
              </View>
            )}

            <SituacaoPicker
              situacoes={situacoes}
              value={situacao}
              onChange={(value) => {
                setSituacao(value);
                setSelected([]);
              }}
            />
            <Text style={styles.fieldLabel}>Buscar aluno</Text>
            <TextInput
              style={styles.fieldInput}
              value={q}
              onChangeText={setQ}
              placeholder="Nome do aluno ou contratante"
              placeholderTextColor="#9a9a9a"
            />

            <View style={styles.selectionBar}>
              <Pressable style={styles.rowButton} onPress={toggleTodos} disabled={alunos.length === 0}>
                <Text style={styles.rowButtonText}>{todasSelecionadas ? 'Desmarcar todos' : 'Selecionar todos'}</Text>
              </Pressable>
              <Text style={styles.countText}>{selected.length} selecionado(s)</Text>
            </View>

            {alunosQuery.isLoading ? (
              <ActivityIndicator style={{ marginVertical: 12 }} />
            ) : alunos.length === 0 ? (
              <Text style={styles.empty}>Nenhum aluno encontrado para a situação selecionada.</Text>
            ) : (
              <FlatList
                data={alunos}
                keyExtractor={(a) => String(a.contratoId)}
                renderItem={({ item }) => (
                  <AlunoRow aluno={item} selected={selected.includes(item.contratoId)} onToggle={() => toggle(item.contratoId)} />
                )}
              />
            )}

            {error ? <Text style={styles.errorText}>Falha: {error}</Text> : null}

            {enviado ? (
              <Text style={styles.notice}>
                {enviado.processados} e-mail(s) registrado(s)
                {enviado.semEmail > 0 ? `, ${enviado.semEmail} aluno(s) sem e-mail cadastrado` : ''}.
              </Text>
            ) : (
              <Pressable
                style={[styles.primaryButton, (selected.length === 0 || !mensagemId || enviarMutation.isPending) && styles.buttonDisabled]}
                disabled={selected.length === 0 || !mensagemId || enviarMutation.isPending}
                onPress={() => enviarMutation.mutate()}
              >
                <Text style={styles.primaryButtonText}>
                  {enviarMutation.isPending ? 'Enviando...' : `Enviar e-mails (${selected.length})`}
                </Text>
              </Pressable>
            )}
          </ScrollView>
          <View style={styles.modalActions}>
            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.modalButtonText}>{enviado ? 'Concluir' : 'Cancelar'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function LoteLigacaoModal({ basePath, etapaKey, etapaId, etapaLabel, situacoes, onClose }: LoteApiProps) {
  const [situacao, setSituacao] = useState(situacoes[0]?.value ?? '');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [resultado, setResultado] = useState<{ processados: number } | null>(null);
  const [error, setError] = useState('');

  const alunosQuery = useQuery({
    queryKey: [basePath, 'alunos', etapaKey, etapaId, situacao, q],
    queryFn: async () =>
      (
        await api.get<{ alunos: AlunoLote[]; total: number }>(`${basePath}/alunos`, {
          params: { [etapaKey]: etapaId, situacao, tipo: 1, q },
        })
      ).data,
  });
  const alunos = alunosQuery.data?.alunos ?? [];

  const iniciarMutation = useMutation({
    mutationFn: async () =>
      (
        await api.post<{ processados: number }>(`${basePath}/ligacao`, {
          [etapaKey]: etapaId,
          contratoIds: selected,
        })
      ).data,
    onSuccess: (data) => setResultado(data),
    onError: (err) => setError(apiError(err)),
  });

  const toggle = (contratoId: number) =>
    setSelected((prev) =>
      prev.includes(contratoId) ? prev.filter((id) => id !== contratoId) : [...prev, contratoId],
    );

  const toggleTodos = () =>
    setSelected((prev) => {
      const ids = alunos.map((a) => a.contratoId);
      const todosSelecionados = ids.every((id) => prev.includes(id));
      return todosSelecionados ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]));
    });

  const todasSelecionadas = alunos.length > 0 && alunos.every((a) => selected.includes(a.contratoId));

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Ligação em lote · {etapaLabel}</Text>
          <ScrollView style={styles.modalScroll}>
            {resultado ? (
              <Text style={styles.notice}>{resultado.processados} ligação(ões) iniciada(s).</Text>
            ) : (
              <>
                <SituacaoPicker
                  situacoes={situacoes}
                  value={situacao}
                  onChange={(value) => {
                    setSituacao(value);
                    setSelected([]);
                  }}
                />
                <Text style={styles.fieldLabel}>Buscar aluno</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={q}
                  onChangeText={setQ}
                  placeholder="Nome do aluno ou contratante"
                  placeholderTextColor="#9a9a9a"
                />

                <View style={styles.selectionBar}>
                  <Pressable style={styles.rowButton} onPress={toggleTodos} disabled={alunos.length === 0}>
                    <Text style={styles.rowButtonText}>{todasSelecionadas ? 'Desmarcar todos' : 'Selecionar todos'}</Text>
                  </Pressable>
                  <Text style={styles.countText}>{selected.length} selecionado(s)</Text>
                </View>

                {alunosQuery.isLoading ? (
                  <ActivityIndicator style={{ marginVertical: 12 }} />
                ) : alunos.length === 0 ? (
                  <Text style={styles.empty}>Nenhum aluno encontrado para a situação selecionada.</Text>
                ) : (
                  <FlatList
                    data={alunos}
                    keyExtractor={(a) => String(a.contratoId)}
                    renderItem={({ item }) => (
                      <AlunoRow aluno={item} selected={selected.includes(item.contratoId)} onToggle={() => toggle(item.contratoId)} />
                    )}
                  />
                )}

                {error ? <Text style={styles.errorText}>Falha: {error}</Text> : null}

                <Pressable
                  style={[styles.primaryButton, (selected.length === 0 || iniciarMutation.isPending) && styles.buttonDisabled]}
                  disabled={selected.length === 0 || iniciarMutation.isPending}
                  onPress={() => iniciarMutation.mutate()}
                >
                  <Text style={styles.primaryButtonText}>
                    {iniciarMutation.isPending ? 'Iniciando...' : `Iniciar ligações (${selected.length})`}
                  </Text>
                </Pressable>
              </>
            )}
          </ScrollView>
          <View style={styles.modalActions}>
            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.modalButtonText}>{resultado ? 'Concluir' : 'Cancelar'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 16 },
  modalBox: { backgroundColor: '#ffffff', borderRadius: 10, padding: 16, maxHeight: '92%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2b2b2b', marginBottom: 10 },
  modalScroll: { flexGrow: 0 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  modalButton: { borderRadius: 4, paddingHorizontal: 16, paddingVertical: 8, marginLeft: 8 },
  cancelButton: { backgroundColor: '#e0e0e0' },
  modalButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#616161', marginBottom: 3, marginTop: 10 },
  fieldInput: { borderWidth: 1, borderColor: '#c9c9c9', borderRadius: 4, padding: 8, fontSize: 15, color: '#2b2b2b', backgroundColor: '#ffffff' },
  picker: { borderWidth: 1, borderColor: '#c9c9c9', borderRadius: 4, padding: 8, backgroundColor: '#ffffff' },
  pickerText: { fontSize: 15, color: '#2b2b2b' },
  optionsBox: { backgroundColor: '#ffffff', borderRadius: 10, padding: 8, marginHorizontal: 40 },
  option: { paddingVertical: 10, paddingHorizontal: 12 },
  optionSelected: { backgroundColor: '#eef1f5' },
  optionText: { fontSize: 15, color: '#2b2b2b' },
  optionTextActive: { color: '#2a5a88', fontWeight: '700' },
  preview: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 4, padding: 8, marginTop: 10, backgroundColor: '#fafafa' },
  previewTitle: { fontSize: 14, fontWeight: '700', color: '#2b2b2b', marginBottom: 4 },
  previewBody: { fontSize: 13, color: '#555' },
  selectionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  rowButton: { backgroundColor: '#eef1f5', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6 },
  rowButtonText: { color: '#2a5a88', fontSize: 13, fontWeight: '600' },
  countText: { fontSize: 13, color: '#666' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  checkbox: { fontSize: 18, marginRight: 10, color: '#999' },
  checkboxChecked: { color: '#2a5a88' },
  rowMain: { flex: 1 },
  rowText: { fontSize: 15, color: '#2b2b2b' },
  rowDetail: { fontSize: 12, color: '#888', marginTop: 2 },
  empty: { textAlign: 'center', color: '#888', marginTop: 12 },
  notice: { backgroundColor: '#e8f4e8', borderWidth: 1, borderColor: '#a3d3a3', borderRadius: 4, padding: 8, marginVertical: 8, color: '#2e7d32', fontSize: 14 },
  errorText: { color: '#a61b29', fontSize: 13, marginTop: 8 },
  primaryButton: { backgroundColor: '#2a5a88', borderRadius: 4, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  buttonDisabled: { opacity: 0.5 },
});
