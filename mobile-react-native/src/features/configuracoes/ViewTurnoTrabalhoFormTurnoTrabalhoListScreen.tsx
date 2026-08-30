import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../api';
import { MasterDetail } from '../MasterDetail';
import type { ApiItem } from '../types';

type DiaSemanaOpt = { id: number; nome: string };

const maskHora = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
};

const validarHora = (hhmm: string): string | null => {
  if (!hhmm || hhmm.length !== 5) return 'Hora deve ter 5 dígitos. Ex.: 08:30';
  if (!hhmm.includes(':')) return 'Hora deve seguir o padrão Ex.: 08:30';
  const [h, m] = hhmm.split(':');
  if (h.length !== 2 || m.length !== 2) return 'Hora deve seguir o padrão Ex.: 08:30';
  const hi = Number(h);
  const mi = Number(m);
  if (Number.isNaN(hi) || Number.isNaN(mi)) return 'Hora deve seguir o padrão Ex.: 08:30';
  if (hi < 0 || hi >= 24) return 'Hora deve estar no intervalo de 0 a 23h.';
  if (mi < 0 || mi >= 60) return 'Minuto deve estar no intervalo de 0 a 59m.';
  return null;
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const UNIDADE_SOURCE = '/api/view/unidade/listUnidade';
const UNIDADE_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'sucinto', label: 'Sucinto' },
  { key: 'razaoSocial', label: 'Razão Social' },
];
const UNIDADE_SEARCH = ['sucinto', 'razaoSocial', 'nomeFantasia'];

export default function ViewTurnoTrabalhoFormTurnoTrabalhoListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editingId: number | null = route.params?.id != null ? Number(route.params.id) : null;
  const isEdit = editingId !== null && !Number.isNaN(editingId);

  const [descricao, setDescricao] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [diaSemanaId, setDiaSemanaId] = useState<string>('');
  const [diaOpts, setDiaOpts] = useState<DiaSemanaOpt[]>([]);
  const [diaPickerOpen, setDiaPickerOpen] = useState(false);
  const [unidades, setUnidades] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<DiaSemanaOpt[]>('/api/central/turno-trabalho/dia-semana/opcoes')
      .then((res) => setDiaOpts(res.data ?? []))
      .catch(async () => {
        try {
          const v = await api.get<any[]>('/api/view/diaSemana/listDiaSemana');
          if (Array.isArray(v.data)) setDiaOpts(v.data.map((r: any) => ({ id: Number(r.id), nome: String(r.nome ?? r.descricao ?? '') })));
        } catch {}
      });
  }, []);

  useEffect(() => {
    if (!isEdit || editingId === null) return;
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const ent = (await api.get<any>(`/api/central/turno-trabalho/${editingId}`)).data;
        if (!alive) return;
        setDescricao(String(ent.descricao ?? ''));
        setInicio(String(ent.inicio ?? ''));
        setFim(String(ent.fim ?? ''));
        setDiaSemanaId(ent.diaSemanaId != null ? String(ent.diaSemanaId) : ent.id_dia_semana != null ? String(ent.id_dia_semana) : '');
        const uids: number[] = Array.isArray(ent.unidadeIds) ? ent.unidadeIds.map((n: any) => Number(n)) : [];
        if (uids.length > 0) {
          const us: ApiItem[] = [];
          for (const uid of uids) {
            try {
              const u = (await api.get<any>(`/api/view/unidade/listUnidade/${uid}`)).data;
              us.push({ id: Number(u.id), nome: String(u.sucinto ?? `#${uid}`) } as any);
              (us[us.length - 1] as any).sucinto = u.sucinto;
              (us[us.length - 1] as any).razaoSocial = u.razao_social ?? u.razaoSocial;
            } catch {
              us.push({ id: uid, nome: `#${uid}` } as ApiItem);
            }
          }
          setUnidades(us);
        }
      } catch (e: any) {
        try {
          const ent2 = (await api.get<any>(`/api/view/turnoTrabalho/listTurnoTrabalho/${editingId}`)).data;
          if (!alive) return;
          setDescricao(String(ent2.descricao ?? ''));
          setInicio(String(ent2.inicio ?? ''));
          setFim(String(ent2.fim ?? ''));
          setDiaSemanaId(ent2.id_dia_semana != null ? String(ent2.id_dia_semana) : '');
        } catch (e2: any) {
          setError(e2?.response?.data?.error ?? 'Erro ao carregar Turno.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [editingId, isEdit]);

  const validate = (): string | null => {
    const d = descricao.trim();
    if (!d) return 'Descrição é obrigatória.';
    if (d.length < 3) return 'Descrição deve ter no mínimo 3 caracteres.';
    if (d.length > 255) return 'Descrição deve ter no máximo 255 caracteres.';
    const ini = inicio.trim();
    const f = fim.trim();
    if (!ini) return 'Início é obrigatório (99:99).';
    if (!f) return 'Fim é obrigatório (99:99).';
    const e1 = validarHora(ini);
    if (e1) return e1;
    const e2 = validarHora(f);
    if (e2) return e2;
    if (toMinutes(f) - toMinutes(ini) <= 0) return 'A hora de início deve ser inferior à hora final.';
    if (!diaSemanaId) return 'Dia da semana é obrigatório.';
    if (!unidades || unidades.length === 0) return 'Selecione pelo menos uma unidade';
    return null;
  };

  const handleSave = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      Alert.alert('Validação', msg);
      return;
    }
    setSaving(true);
    setError('');
    const body: Record<string, unknown> = {
      descricao: descricao.trim(),
      inicio: inicio.trim(),
      fim: fim.trim(),
      diaSemanaId: Number(diaSemanaId),
      unidadeIds: unidades.map((u: any) => u.id),
    };
    try {
      if (isEdit && editingId !== null) {
        await api.put(`/api/central/turno-trabalho/${editingId}`, body);
      } else {
        await api.post('/api/central/turno-trabalho', body);
      }
      Alert.alert('Sucesso', 'Turno de Trabalho salvo com sucesso.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      const srv = e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? 'Erro ao salvar.';
      // fallback ViewService
      try {
        const vsBody: Record<string, unknown> = {
          descricao: descricao.trim(),
          inicio: inicio.trim(),
          fim: fim.trim(),
          id_dia_semana: Number(diaSemanaId),
          unidadeIds: unidades.map((u: any) => u.id),
        };
        if (isEdit && editingId !== null) {
          await api.put(`/api/view/turnoTrabalho/listTurnoTrabalho/${editingId}`, vsBody);
        } else {
          await api.post('/api/view/turnoTrabalho/listTurnoTrabalho', vsBody);
        }
        Alert.alert('Sucesso', 'Turno salvo (ViewService).', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } catch {
        setError(srv);
        Alert.alert('Erro', srv);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  const diaLabel = diaOpts.find((o) => String(o.id) === diaSemanaId)?.nome ?? (diaSemanaId ? `#${diaSemanaId}` : '-- Selecione --');

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 12, gap: 12 }}>
      <View style={styles.header}>
        <Text style={styles.title}>{isEdit ? `Editar Turno #${editingId}` : 'Novo Turno de Trabalho'}</Text>
        <Pressable style={styles.btnBack} onPress={() => navigation.goBack()}>
          <Text style={styles.btnBackText}>Voltar</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <Text style={styles.formTitle}>Turno de Trabalho</Text>

        <Text style={styles.label}>Id</Text>
        <TextInput style={[styles.input, styles.inputDisabled]} value={isEdit ? String(editingId) : ''} editable={false} placeholder="(novo)" />

        <Text style={styles.label}>
          Descrição <Text style={styles.req}>*</Text>
        </Text>
        <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} maxLength={255} placeholder="Ex.: Manhã, Tarde..." />

        <Text style={styles.label}>
          Início <Text style={styles.req}>*</Text> (99:99)
        </Text>
        <TextInput style={styles.input} value={inicio} onChangeText={(v) => setInicio(maskHora(v))} placeholder="08:00" maxLength={5} keyboardType="numeric" />

        <Text style={styles.label}>
          Fim <Text style={styles.req}>*</Text> (99:99)
        </Text>
        <TextInput style={styles.input} value={fim} onChangeText={(v) => setFim(maskHora(v))} placeholder="12:00" maxLength={5} keyboardType="numeric" />

        <Text style={styles.label}>
          Dia Semana <Text style={styles.req}>*</Text>
        </Text>
        <Pressable style={styles.picker} onPress={() => setDiaPickerOpen((o) => !o)}>
          <Text style={styles.pickerText}>{diaLabel}</Text>
          <Text style={styles.pickerArrow}>{diaPickerOpen ? '▲' : '▼'}</Text>
        </Pressable>
        {diaPickerOpen && (
          <View style={styles.pickerList}>
            {diaOpts.map((o) => (
              <Pressable
                key={o.id}
                style={[styles.pickerItem, String(o.id) === diaSemanaId && styles.pickerItemSelected]}
                onPress={() => {
                  setDiaSemanaId(String(o.id));
                  setDiaPickerOpen(false);
                }}
              >
                <Text style={styles.pickerItemText}>{o.nome}</Text>
              </Pressable>
            ))}
            {diaOpts.length === 0 && <Text style={styles.empty}>Nenhum dia cadastrado.</Text>}
          </View>
        )}

        <View style={{ marginTop: 8 }}>
          <MasterDetail label="Unidade" source={UNIDADE_SOURCE} valueKey="id" searchKeys={UNIDADE_SEARCH} columns={UNIDADE_COLUMNS} items={unidades} onChange={setUnidades} />
          <Text style={styles.hint}>Selecione pelo menos uma unidade.</Text>
        </View>

        <Text style={styles.hint}>Campos com * são obrigatórios. Descrição 3–255. Horários 99:99 e início &lt; fim.</Text>

        <View style={styles.footer}>
          <Pressable style={[styles.btn, styles.btnBack]} onPress={() => navigation.goBack()} disabled={saving}>
            <Text style={styles.btnBackText}>Cancelar</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleSave} disabled={saving}>
            <Text style={styles.btnPrimaryText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f2f2f2' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  title: { fontSize: 16, fontWeight: '800', color: '#111' },
  btnBack: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: '#e5e7eb' },
  btnBackText: { color: '#374151', fontWeight: '700' },
  errorBox: { backgroundColor: '#FDE8E8', borderWidth: 1, borderColor: '#F5C2C2', padding: 10, borderRadius: 6 },
  errorText: { color: '#8A1F1F' },
  form: { backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 6 },
  formTitle: { fontWeight: '800', color: '#374151', marginBottom: 8, fontSize: 15 },
  label: { fontWeight: '700', color: '#374151', marginTop: 6 },
  req: { color: '#C90000' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff' },
  inputDisabled: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  picker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff' },
  pickerText: { color: '#111', flex: 1 },
  pickerArrow: { color: '#6b7280', marginLeft: 8 },
  pickerList: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, backgroundColor: '#fff', marginTop: 4, maxHeight: 180 },
  pickerItem: { paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  pickerItemSelected: { backgroundColor: '#eef2ff' },
  pickerItemText: { color: '#111' },
  empty: { padding: 10, color: '#888', fontStyle: 'italic' },
  hint: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  footer: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#2a5a88' },
  btnPrimaryText: { color: '#fff', fontWeight: '800' },
});
