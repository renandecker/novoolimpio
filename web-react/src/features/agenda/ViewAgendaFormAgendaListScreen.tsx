import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {PermissionGate} from '../../shared/services/permissions';
import {BooleanField} from '../../shared/components/BooleanField';
import {MasterDetail} from '../../shared/components/MasterDetail';
import type {MasterDetailColumn} from '../../shared/components/MasterDetail';
import type {ApiItem} from '../../shared/types/index';
import {api} from '../../shared/services/api';

interface FormState {
    descricao: string;
    unidadeId: string;
    tipoAgendaId: string;
    statusCompromissoId: string;
    statusCompromissoUltimoId: string;
    tempoTolerancia: string;
    proprio: boolean;
    diasMaximo: boolean;
    quantidadeDiasMaximo: number;
}

const FORM_VAZIO: FormState = {
    descricao: '',
    unidadeId: '',
    tipoAgendaId: '',
    statusCompromissoId: '',
    statusCompromissoUltimoId: '',
    tempoTolerancia: '',
    proprio: false,
    diasMaximo: false,
    quantidadeDiasMaximo: 1,
};

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

const comoNumeroOuNulo = (v: string): number | null => {
    if (v === '') return null;
    const numero = Number(v);
    return isNaN(numero) ? null : numero;
};

// Mascara do legado: p:inputMask mask="99:99".
const aplicarMascaraTempo = (valor: string): string => {
    const digitos = valor.replace(/\D/g, '').slice(0, 4);
    if (digitos.length <= 2) return digitos;
    return `${digitos.slice(0, 2)}:${digitos.slice(2)}`;
};

const TOOLTIP_TEMPO_TOLERANCIA = 'Este tempo é a tolerância máxima de espera pelo(s) indivíduo(s) marcados.';

const RESULTADO_SOURCE = '/api/basico/resultado';
const STATUS_COMPROMISSO_SOURCE = '/api/basico/status-compromisso';
const TIPO_AGENDA_SOURCE = '/api/basico/tipo-agenda';
const UNIDADES_DISPONIVEIS_SOURCE = '/api/view/unidade/listUnidade';

const RESULTADO_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'Código'},
    {key: 'descricao', label: 'Descrição'},
    {
        key: 'venda',
        label: 'Venda',
        render: (item) => ((item as unknown as Record<string, unknown>).venda === true ? 'Sim' : 'Não'),
    },
];

export default function ViewAgendaFormAgendaListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    const [agendaId, setAgendaId] = useState<number | undefined>();
    const [form, setForm] = useState<FormState>(FORM_VAZIO);
    const [resultadoIds, setResultadoIds] = useState<number[]>([]);
    const [statusIds, setStatusIds] = useState<number[]>([]);
    const [salvando, setSalvando] = useState(false);

    const tiposQuery = useQuery({
        queryKey: ['tipo-agenda', 'combo'],
        queryFn: async () => (await api.get<ApiItem[]>(TIPO_AGENDA_SOURCE)).data,
    });
    const statusQuery = useQuery({
        queryKey: ['status-compromisso', 'combo'],
        queryFn: async () => (await api.get<ApiItem[]>(STATUS_COMPROMISSO_SOURCE)).data,
    });
    const unidadesQuery = useQuery({
        queryKey: ['unidade', 'combo', 'agenda'],
        queryFn: async () => (await api.get<ApiItem[]>(UNIDADES_DISPONIVEIS_SOURCE)).data,
    });
    const resultadosCatalogo = useQuery({
        queryKey: [RESULTADO_SOURCE, 'master-detail'],
        queryFn: async () => (await api.get<ApiItem[]>(RESULTADO_SOURCE)).data,
    });

    useEffect(() => {
        if (!idParam) return;
        let ativo = true;
        (async () => {
            try {
                const resposta = await api.get<Record<string, unknown>>(`/api/basico/agenda/${idParam}`);
                const dados = resposta.data;
                const [respostasResultados, respostasStatus] = await Promise.all([
                    api.get<number[]>(`/api/basico/agenda/${idParam}/resultados`),
                    api.get<number[]>(`/api/basico/agenda/${idParam}/status`),
                ]);
                if (!ativo) return;
                setAgendaId(dados.id as number);
                setForm({
                    descricao: str(dados.descricao),
                    unidadeId: str(dados.unidadeId),
                    tipoAgendaId: str(dados.tipoAgendaId),
                    statusCompromissoId: str(dados.statusCompromissoId),
                    statusCompromissoUltimoId: str(dados.statusCompromissoUltimoId),
                    tempoTolerancia: aplicarMascaraTempo(str(dados.tempoTolerancia)),
                    proprio: dados.proprio === true,
                    diasMaximo: dados.diasMaximo === true,
                    quantidadeDiasMaximo: Number(dados.quantidadeDiasMaximo ?? 1) || 1,
                });
                setResultadoIds((respostasResultados.data ?? []).map(Number));
                setStatusIds((respostasStatus.data ?? []).map(Number));
            } catch (erro) {
                console.error('Erro ao carregar agenda:', erro);
                alert('Erro ao carregar registro.');
            }
        })();
        return () => {
            ativo = false;
        };
    }, [idParam]);

    const set = <K extends keyof FormState>(campo: K, valor: FormState[K]) =>
        setForm((anterior) => ({...anterior, [campo]: valor}));

    // Itens selecionados resolvidos a partir dos catalogos (mesmo formato usado pelo MasterDetail).
    const resultadosSelecionados = useMemo(
        () => resultadoIds
            .map((id) => (resultadosCatalogo.data ?? []).find((item) => Number(item.id) === id))
            .filter(Boolean) as ApiItem[],
        [resultadoIds, resultadosCatalogo.data],
    );

    const statusSelecionados = useMemo(
        () => statusIds
            .map((id) => (statusQuery.data ?? []).find((item) => Number(item.id) === id))
            .filter(Boolean) as ApiItem[],
        [statusIds, statusQuery.data],
    );

    const nomeStatusPorId = useMemo(() => {
        const mapa = new Map<string, string>();
        for (const item of statusQuery.data ?? []) {
            mapa.set(String(item.id), str((item as unknown as Record<string, unknown>).descricao));
        }
        return mapa;
    }, [statusQuery.data]);

    // Colunas de /view/statusCompromisso/colunasStatusCompromisso.xhtml.
    const STATUS_COLUMNS: MasterDetailColumn[] = [
        {key: 'id', label: 'Código'},
        {key: 'descricao', label: 'Descrição'},
        {key: 'cor', label: 'Cor'},
        {
            key: 'proxStatusCompromissoId',
            label: 'Próximo Status',
            render: (item) => nomeStatusPorId.get(str((item as unknown as Record<string, unknown>).proxStatusCompromissoId)) ?? '',
        },
    ];

    const voltar = () => navigate('/view/agenda/listAgenda');

    // Regras migradas de AgendaService.validateSpecificRules e AgendaController.saveOrUpdate.
    const validarAntesDeSalvar = (): boolean => {
        if (form.descricao.trim().length < 3 || form.descricao.trim().length > 255) {
            alert('A Descrição deve ter entre 3 e 255 caracteres.');
            return false;
        }
        if (!/^\d{2}:\d{2}$/.test(form.tempoTolerancia)) {
            alert('A hora deve seguir o padrao Ex.: 01:30');
            return false;
        }
        const minutos = Number(form.tempoTolerancia.slice(3));
        if (minutos > 59) {
            alert('O minuto deve estar no intervalo de 0 a 59m. Ex.: 01:30');
            return false;
        }
        if (!form.statusCompromissoUltimoId) {
            alert('Troca de status sem o ultimo status compromisso');
            return false;
        }
        const terminaNosUltimos = statusSelecionados.some((item) =>
            String((item as unknown as Record<string, unknown>).proxStatusCompromissoId) === form.statusCompromissoUltimoId);
        if (!terminaNosUltimos) {
            alert('Troca de status sem o ultimo status compromisso');
            return false;
        }
        return true;
    };

    const salvar = async (voltarDepois: boolean) => {
        if (!validarAntesDeSalvar()) return;
        setSalvando(true);
        try {
            const corpo = {
                descricao: form.descricao.trim(),
                proprio: form.proprio,
                diasMaximo: form.diasMaximo,
                quantidadeDiasMaximo: form.diasMaximo ? form.quantidadeDiasMaximo : 0,
                tipoAgendaId: comoNumeroOuNulo(form.tipoAgendaId),
                statusCompromissoId: comoNumeroOuNulo(form.statusCompromissoId),
                statusCompromissoUltimoId: comoNumeroOuNulo(form.statusCompromissoUltimoId),
                unidadeId: comoNumeroOuNulo(form.unidadeId),
                tempoTolerancia: form.tempoTolerancia,
            };
            const resposta = agendaId
                ? await api.put(`/api/basico/agenda/${agendaId}`, corpo)
                : await api.post('/api/basico/agenda', corpo);
            const novoId = agendaId ?? ((resposta.data as Record<string, unknown>)?.id as number | undefined);
            if (novoId) {
                await Promise.all([
                    api.put(`/api/basico/agenda/${novoId}/resultados`, resultadoIds),
                    api.put(`/api/basico/agenda/${novoId}/status`, statusIds),
                ]);
                if (!agendaId) setAgendaId(novoId);
            }
            if (voltarDepois) {
                voltar();
            } else {
                alert('Registro salvo com sucesso.');
            }
        } catch (erro) {
            console.error('Erro ao salvar agenda:', erro);
            alert('Erro ao salvar registro.');
        } finally {
            setSalvando(false);
        }
    };

    const unidades = [...(unidadesQuery.data ?? [])].sort((a, b) => {
        const ra = a as unknown as Record<string, unknown>;
        const rb = b as unknown as Record<string, unknown>;
        return String(ra.sucinto ?? '').localeCompare(String(rb.sucinto ?? ''));
    });

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Cadastro de Agenda</h1>
                <div className="div_form">
                    <div className="form-title">{agendaId ? `Agenda #${agendaId}` : 'Agenda'}</div>
                    <div className="table_form">
                        <div className="form-grid">
                            <label className="form-field">
                                <span className="form-label">Código</span>
                                <input className="form-input" value={agendaId ? String(agendaId) : ''} disabled readOnly/>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Descrição *</span>
                                <input className="form-input" maxLength={255} placeholder="Descrição" style={{gridColumn: 'span 2'}}
                                       value={form.descricao} onChange={(e) => set('descricao', e.target.value)}/>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Unidade *</span>
                                <select className="form-input form-select" value={form.unidadeId}
                                        onChange={(e) => set('unidadeId', e.target.value)}>
                                    <option value="">-- Selecione --</option>
                                    {unidades.map((unidade) => {
                                        const registro = unidade as unknown as Record<string, unknown>;
                                        return (
                                            <option key={String(registro.id)} value={String(registro.id)}>
                                                {String(registro.sucinto || registro.nomeFantasia || `#${registro.id}`)}
                                            </option>
                                        );
                                    })}
                                </select>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Tipo da Agenda *</span>
                                <select className="form-input form-select" value={form.tipoAgendaId}
                                        onChange={(e) => set('tipoAgendaId', e.target.value)}>
                                    <option value="">-- Selecione --</option>
                                    {(tiposQuery.data ?? []).map((tipo) => (
                                        <option key={String(tipo.id)} value={String(tipo.id)}>
                                            {str((tipo as unknown as Record<string, unknown>).descricao)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Início Status do Compromisso *</span>
                                <select className="form-input form-select" value={form.statusCompromissoId}
                                        onChange={(e) => set('statusCompromissoId', e.target.value)}>
                                    <option value="">-- Selecione --</option>
                                    {(statusQuery.data ?? []).map((status) => (
                                        <option key={String(status.id)} value={String(status.id)}>
                                            {str((status as unknown as Record<string, unknown>).descricao)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Ultimo Status do Compromisso *</span>
                                <select className="form-input form-select" value={form.statusCompromissoUltimoId}
                                        onChange={(e) => set('statusCompromissoUltimoId', e.target.value)}>
                                    <option value="">-- Selecione --</option>
                                    {(statusQuery.data ?? []).map((status) => (
                                        <option key={String(status.id)} value={String(status.id)}>
                                            {str((status as unknown as Record<string, unknown>).descricao)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Tempo de Tolerância *</span>
                                <input
                                    className="form-input"
                                    placeholder="99:99"
                                    maxLength={5}
                                    title={TOOLTIP_TEMPO_TOLERANCIA}
                                    value={form.tempoTolerancia}
                                    onChange={(e) => set('tempoTolerancia', aplicarMascaraTempo(e.target.value))}
                                />
                            </label>
                            <div className="form-field">
                                <span className="form-label">Própria Agenda</span>
                                <BooleanField value={form.proprio} onChange={(valor) => set('proprio', valor)}/>
                            </div>
                            <div className="form-field">
                                <span className="form-label">Máximo dias agendar</span>
                                <BooleanField value={form.diasMaximo} onChange={(valor) => set('diasMaximo', valor)}/>
                            </div>
                            {form.diasMaximo && (
                                <label className="form-field">
                                    <span className="form-label">Dias</span>
                                    <input
                                        className="form-input"
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={form.quantidadeDiasMaximo}
                                        onChange={(e) => set('quantidadeDiasMaximo', Math.max(1, Number(e.target.value) || 1))}
                                    />
                                </label>
                            )}
                        </div>
                        <MasterDetail
                            label="Resultado"
                            source={RESULTADO_SOURCE}
                            valueKey="id"
                            searchKeys={['descricao']}
                            columns={RESULTADO_COLUMNS}
                            items={resultadosSelecionados}
                            onChange={(itens) => setResultadoIds(itens.map((item) => Number(item.id)))}
                        />
                        <MasterDetail
                            label="Status"
                            source={STATUS_COMPROMISSO_SOURCE}
                            valueKey="id"
                            searchKeys={['descricao']}
                            columns={STATUS_COLUMNS}
                            items={statusSelecionados}
                            onChange={(itens) => setStatusIds(itens.map((item) => Number(item.id)))}
                        />
                        <div className="form-buttons">
                            <button type="button" className="btnblue" title="Salvar registro"
                                    disabled={salvando} onClick={() => void salvar(true)}>Salvar
                            </button>
                            <button type="button" className="btnstop" title="Salvar e continuar editando"
                                    disabled={salvando} onClick={() => void salvar(false)}>
                                Salvar e Continuar
                            </button>
                            <button type="button" className="btnyellow" title="Voltar para a lista"
                                    onClick={voltar}>Voltar
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
