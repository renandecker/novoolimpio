import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';

import {Wizard} from '../../shared/components/Wizard';
import type {WizardStep} from '../../shared/components/Wizard';
import {AutoComplete} from '../../shared/components/AutoComplete';
import type {AutoCompleteOption} from '../../shared/components/AutoComplete';
import {Alert} from '../../shared/components/SweetAlert';
import {useApi, api} from '../../shared/services/api';
import {Colors, Spacing, BorderRadius, Typography} from '../../shared/styles/theme';

const FORMATOS_TEXTO = [
    {value: 0, label: 'Normal'},
    {value: 1, label: 'Maiúsculo'},
    {value: 2, label: 'Minúsculo'},
    {value: 3, label: 'Capitalizar'},
];

const TIPOS_MEDIDA = [
    {value: 'PERCENTUAL', label: 'P (%)', color: Colors.btnBlue},
    {value: 'MOEDA', label: 'M (R$)', color: Colors.btnRed},
    {value: 'NUMERO', label: 'N (0,0)', color: Colors.btnYellow},
    {value: 'CONTAGEM', label: 'C', color: Colors.btnBlack},
    {value: 'CONTAGEM-DISTINTA', label: 'CD', color: Colors.btnGreen},
];

const QUEBRA_COLUNA = '<<quebra_coluna>>';

let seq = 0;

interface ColunaItem {
    id?: number;
    coluna: string;
    estruturaId?: number;
    _k: number;
    _pending?: boolean;
    _dirtyColuna?: boolean;
}

interface DimItem {
    id?: number;
    tipo: string;
    tipoInfo: string;
    nomeVisualizacao: string;
    estruturaColunaId?: number;
    estruturaId?: number;
    _colunaK?: number;
    _coluna?: string;
    _pending?: boolean;
    _dirty?: boolean;
    _k: number;
}

interface MedidaItem extends DimItem {}

interface GeoItem {
    id?: number;
    nomeVisualizacao: string;
    estruturaColunaId?: number;
    estruturaId?: number;
    _colunaK?: number;
    _coluna?: string;
    _pending?: boolean;
    _dirty?: boolean;
    _k: number;
}

interface EstruturaFormData {
    entity: {
        id?: number;
        nome?: string;
        tabela?: string;
        condicao?: string;
        nomeBanco?: string;
        coordenada?: string;
        zoom?: string;
        configuracaoEmailId?: number;
    };
    definicoes: {formatoTexto: number; simboloTexto: boolean};
    colunas: ColunaItem[];
    dimensoes: DimItem[];
    dimensoesTempo: DimItem[];
    medidas: MedidaItem[];
    georeferencias: GeoItem[];
}

interface RouteParams {
    id?: string | number;
    entityId?: string | number;
}

export default function ViewEstruturaFormEstruturaListScreen({
                                                                 route,
                                                                 navigation,
                                                             }: {
    route?: { params?: RouteParams };
    navigation?: { goBack?: () => void; navigate?: (name: string, params?: RouteParams) => void };
}) {
    const editId = route?.params?.id ?? route?.params?.entityId ?? null;
    const goBack = () => navigation?.goBack?.();

    const [data, setData] = useState<EstruturaFormData>({
        entity: {},
        definicoes: {formatoTexto: 0, simboloTexto: true},
        colunas: [],
        dimensoes: [],
        dimensoesTempo: [],
        medidas: [],
        georeferencias: [],
    });

    const [novaColunaSql, setNovaColunaSql] = useState('');
    const [configuracoesEmail, setConfiguracoesEmail] = useState<Array<{id: number; username: string}>>([]);
    const [token, setToken] = useState<AutoCompleteOption | null>(null);

    const [dimForm, setDimForm] = useState<{nomeVisualizacao: string; colunaK?: number}>({nomeVisualizacao: ''});
    const [tempoForm, setTempoForm] = useState<{nomeVisualizacao: string; colunaK?: number}>({nomeVisualizacao: ''});
    const [medForm, setMedForm] = useState<{nomeVisualizacao: string; tipoInfo: string; colunaK?: number}>({nomeVisualizacao: '', tipoInfo: 'PERCENTUAL'});
    const [geoForm, setGeoForm] = useState<{nomeVisualizacao: string; colunaK?: number}>({nomeVisualizacao: ''});

    const {post: saveEstrutura} = useApi('/api/relatorios/estrutura');
    const {put: updateEstrutura} = useApi('/api/relatorios/estrutura');
    const {get: loadColunas} = useApi('/api/relatorios/estrutura-coluna');
    const {get: loadDimensoes} = useApi('/api/relatorios/dimensao');
    const {get: loadMedidas} = useApi('/api/relatorios/medida');
    const {get: loadGeoreferencias} = useApi('/api/relatorios/georeferencia');
    const {post: createColuna} = useApi('/api/relatorios/estrutura-coluna');
    const {put: updateColuna} = useApi('/api/relatorios/estrutura-coluna');
    const {delete: deleteColuna} = useApi('/api/relatorios/estrutura-coluna');
    const {post: createDimensao} = useApi('/api/relatorios/dimensao');
    const {put: updateDimensao} = useApi('/api/relatorios/dimensao');
    const {delete: deleteDimensao} = useApi('/api/relatorios/dimensao');
    const {post: createMedida} = useApi('/api/relatorios/medida');
    const {put: updateMedida} = useApi('/api/relatorios/medida');
    const {delete: deleteMedida} = useApi('/api/relatorios/medida');
    const {post: createGeoreferencia} = useApi('/api/relatorios/georeferencia');
    const {put: updateGeoreferencia} = useApi('/api/relatorios/georeferencia');
    const {delete: deleteGeoreferencia} = useApi('/api/relatorios/georeferencia');

    const setEntity = (patch: Partial<EstruturaFormData['entity']>) =>
        setData((prev) => ({...prev, entity: {...prev.entity, ...patch}}));

    useEffect(() => {
        api.get<Array<{id: number; username: string}>>('/api/basico/configuracao-email')
            .then((res) => setConfiguracoesEmail(Array.isArray(res.data) ? res.data : []))
            .catch((err) => console.error('Erro ao carregar configurações de e-mail:', err));
    }, []);

    useEffect(() => {
        if (!editId) return;
        api.get<any>(`/api/relatorios/estrutura/${editId}`)
            .then(async (res) => {
                const estrutura = res.data ?? {};
                setData((prev) => ({...prev, entity: {...prev.entity, ...estrutura}}));
                if (estrutura.configuracaoEmailId) setToken({id: estrutura.configuracaoEmailId, label: String(estrutura.configuracaoEmailId)});

                const [colsRes, dimsRes, medsRes, geosRes] = await Promise.allSettled([
                    loadColunas(), loadDimensoes(), loadMedidas(), loadGeoreferencias(),
                ]);
                const cols: any[] = colsRes.status === 'fulfilled' ? colsRes.value : [];
                const dims: any[] = dimsRes.status === 'fulfilled' ? dimsRes.value : [];
                const meds: any[] = medsRes.status === 'fulfilled' ? medsRes.value : [];
                const geos: any[] = geosRes.status === 'fulfilled' ? geosRes.value : [];

                const colsDaEstrutura: ColunaItem[] = cols.filter((c) => c.estruturaId === editId).map((c) => ({...c, _k: seq++}));
                const colunaPara = (colunaId?: number) => colsDaEstrutura.find((c) => c.id === colunaId)?.coluna ?? '';

                const dimsDaEstrutura: DimItem[] = dims
                    .filter((d) => d.estruturaId === editId)
                    .map((d) => ({...d, _coluna: colunaPara(d.estruturaColunaId)}));

                setData((prev) => ({
                    ...prev,
                    colunas: colsDaEstrutura,
                    dimensoes: dimsDaEstrutura.filter((d) => d.tipoInfo === 'DESCRITIVO'),
                    dimensoesTempo: dimsDaEstrutura.filter((d) => d.tipoInfo === 'TEMPO'),
                    medidas: meds.filter((m) => m.estruturaId === editId),
                    georeferencias: geos.filter((g) => g.estruturaId === editId).map((g) => ({...g, _coluna: colunaPara(g.estruturaColunaId)})),
                }));
            })
            .catch((err) => console.error('Erro ao carregar estrutura:', err));
    }, [editId]);

    /* ── SQL: Colunas ─────────────────────────────────────────────────────────── */
    const addColunasLista = () => {
        const texto = novaColunaSql;
        if (!texto || !texto.trim()) return;
        let entradas: string[] = texto.includes(QUEBRA_COLUNA)
            ? texto.split(QUEBRA_COLUNA).map((col) => col.trim().replace(/,$/, ''))
            : [texto.trim()];
        const novas: ColunaItem[] = [...data.colunas];
        for (const col of entradas) {
            if (!col) continue;
            if (novas.some((c) => c.coluna === col)) continue;
            novas.push({coluna: col, _k: seq++, _pending: true});
        }
        setData((prev) => ({...prev, colunas: novas}));
        setNovaColunaSql('');
    };

    const updateColunaItem = (item: ColunaItem, valor: string) => {
        setData((prev) => ({
            ...prev,
            colunas: prev.colunas.map((c) => (c === item ? {...c, coluna: valor, _dirtyColuna: c.id ? true : c._dirtyColuna} : c)),
        }));
    };

    const removeColuna = async (item: ColunaItem) => {
        const ref = item.id;
        const dependentesDelete = async () => {
            if (ref === undefined) return;
            for (const d of [...data.dimensoes, ...data.dimensoesTempo]) {
                if (d.estruturaColunaId === ref && d.id) { try { await deleteDimensao(d.id); } catch (e) { console.error(e); } }
            }
            for (const m of data.medidas) {
                if (m.estruturaColunaId === ref && m.id) { try { await deleteMedida(m.id); } catch (e) { console.error(e); } }
            }
            for (const g of data.georeferencias) {
                if (g.estruturaColunaId === ref && g.id) { try { await deleteGeoreferencia(g.id); } catch (e) { console.error(e); } }
            }
        };
        if (item.id) {
            try {
                await dependentesDelete();
                await deleteColuna(item.id);
            } catch (e) { console.error('Erro ao remover coluna:', e); }
        }
        setData((prev) => ({
            ...prev,
            colunas: prev.colunas.filter((c) => c !== item),
            dimensoes: prev.dimensoes.filter((d) => d._colunaK !== item._k && d.estruturaColunaId !== ref),
            dimensoesTempo: prev.dimensoesTempo.filter((d) => d._colunaK !== item._k && d.estruturaColunaId !== ref),
            medidas: prev.medidas.filter((m) => m._colunaK !== item._k && m.estruturaColunaId !== ref),
            georeferencias: prev.georeferencias.filter((g) => g._colunaK !== item._k && g.estruturaColunaId !== ref),
        }));
    };

    /* ── Campos: adição / remoção / virar / tipo ──────────────────────────────── */
    const adicionarItem = (
        lista: (DimItem | GeoItem)[],
        setLista: (items: any[]) => void,
        form: {nomeVisualizacao: string; colunaK?: number},
        resetForm: () => void,
        extra: Partial<DimItem> = {},
    ) => {
        if (!form.nomeVisualizacao.trim()) return;
        const colunaAtual = data.colunas.find((c) => c._k === form.colunaK);
        setLista([...lista, {
            nomeVisualizacao: form.nomeVisualizacao.trim(),
            _colunaK: form.colunaK,
            _coluna: colunaAtual?.coluna ?? '',
            _pending: true,
            _k: seq++,
            ...extra,
        } as any]);
        resetForm();
    };

    const addDimensao = () =>
        adicionarItem(data.dimensoes, (items) => setData((p) => ({...p, dimensoes: items})), dimForm, () => setDimForm({nomeVisualizacao: ''}), {tipo: 'DIMENSAO', tipoInfo: 'DESCRITIVO'});

    const addDimensaoTempo = () =>
        adicionarItem(data.dimensoesTempo, (items) => setData((p) => ({...p, dimensoesTempo: items})), tempoForm, () => setTempoForm({nomeVisualizacao: ''}), {tipo: 'DIMENSAO', tipoInfo: 'TEMPO'});

    const addMedida = () => {
        if (!medForm.nomeVisualizacao.trim()) return;
        const colunaAtual = data.colunas.find((c) => c._k === medForm.colunaK);
        setData((p) => ({
            ...p,
            medidas: [...p.medidas, {
                nomeVisualizacao: medForm.nomeVisualizacao.trim(),
                tipo: 'MEDIDA',
                tipoInfo: medForm.tipoInfo,
                _colunaK: medForm.colunaK,
                _coluna: colunaAtual?.coluna ?? '',
                _pending: true,
                _k: seq++,
            }],
        }));
        setMedForm({nomeVisualizacao: '', tipoInfo: 'PERCENTUAL'});
    };

    const addGeoreferencia = () =>
        adicionarItem(data.georeferencias, (items) => setData((p) => ({...p, georeferencias: items})), geoForm, () => setGeoForm({nomeVisualizacao: ''}));

    const updateDimNome = (item: DimItem, valor: string) => {
        setData((p) => {
            const patch = (lista: DimItem[]) => lista.map((d) => (d === item ? {...d, nomeVisualizacao: valor, _dirty: d.id ? true : d._dirty} : d));
            return p.dimensoes.includes(item) ? {...p, dimensoes: patch(p.dimensoes)} : {...p, dimensoesTempo: patch(p.dimensoesTempo)};
        });
    };

    const updateGeoNome = (item: GeoItem, valor: string) => {
        setData((p) => ({...p, georeferencias: p.georeferencias.map((g) => (g === item ? {...g, nomeVisualizacao: valor, _dirty: g.id ? true : g._dirty} : g))}));
    };

    const removeDimensao = async (item: DimItem) => {
        if (item.id) { try { await deleteDimensao(item.id); } catch (e) { console.error('Erro ao remover dimensão:', e); } }
        setData((p) => (p.dimensoes.includes(item)
            ? {...p, dimensoes: p.dimensoes.filter((d) => d !== item)}
            : {...p, dimensoesTempo: p.dimensoesTempo.filter((d) => d !== item)}));
    };

    const removeMedida = async (item: MedidaItem) => {
        if (item.id) { try { await deleteMedida(item.id); } catch (e) { console.error('Erro ao remover medida:', e); } }
        setData((p) => ({...p, medidas: p.medidas.filter((m) => m !== item)}));
    };

    const removeGeoreferencia = async (item: GeoItem) => {
        if (item.id) { try { await deleteGeoreferencia(item.id); } catch (e) { console.error('Erro ao remover georeferência:', e); } }
        setData((p) => ({...p, georeferencias: p.georeferencias.filter((g) => g !== item)}));
    };

    const virarCoordenada = async (item: DimItem) => {
        if (item.id) {
            try {
                await deleteDimensao(item.id);
                await createGeoreferencia({nomeVisualizacao: item.nomeVisualizacao, estruturaId: editId ?? undefined, estruturaColunaId: item.estruturaColunaId});
            } catch (e) { console.error('Erro ao virar coordenada:', e); }
        }
        setData((p) => ({...p, dimensoes: p.dimensoes.filter((d) => d !== item), georeferencias: [...p.georeferencias, {...item, id: undefined} as GeoItem]}));
    };

    const virarDimensao = async (item: DimItem) => {
        if (item.id) {
            try {
                await deleteDimensao(item.id);
                await createDimensao({nomeVisualizacao: item.nomeVisualizacao, tipo: 'DIMENSAO', tipoInfo: 'DESCRITIVO', estruturaId: editId ?? undefined, estruturaColunaId: item.estruturaColunaId});
            } catch (e) { console.error('Erro ao virar dimensão:', e); }
        }
        setData((p) => ({
            ...p,
            dimensoesTempo: p.dimensoesTempo.filter((d) => d !== item),
            dimensoes: [...p.dimensoes, {...item, tipo: 'DIMENSAO', tipoInfo: 'DESCRITIVO', id: undefined} as DimItem],
        }));
    };

    const setTipoMedida = async (item: MedidaItem, tipoInfo: string) => {
        if (item.tipoInfo === tipoInfo) return;
        if (item.id) {
            try {
                await updateMedida(item.id, {nomeVisualizacao: item.nomeVisualizacao, tipo: 'MEDIDA', tipoInfo, estruturaId: item.estruturaId ?? editId ?? undefined, estruturaColunaId: item.estruturaColunaId});
            } catch (e) { console.error('Erro ao alterar tipo da medida:', e); }
        }
        setData((p) => ({...p, medidas: p.medidas.map((m) => (m === item ? {...m, tipoInfo} : m))}));
    };

    /* ── Salvamento ───────────────────────────────────────────────────────────── */
    const salvar = async (formData: EstruturaFormData): Promise<number | undefined> => {
        const e = formData.entity;
        const payload = {
            nome: e.nome,
            tabela: e.tabela,
            condicao: e.condicao,
            nomeBanco: e.nomeBanco,
            coordenada: e.coordenada,
            zoom: e.zoom,
            configuracaoEmailId: (e.configuracaoEmailId || undefined) as number | undefined,
        };
        const savedId = editId
            ? await updateEstrutura(editId, payload).then((x: any) => x.id)
            : await saveEstrutura(payload).then((x: any) => x.id);

        const colunaIdMap = new Map<number, number>();
        for (const c of formData.colunas) {
            if (c._pending) {
                const criada = await createColuna({coluna: c.coluna, estruturaId: savedId});
                colunaIdMap.set(c._k, criada.id);
            } else if (c.id && c._dirtyColuna) {
                await updateColuna(c.id, {coluna: c.coluna, estruturaId: savedId});
            }
        }
        const resolveColunaId = (k?: number) => (k !== undefined ? colunaIdMap.get(k) : undefined);

        for (const d of [...formData.dimensoes, ...formData.dimensoesTempo]) {
            const estruturaColunaId = resolveColunaId(d._colunaK) ?? d.estruturaColunaId;
            if (d._pending) {
                await createDimensao({nomeVisualizacao: d.nomeVisualizacao, tipo: 'DIMENSAO', tipoInfo: d.tipoInfo, estruturaId: savedId, estruturaColunaId});
            } else if (d.id && d._dirty) {
                await updateDimensao(d.id, {nomeVisualizacao: d.nomeVisualizacao, tipo: 'DIMENSAO', tipoInfo: d.tipoInfo, estruturaId: savedId, estruturaColunaId});
            }
        }
        for (const m of formData.medidas) {
            const estruturaColunaId = resolveColunaId(m._colunaK) ?? m.estruturaColunaId;
            if (m._pending) {
                await createMedida({nomeVisualizacao: m.nomeVisualizacao, tipo: 'MEDIDA', tipoInfo: m.tipoInfo, estruturaId: savedId, estruturaColunaId});
            } else if (m.id && m._dirty) {
                await updateMedida(m.id, {nomeVisualizacao: m.nomeVisualizacao, tipo: 'MEDIDA', tipoInfo: m.tipoInfo, estruturaId: savedId, estruturaColunaId});
            }
        }
        for (const g of formData.georeferencias) {
            const estruturaColunaId = resolveColunaId(g._colunaK) ?? g.estruturaColunaId;
            if (g._pending) {
                await createGeoreferencia({nomeVisualizacao: g.nomeVisualizacao, estruturaId: savedId, estruturaColunaId});
            } else if (g.id && g._dirty) {
                await updateGeoreferencia(g.id, {nomeVisualizacao: g.nomeVisualizacao, estruturaId: savedId, estruturaColunaId});
            }
        }
        return savedId;
    };

    const handleComplete = async (formData: EstruturaFormData) => {
        try {
            await salvar(formData);
            Alert.alert('Estrutura salva com sucesso!');
            goBack();
        } catch (error) {
            console.error('Erro ao salvar estrutura:', error);
            Alert.alert('Erro ao salvar estrutura', undefined, [{text: 'OK'}]);
        }
    };

    const handleSalvarEContinuar = async () => {
        try {
            const savedId = await salvar(data);
            Alert.alert('Estrutura salva com sucesso!');
            if (savedId) {
                navigation?.navigate?.('view/estrutura/formEstrutura', {id: savedId});
            }
        } catch (error) {
            console.error('Erro ao salvar estrutura:', error);
            Alert.alert('Erro ao salvar estrutura', undefined, [{text: 'OK'}]);
        }
    };

    /* ── Componentes de UI ────────────────────────────────────────────────────── */
    const fieldLabel = (text: string, required = false) => (
        <Text style={styles.label}>{text}{required && <Text style={styles.required}> *</Text>}</Text>
    );

    const colunaChips = (colunaK?: number, onChange?: (k?: number) => void) => (
        <View style={styles.chipsWrap}>
            {data.colunas.length === 0 && <Text style={styles.muted}>Nenhuma coluna adicionada ainda.</Text>}
            {data.colunas.map((c) => {
                const active = c._k === colunaK;
                return (
                    <Pressable key={c._k} style={[styles.chip, active && styles.chipActive]} onPress={() => onChange?.(active ? undefined : c._k)}>
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.coluna}</Text>
                    </Pressable>
                );
            })}
        </View>
    );

    const [tabSql, setTabSql] = useState('estrutura');
    const [tabCampos, setTabCampos] = useState('dimensao');

    const innerTabs = (active: string, setActive: (k: string) => void, labels: Array<{key: string; label: string}>) => (
        <View style={styles.innerTabs}>
            {labels.map((t) => (
                <Pressable
                    key={t.key}
                    style={[styles.innerTab, active === t.key && styles.innerTabActive]}
                    onPress={() => setActive(t.key)}
                >
                    <Text style={[styles.innerTabText, active === t.key && styles.innerTabTextActive]}>{t.label}</Text>
                </Pressable>
            ))}
        </View>
    );

    const renderDimRows = (lista: DimItem[], virar?: (item: DimItem) => void, virarTitulo?: string) => (
        lista.length === 0 ? (
            <Text style={styles.muted}>Nenhum registro encontrado.</Text>
        ) : lista.map((d) => (
            <View key={d._k} style={styles.row}>
                <Text style={styles.rowCol}>{d._coluna || '—'}</Text>
                <TextInput style={styles.input} value={d.nomeVisualizacao} onChangeText={(v) => updateDimNome(d, v)}/>
                <View style={styles.rowBtns}>
                    {virar && <Pressable style={[styles.smallBtn, {backgroundColor: Colors.btnBlue}]} onPress={() => virar(d)}><Text style={styles.smallBtnText}>{virarTitulo}</Text></Pressable>}
                    <Pressable style={[styles.smallBtn, {backgroundColor: Colors.btnRed}]} onPress={() => removeDimensao(d)}><Text style={styles.smallBtnText}>Remover</Text></Pressable>
                </View>
            </View>
        ))
    );

    const renderMedidaRows = () => (
        data.medidas.length === 0 ? (
            <Text style={styles.muted}>Nenhum registro encontrado.</Text>
        ) : data.medidas.map((m) => (
            <View key={m._k} style={styles.row}>
                <Text style={styles.rowCol}>{m._coluna || '—'}</Text>
                <TextInput style={styles.input} value={m.nomeVisualizacao} onChangeText={(v) =>
                    setData((p) => ({...p, medidas: p.medidas.map((x) => (x === m ? {...x, nomeVisualizacao: v, _dirty: x.id ? true : x._dirty} : x))}))}/>
                <View style={styles.chipsWrap}>
                    {TIPOS_MEDIDA.map((t) => (
                        <Pressable
                            key={t.value}
                            style={[styles.chip, {backgroundColor: m.tipoInfo === t.value ? t.color : undefined}, m.tipoInfo === t.value && styles.chipActive]}
                            onPress={() => setTipoMedida(m, t.value)}
                        >
                            <Text style={[styles.chipText, m.tipoInfo === t.value && styles.chipTextActive]}>{t.label}</Text>
                        </Pressable>
                    ))}
                </View>
                <Pressable style={[styles.smallBtn, {backgroundColor: Colors.btnRed}]} onPress={() => removeMedida(m)}><Text style={styles.smallBtnText}>Remover</Text></Pressable>
            </View>
        ))
    );

    const renderGeoRows = () => (
        data.georeferencias.length === 0 ? (
            <Text style={styles.muted}>Nenhum registro encontrado.</Text>
        ) : data.georeferencias.map((g) => (
            <View key={g._k} style={styles.row}>
                <Text style={styles.rowCol}>{g._coluna || '—'}</Text>
                <TextInput style={styles.input} value={g.nomeVisualizacao} onChangeText={(v) => updateGeoNome(g, v)}/>
                <Pressable style={[styles.smallBtn, {backgroundColor: Colors.btnRed}]} onPress={() => removeGeoreferencia(g)}><Text style={styles.smallBtnText}>Remover</Text></Pressable>
            </View>
        ))
    );

    /* ── Conteúdo dos passos ──────────────────────────────────────────────────── */
    const sqlContent = (
        <View>
            {fieldLabel('Nome colunas', true)}
            <TextInput style={styles.input} value={data.entity.nome ?? ''} onChangeText={(v) => setEntity({nome: v})} placeholder="Nome da estrutura"/>

            <View style={styles.panel}>
                <Text style={styles.panelTitle}>Definições</Text>
                {fieldLabel('Formato de nome de coluna')}
                <View style={styles.chipsWrap}>
                    {FORMATOS_TEXTO.map((f) => {
                        const active = data.definicoes.formatoTexto === f.value;
                        return (
                            <Pressable key={f.value} style={[styles.chip, active && styles.chipActive]} onPress={() => setData((p) => ({...p, definicoes: {...p.definicoes, formatoTexto: f.value}}))}>
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
                            </Pressable>
                        );
                    })}
                </View>
                <Pressable style={styles.toggleRow} onPress={() => setData((p) => ({...p, definicoes: {...p.definicoes, simboloTexto: !p.definicoes.simboloTexto}}))}>
                    <View style={[styles.toggle, data.definicoes.simboloTexto && styles.toggleOn]}>
                        <View style={[styles.toggleThumb, data.definicoes.simboloTexto && styles.toggleThumbOn]}/>
                    </View>
                    <Text style={styles.label}>Remover símbolos</Text>
                </Pressable>
            </View>

            <View style={styles.panel}>
                <Text style={styles.panelTitle}>Mapas</Text>
                <AutoComplete
                    label="Token"
                    placeholder="Digite para buscar..."
                    value={token}
                    onChange={(opt) => {
                        setToken(opt);
                        setEntity({configuracaoEmailId: opt?.id});
                    }}
                    fetchOptions={async (q) => {
                        const res = await api.get<Array<{id: number; username: string}>>('/api/basico/configuracao-email', {params: {search: q}});
                        const list = Array.isArray(res.data) ? res.data : [];
                        return list.map((ce) => ({id: ce.id, label: ce.username}));
                    }}
                />
                {fieldLabel('Coordenada', true)}
                <TextInput style={styles.input} value={data.entity.coordenada ?? ''} onChangeText={(v) => setEntity({coordenada: v})} placeholder="Coordenada"/>
                {fieldLabel('Zoom', true)}
                <TextInput style={styles.input} keyboardType="numeric" value={data.entity.zoom ?? ''} onChangeText={(v) => setEntity({zoom: v})} placeholder="Zoom"/>
            </View>

            {innerTabs(tabSql, setTabSql, [
                {key: 'estrutura', label: 'Estrutura'},
                {key: 'colunas', label: 'Colunas'},
            ])}
            {tabSql === 'estrutura' ? (
                <View>
                    {fieldLabel('Tabela')}
                    <TextInput style={[styles.input, styles.textArea]} multiline value={data.entity.tabela ?? ''} onChangeText={(v) => setEntity({tabela: v})} placeholder="SELECT ... FROM ..."/>
                    {fieldLabel('Condições')}
                    <TextInput style={[styles.input, styles.textArea]} multiline value={data.entity.condicao ?? ''} onChangeText={(v) => setEntity({condicao: v})} placeholder="WHERE ..."/>
                    {fieldLabel('Paginação')}
                    <Text style={styles.literal}>limit &lt;&lt;quantidade exibir&gt;&gt; offset &lt;&lt;página&gt;&gt;</Text>
                </View>
            ) : (
                <View>
                    <TextInput style={[styles.input, styles.textArea]} multiline value={novaColunaSql} onChangeText={setNovaColunaSql} placeholder={`Separe as colunas com ${QUEBRA_COLUNA}`}/>
                    <Pressable style={[styles.btn, {backgroundColor: Colors.btnBlue}]} onPress={addColunasLista}><Text style={styles.btnText}>+ Adicionar lista</Text></Pressable>
                    {data.colunas.length === 0 ? (
                        <Text style={styles.muted}>Nenhum registro encontrado.</Text>
                    ) : data.colunas.map((c) => (
                        <View key={c._k} style={styles.row}>
                            <TextInput style={[styles.input, {flex: 1}]} value={c.coluna} onChangeText={(v) => updateColunaItem(c, v)}/>
                            <Pressable style={[styles.smallBtn, {backgroundColor: Colors.btnRed}]} onPress={() => removeColuna(c)}><Text style={styles.smallBtnText}>−</Text></Pressable>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    const camposContent = (
        <View>
            {innerTabs(tabCampos, setTabCampos, [
                {key: 'dimensao', label: 'Descrição'},
                {key: 'tempo', label: 'Tempo'},
                {key: 'medida', label: 'Medida'},
                {key: 'geo', label: 'Georeferencia'},
            ])}
            {tabCampos === 'dimensao' && (
                <View>
                    <View style={styles.addRow}>
                        <TextInput style={[styles.input, {flex: 1}]} placeholder="Nome visualização" value={dimForm.nomeVisualizacao} onChangeText={(v) => setDimForm({...dimForm, nomeVisualizacao: v})}/>
                        <Pressable style={[styles.btn, {backgroundColor: Colors.btnGreen}]} onPress={addDimensao}><Text style={styles.btnText}>Adicionar</Text></Pressable>
                    </View>
                    {colunaChips(dimForm.colunaK, (k) => setDimForm({...dimForm, colunaK: k}))}
                    {renderDimRows(data.dimensoes, virarCoordenada, 'Virar Coordenada')}
                </View>
            )}
            {tabCampos === 'tempo' && (
                <View>
                    <View style={styles.addRow}>
                        <TextInput style={[styles.input, {flex: 1}]} placeholder="Nome visualização" value={tempoForm.nomeVisualizacao} onChangeText={(v) => setTempoForm({...tempoForm, nomeVisualizacao: v})}/>
                        <Pressable style={[styles.btn, {backgroundColor: Colors.btnGreen}]} onPress={addDimensaoTempo}><Text style={styles.btnText}>Adicionar</Text></Pressable>
                    </View>
                    {colunaChips(tempoForm.colunaK, (k) => setTempoForm({...tempoForm, colunaK: k}))}
                    {renderDimRows(data.dimensoesTempo, virarDimensao, 'Virar Descrição')}
                </View>
            )}
            {tabCampos === 'medida' && (
                <View>
                    <View style={styles.addRow}>
                        <TextInput style={[styles.input, {flex: 1}]} placeholder="Nome visualização" value={medForm.nomeVisualizacao} onChangeText={(v) => setMedForm({...medForm, nomeVisualizacao: v})}/>
                        <Pressable style={[styles.btn, {backgroundColor: Colors.btnGreen}]} onPress={addMedida}><Text style={styles.btnText}>Adicionar</Text></Pressable>
                    </View>
                    <View style={styles.chipsWrap}>
                        {TIPOS_MEDIDA.map((t) => (
                            <Pressable key={t.value} style={[styles.chip, medForm.tipoInfo === t.value && styles.chipActive]} onPress={() => setMedForm({...medForm, tipoInfo: t.value})}>
                                <Text style={[styles.chipText, medForm.tipoInfo === t.value && styles.chipTextActive]}>{t.label.replace(' (%)', '').replace(' (R$)', '').replace(' (0,0)', '')}</Text>
                            </Pressable>
                        ))}
                    </View>
                    {colunaChips(medForm.colunaK, (k) => setMedForm({...medForm, colunaK: k}))}
                    {renderMedidaRows()}
                </View>
            )}
            {tabCampos === 'geo' && (
                <View>
                    <View style={styles.addRow}>
                        <TextInput style={[styles.input, {flex: 1}]} placeholder="Nome visualização" value={geoForm.nomeVisualizacao} onChangeText={(v) => setGeoForm({...geoForm, nomeVisualizacao: v})}/>
                        <Pressable style={[styles.btn, {backgroundColor: Colors.btnGreen}]} onPress={addGeoreferencia}><Text style={styles.btnText}>Adicionar</Text></Pressable>
                    </View>
                    {colunaChips(geoForm.colunaK, (k) => setGeoForm({...geoForm, colunaK: k}))}
                    {renderGeoRows()}
                </View>
            )}
            <Pressable style={[styles.btn, {backgroundColor: Colors.btnStop, marginTop: Spacing.md}]} onPress={handleSalvarEContinuar}>
                <Text style={styles.btnText}>Salvar e Continuar</Text>
            </Pressable>
        </View>
    );

    const steps: WizardStep[] = [
        {
            key: 'sql',
            label: 'SQL',
            content: sqlContent,
            validate: (d: any) => (d?.entity?.nome?.length >= 3) || 'Nome deve ter pelo menos 3 caracteres',
        },
        {
            key: 'campos',
            label: 'Campos',
            nextLabel: 'Salvar',
            content: camposContent,
        },
    ];

    return (
        <Wizard
            steps={steps}
            data={data}
            initialData={data}
            onDataChange={setData}
            onComplete={handleComplete}
        />
    );
}

const styles = StyleSheet.create({
    label: {fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: Typography.weights.semibold, marginTop: Spacing.sm},
    required: {color: Colors.btnRed},
    input: {
        borderWidth: 1,
        borderColor: Colors.formInputBorder,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: Typography.sizes.base,
        color: Colors.textPrimary,
        marginTop: Spacing.xs,
        backgroundColor: Colors.bgSecondary,
    },
    textArea: {height: 100, textAlignVertical: 'top'},
    panel: {borderWidth: 1, borderColor: Colors.borderLight, borderRadius: BorderRadius.xl, padding: Spacing.md, marginTop: Spacing.md},
    panelTitle: {fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.textPrimary, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: Spacing.sm, marginBottom: Spacing.sm},
    chipsWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.xs},
    chip: {borderWidth: 1, borderColor: Colors.borderMedium, borderRadius: BorderRadius.round, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, marginRight: Spacing.xs, marginBottom: Spacing.xs},
    chipActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
    chipText: {fontSize: Typography.sizes.sm, color: Colors.textSecondary},
    chipTextActive: {color: Colors.textWhite, fontWeight: Typography.weights.semibold},
    innerTabs: {flexDirection: 'row', marginTop: Spacing.lg, borderBottomWidth: 2, borderBottomColor: Colors.borderPrimary},
    innerTab: {paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginRight: Spacing.sm},
    innerTabActive: {borderBottomWidth: 3, borderBottomColor: Colors.primary},
    innerTabText: {fontSize: Typography.sizes.base, color: Colors.textMuted, fontWeight: Typography.weights.semibold},
    innerTabTextActive: {color: Colors.primary},
    row: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.tableBorder},
    rowCol: {width: '22%', fontSize: Typography.sizes.sm, color: Colors.textPrimary},
    rowBtns: {flexDirection: 'row', gap: Spacing.xs},
    smallBtn: {borderRadius: BorderRadius.md, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs},
    smallBtnText: {color: Colors.textWhite, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold},
    btn: {borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xs},
    btnText: {color: Colors.textWhite, fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold},
    addRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs},
    toggleRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md},
    toggle: {width: 44, height: 24, borderRadius: 12, backgroundColor: Colors.toggleOff, justifyContent: 'center'},
    toggleOn: {backgroundColor: Colors.toggleOn},
    toggleThumb: {width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.toggleThumb, marginLeft: 2},
    toggleThumbOn: {marginLeft: 22},
    literal: {marginTop: Spacing.xs, padding: Spacing.sm, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: BorderRadius.md, fontFamily: 'monospace', fontSize: Typography.sizes.sm, color: Colors.textSecondary},
    muted: {color: Colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: Spacing.md},
});