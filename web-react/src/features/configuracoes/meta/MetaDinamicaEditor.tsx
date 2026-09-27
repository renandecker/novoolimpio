import {useCallback, useEffect, useMemo, useState} from 'react';
import type {AutoCompleteOption} from '../../../shared/components/AutoComplete';
import {AutoComplete} from '../../../shared/components/AutoComplete';
import {UnidadeCombo} from '../../../shared/components/UnidadeCombo';
import {BooleanField} from '../../../shared/components/BooleanField';
import {api} from '../../../shared/services/api';
import {
    FORMATO_LABELS,
    INDICADOR_LIST_SOURCE,
    MESES,
    META_DIAS_NAO_UTEIS_SOURCE,
    META_DINAMICA_API,
    META_DINAMICA_ITEM_SOURCE,
    META_VALOR_SOURCE,
    PERC_KEYS,
    PERC_LABELS,
    bool,
    fetchIndicadorById,
    fetchIndicadorMetas,
    fetchMetaDiasNaoUteis,
    fetchMetaValores,
    metaDinamicaBody,
    metaUnidadeId,
    metaValorBody,
    num,
    percFromRow,
    rec,
    saveMetaDinamica,
    somarPercentualSemana,
    str,
    toIndicadorOption,
    toUnidadeOption,
} from './metaDinamica';

const UNIDADE_LIST_SOURCE = '/api/view/unidade/listUnidade';

const fetchIndicadorOptions = async (query: string): Promise<AutoCompleteOption[]> => {
    const {data} = await api.get<Record<string, unknown>[]>(INDICADOR_LIST_SOURCE);
    const term = query.trim().toLowerCase();
    return (data ?? [])
        .filter((row) => !term || str(row.nome).toLowerCase().includes(term))
        .slice(0, 20)
        .map((row) => toIndicadorOption(row))
        .filter((opt): opt is AutoCompleteOption => opt !== null);
};

const fetchIndicadorOptionById = async (id: number): Promise<AutoCompleteOption | null> =>
    toIndicadorOption(await fetchIndicadorById(id));

const EMPTY_PERC: Record<string, number | null> = Object.fromEntries(PERC_KEYS.map((key) => [key, null]));

interface MetaDinamicaEditorProps {
    /** id da meta dinâmica em edição (formMetaDinamica?id=). */
    metaId?: number | null;
    /** id do indicador pré-selecionado (botão "Metas" do listIndicador). */
    indicadorId?: number | null;
    onSaved?: (id: number) => void;
    onVoltar?: () => void;
    onNovaMeta?: () => void;
}

export function MetaDinamicaEditor({metaId, indicadorId, onSaved, onVoltar, onNovaMeta}: MetaDinamicaEditorProps) {
    const [id, setId] = useState<number | null>(metaId ?? null);
    const [indicador, setIndicador] = useState<AutoCompleteOption | null>(null);
    const [flags, setFlags] = useState({dia: false, mes: false, ano: false, semana: false});
    const [unidade, setUnidade] = useState<AutoCompleteOption | null>(null);
    const [todosMeses, setTodosMeses] = useState(false);
    const [mes, setMes] = useState('');
    const [ano, setAno] = useState('');
    const [perc, setPerc] = useState<Record<string, number | null>>(EMPTY_PERC);
    const [metas, setMetas] = useState<Record<string, unknown>[]>([]);
    const [valores, setValores] = useState<Record<string, unknown>[]>([]);
    const [dias, setDias] = useState<Record<string, unknown>[]>([]);
    const [diasRemovidos, setDiasRemovidos] = useState<number[]>([]);
    const [novoDia, setNovoDia] = useState('');
    const [edicao, setEdicao] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string>();
    const [aviso, setAviso] = useState<string>();

    const percentualTotal = useMemo(() => somarPercentualSemana(perc), [perc]);

    /** Volta o editor para o estado de "nova meta", preservando o indicador escolhido. */
    const limpar = useCallback(() => {
        setId(null);
        setUnidade(null);
        setTodosMeses(false);
        setMes('');
        setAno('');
        setPerc(EMPTY_PERC);
        setValores([]);
        setDias([]);
        setDiasRemovidos([]);
        setNovoDia('');
        setEdicao(false);
        setErro(undefined);
        setAviso(undefined);
    }, []);

    const valorDe = useCallback(
        (idIndicadorMeta: number) => valores.find((row) => num(rec(row).id_indicador_meta) === idIndicadorMeta),
        [valores],
    );

    const selecionarIndicador = useCallback(async (row: Record<string, unknown> | null) => {
        setIndicador(toIndicadorOption(row));
        setFlags({
            dia: bool(row?.fl_dia),
            mes: bool(row?.fl_mes),
            ano: bool(row?.fl_ano),
            semana: bool(row?.fl_semana),
        });
        setValores([]);
        if (!row) {
            setMetas([]);
            return;
        }
        const indicadorId = num(row.id);
        if (indicadorId === null) return;
        setCarregando(true);
        try {
            setMetas(await fetchIndicadorMetas(indicadorId));
        } catch (e) {
            console.error('Erro ao carregar metas do indicador:', e);
            setErro('Erro ao carregar as metas do indicador.');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        let ativo = true;
        (async () => {
            if (!id && !indicadorId) return;
            setCarregando(true);
            setErro(undefined);
            try {
                let metaRow: Record<string, unknown> = {};
                if (id) {
                    const {data} = await api.get<Record<string, unknown>>(`${META_DINAMICA_ITEM_SOURCE}/${id}`);
                    metaRow = rec(data);
                }
                const targetIndicadorId = num(metaRow.id_indicador) ?? indicadorId ?? null;
                if (targetIndicadorId !== null) {
                    const row = await fetchIndicadorById(targetIndicadorId);
                    if (!ativo) return;
                    await selecionarIndicador(row);
                }

                const targetUnidadeId = metaUnidadeId(metaRow);
                if (targetUnidadeId !== null) {
                    const {data} = await api.get<Record<string, unknown>>(`${UNIDADE_LIST_SOURCE}/${targetUnidadeId}`);
                    if (!ativo) return;
                    setUnidade(toUnidadeOption(targetUnidadeId, str(rec(data).sucinto)));
                }
                if (!ativo) return;
                setAno(num(metaRow.ano) === null ? '' : String(num(metaRow.ano)));
                setMes(num(metaRow.mes) === null ? '' : String(num(metaRow.mes)));
                setTodosMeses(num(metaRow.mes) === null && id !== null);
                setPerc(percFromRow(metaRow));

                if (id) {
                    const [valoresRows, diasRows] = await Promise.all([fetchMetaValores(id), fetchMetaDiasNaoUteis(id)]);
                    if (!ativo) return;
                    setValores(valoresRows);
                    setDias(diasRows);
                }
            } catch (e) {
                console.error('Erro ao carregar meta dinâmica:', e);
                if (ativo) setErro('Erro ao carregar os dados da meta.');
            } finally {
                if (ativo) setCarregando(false);
            }
        })();
        return () => { ativo = false; };
    }, [id, indicadorId, selecionarIndicador]);

    const setValor = (idIndicadorMeta: number, valor: string) => {
        setValores((prev) => {
            const existente = prev.find((row) => num(rec(row).id_indicador_meta) === idIndicadorMeta);
            if (existente) {
                return prev.map((row) => (num(rec(row).id_indicador_meta) === idIndicadorMeta ? {...row, valor} : row));
            }
            return [...prev, {id_indicador_meta: idIndicadorMeta, valor}];
        });
    };

    const adicionarDia = () => {
        const dia = num(novoDia);
        if (dia === null) {
            setErro('Informe o dia para não diarizar.');
            return;
        }
        if (dias.some((row) => num(rec(row).dia) === dia)) {
            setErro('O dia informado já está na lista.');
            return;
        }
        setDias((prev) => [...prev, {dia}]);
        setNovoDia('');
        setErro(undefined);
    };

    const removerDia = (row: Record<string, unknown>) => {
        const diaId = num(row.id);
        if (diaId !== null) setDiasRemovidos((prev) => [...prev, diaId]);
        setDias((prev) => prev.filter((item) => item !== row));
    };

    const salvar = async (acao: 'continuar' | 'nova') => {
        if (!indicador) {
            setErro('Selecione o indicador da meta.');
            return;
        }
        if (!unidade) {
            setErro('Selecione a unidade da meta.');
            return;
        }
        if (flags.mes && !todosMeses && !mes) {
            setErro('Selecione o mês da meta.');
            return;
        }
        if (flags.ano && !ano) {
            setErro('Informe o ano da meta.');
            return;
        }
        setSalvando(true);
        setErro(undefined);
        setAviso(undefined);
        try {
            const novoId = await saveMetaDinamica(id, metaDinamicaBody({
                mes: todosMeses ? null : num(mes),
                ano: flags.ano ? num(ano) : null,
                perc,
                indicadorId: indicador.id,
                unidadeId: unidade.id,
                dataAtualizacao: new Date().toISOString(),
            }));
            setId(novoId);

            for (const meta of metas) {
                const metaId = num(rec(meta).id);
                if (metaId === null) continue;
                const row = valorDe(metaId);
                if (!row) continue;
                const body = metaValorBody(row.valor, metaId, novoId);
                if (row.id) await api.put(`${META_VALOR_SOURCE}/${row.id}`, body);
                else await api.post(META_VALOR_SOURCE, body);
            }

            for (const dia of dias) {
                if (dia.id) await api.put(`${META_DIAS_NAO_UTEIS_SOURCE}/${dia.id}`, {dia: dia.dia, id_meta: novoId});
                else await api.post(META_DIAS_NAO_UTEIS_SOURCE, {dia: dia.dia, id_meta: novoId});
            }
            for (const diaId of diasRemovidos) {
                await api.delete(`${META_DIAS_NAO_UTEIS_SOURCE}/${diaId}`);
            }
            setDiasRemovidos([]);

            setAviso('Meta salva com sucesso.');
            onSaved?.(novoId);
            if (acao === 'nova') {
                if (onNovaMeta) {
                    onNovaMeta();
                } else {
                    limpar();
                }
            }
        } catch (e) {
            console.error('Erro ao salvar meta dinâmica:', e);
            setErro('Erro ao salvar a meta dinâmica.');
        } finally {
            setSalvando(false);
        }
    };

    const diarizar = async () => {
        if (!id) {
            setErro('Salve a meta antes de diarizar os valores.');
            return;
        }
        setSalvando(true);
        setErro(undefined);
        try {
            await api.post(`${META_DINAMICA_API}/atualizar-valores-das-semanas`, null, {
                params: {metaDinamicaId: id},
            });
            setAviso('Diarização executada com sucesso.');
        } catch (e) {
            console.error('Erro ao diarizar:', e);
            setErro('Erro ao diarizar os valores da meta.');
        } finally {
            setSalvando(false);
        }
    };

    const bloco = (titulo: string, conteudo: React.ReactNode) => (
        <section style={{marginBottom: 20}}>
            <h3 style={{margin: '0 0 10px', fontSize: 14}}>{titulo}</h3>
            {conteudo}
        </section>
    );

    return (
        <div className="div_form" style={{padding: 16}}>
            {erro && (
                <div style={{background: '#fff0f0', border: '1px solid #f5c6cb', color: '#a61b29', padding: '10px 14px', borderRadius: 6, marginBottom: 12}}>
                    {erro}
                </div>
            )}
            {aviso && (
                <div style={{background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#1b5e20', padding: '10px 14px', borderRadius: 6, marginBottom: 12}}>
                    {aviso}
                </div>
            )}

            {bloco('Definição', (
                <div className="form-grid">
                    <AutoComplete
                        id="metaDinamicaIndicador"
                        label="Indicador *"
                        placeholder="Digite para buscar indicador..."
                        value={indicador}
                        onChange={(option) => {
                            if (!option) {
                                void selecionarIndicador(null);
                                return;
                            }
                            setIndicador(option);
                            setCarregando(true);
                            fetchIndicadorById(option.id)
                                .then((row) => selecionarIndicador(row))
                                .catch((e) => {
                                    console.error('Erro ao carregar indicador:', e);
                                    setErro('Erro ao carregar o indicador.');
                                })
                                .finally(() => setCarregando(false));
                        }}
                        fetchOptions={fetchIndicadorOptions}
                        fetchById={fetchIndicadorOptionById}
                        minChars={2}
                    />
                    <UnidadeCombo label="Unidade *" value={unidade} onChange={setUnidade} minChars={2}/>
                    {flags.mes && (
                        <div className="form-field">
                            <span className="form-label">Todos os meses</span>
                            <BooleanField value={todosMeses} onChange={setTodosMeses}/>
                        </div>
                    )}
                    {flags.mes && !todosMeses && (
                        <label className="form-field">
                            <span className="form-label">Mês</span>
                            <select
                                className="form-input form-select"
                                value={mes}
                                onChange={(e) => setMes(e.target.value)}
                                disabled={edicao}
                            >
                                <option value="">-- Selecione --</option>
                                {MESES.map((label, index) => (
                                    <option key={label} value={String(index + 1)}>{label}</option>
                                ))}
                            </select>
                        </label>
                    )}
                    {flags.ano && (
                        <label className="form-field">
                            <span className="form-label">Ano *</span>
                            <input
                                className="form-input"
                                inputMode="numeric"
                                value={ano}
                                onChange={(e) => setAno(e.target.value)}
                                disabled={edicao}
                                placeholder="2026"
                            />
                        </label>
                    )}
                </div>
            ))}

            {bloco('Metas', !indicador ? (
                <p style={{color: '#888', fontStyle: 'italic', margin: 0}}>Selecione um indicador para carregar as metas.</p>
            ) : metas.length === 0 ? (
                <p style={{color: '#888', fontStyle: 'italic', margin: 0}}>Nenhuma meta cadastrada para o indicador.</p>
            ) : (
                <table className="lote-table">
                    <thead>
                    <tr>
                        <th style={{width: '40%'}}>Descrição</th>
                        <th style={{width: '50%'}}>Valor</th>
                        <th style={{width: '10%'}}>Formato</th>
                    </tr>
                    </thead>
                    <tbody>
                    {metas.map((meta) => {
                        const metaId = num(rec(meta).id);
                        const row = metaId === null ? undefined : valorDe(metaId);
                        const formato = str(rec(meta).formato);
                        return (
                            <tr key={str(rec(meta).id)}>
                                <td>{str(rec(meta).descricao)}</td>
                                <td>
                                    <input
                                        className="form-input"
                                        inputMode="decimal"
                                        value={str(row?.valor)}
                                        onChange={(e) => metaId !== null && setValor(metaId, e.target.value)}
                                        disabled={edicao}
                                        placeholder="0,00"
                                    />
                                </td>
                                <td>{FORMATO_LABELS[formato] ?? formato}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            ))}

            {bloco('Percentual semana', flags.semana ? (
                <div className="form-grid">
                    {PERC_KEYS.map((key) => (
                        <label className="form-field" key={key}>
                            <span className="form-label">{PERC_LABELS[key]} (%)</span>
                            <input
                                className="form-input"
                                inputMode="decimal"
                                value={perc[key] === null || perc[key] === undefined ? '' : String(perc[key])}
                                onChange={(e) => setPerc((prev) => ({...prev, [key]: num(e.target.value)}))}
                                disabled={edicao}
                                placeholder="0,00"
                            />
                        </label>
                    ))}
                    <label className="form-field">
                        <span className="form-label">Total</span>
                        <input
                            className="form-input"
                            value={`${percentualTotal.toFixed(2).replace('.', ',')}%`}
                            readOnly
                            style={{background: '#f0f0f0'}}
                        />
                    </label>
                </div>
            ) : (
                <p style={{color: '#888', fontStyle: 'italic', margin: 0}}>Indicador sem percentual por semana.</p>
            ))}

            {bloco('Dias para não diarizar', !flags.dia ? (
                <p style={{color: '#888', fontStyle: 'italic', margin: 0}}>Indicador não utiliza diarização diária.</p>
            ) : (
                <>
                    <div style={{display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 10}}>
                        <label className="form-field" style={{width: 90}}>
                            <span className="form-label">Dia</span>
                            <input
                                className="form-input"
                                inputMode="numeric"
                                value={novoDia}
                                onChange={(e) => setNovoDia(e.target.value)}
                                disabled={edicao}
                            />
                        </label>
                        <button type="button" className="btnsky" style={{height: 38}} onClick={adicionarDia} disabled={edicao}>
                            Adicionar Dia
                        </button>
                    </div>
                    {dias.length === 0 ? (
                        <p style={{color: '#888', fontStyle: 'italic', margin: 0}}>Nenhum dia.</p>
                    ) : (
                        <table className="lote-table">
                            <thead>
                            <tr>
                                <th style={{width: '30%'}}>Dia</th>
                                <th style={{width: '15%', textAlign: 'center'}}>Ação</th>
                            </tr>
                            </thead>
                            <tbody>
                            {dias.map((row) => (
                                <tr key={str(rec(row).id)}>
                                    <td>{str(rec(row).dia)}</td>
                                    <td style={{textAlign: 'center'}}>
                                        <button
                                            type="button"
                                            className="btnstop"
                                            onClick={() => removerDia(row)}
                                            disabled={edicao}
                                        >
                                            Remover
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </>
            ))}

            <div className="form-buttons" style={{display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                <button
                    type="button"
                    className="btnstop"
                    onClick={() => void salvar('continuar')}
                    disabled={salvando || carregando}
                >
                    {salvando ? 'Salvando...' : 'Salvar e continuar'}
                </button>
                <button
                    type="button"
                    className="btnblue"
                    onClick={() => void salvar('nova')}
                    disabled={salvando || carregando}
                    title="Salva e limpa os parâmetros para uma nova meta"
                >
                    {salvando ? 'Salvando...' : 'Salvar e nova meta'}
                </button>
                {onVoltar && (
                    <button type="button" className="btnyellow" onClick={onVoltar} disabled={salvando}>Voltar</button>
                )}
                <button
                    type="button"
                    className="btnpurple"
                    onClick={() => setEdicao((prev) => !prev)}
                    disabled={salvando}
                >
                    {edicao ? 'Concluir alteração' : 'Alterar parâmetros da meta'}
                </button>
                <button
                    type="button"
                    className={edicao ? 'btnblack' : 'btngrey'}
                    onClick={() => void diarizar()}
                    disabled={salvando || !id}
                    title="Zera e reprocessa os valores por semana"
                >
                    Diarizar valores com parâmetros
                </button>
            </div>
        </div>
    );
}
