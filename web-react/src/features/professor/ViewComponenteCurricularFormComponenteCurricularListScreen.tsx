import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../../shared/services/permissions';
import {MasterDetail} from '../../shared/components/MasterDetail';
import {Tabs} from '../../shared/components/Tabs';
import type {TabItem} from '../../shared/components/Tabs';
import {useWizardData} from '../../shared/components/Wizard';
import {
    BASE_TECNOLOGICA_SOURCE,
    BASE_TECNOLOGICA_COLUMNS,
    BASE_TECNOLOGICA_SEARCH,
    REFERENCIA_BIBLIOGRAFICA_SOURCE,
    REFERENCIA_BIBLIOGRAFICA_COLUMNS,
    REFERENCIA_BIBLIOGRAFICA_SEARCH,
} from '../../shared/services/masterDetailSources';
import type {ApiItem} from '../../shared/types/index';
import {api, useApi} from '../../shared/services/api';

interface CronogramaItem {
    key: string;
    id?: number;
    numeroAula: number;
    assunto: string;
    descricao: string;
}

interface ComponenteCurricularData {
    entity: {
        id?: number;
        descricao?: string;
        sucinto?: string;
        ementa?: string;
        qtdeCoringa?: number;
        creditos?: number;
        cargaHoraria?: number;
        tipoSalaId?: number | null;
        habilidadeCompetencia?: string;
        baseTecnologica?: string;
    };
    baseTecnologicas: ApiItem[];
    cronogramas: CronogramaItem[];
    referenciasBibliograficas: ApiItem[];
}

const semId = (obj: Record<string, unknown> | null): Record<string, unknown> => {
    const copia = {...(obj ?? {})};
    delete copia.id;
    return copia;
};

export default function ViewComponenteCurricularFormComponenteCurricularListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idEdicao = searchParams.get('id');

    const [carregando, setCarregando] = useState(!!idEdicao);
    const [salvando, setSalvando] = useState(false);
    const [baseTecnologicas, setBaseTecnologicas] = useState<ApiItem[]>([]);
    const [cronogramas, setCronogramas] = useState<CronogramaItem[]>([]);
    const [referenciasBibliograficas, setReferenciasBibliograficas] = useState<ApiItem[]>([]);
    const [novoCronoNumero, setNovoCronoNumero] = useState<number | ''>('');
    const [novoCronoAssunto, setNovoCronoAssunto] = useState('');
    const [novoCronoDescricao, setNovoCronoDescricao] = useState('');

    const {data, updateField, updateFields} = useWizardData<ComponenteCurricularData>({
        entity: {},
        baseTecnologicas: [],
        cronogramas: [],
        referenciasBibliograficas: [],
    });

    const componenteCurricularApi = useApi<any>('/api/educacao/componente-curricular');

    useEffect(() => {
        if (!idEdicao) return;
        let ativoReq = true;
        (async () => {
            try {
                const ent = (await api.get<Record<string, unknown>>(`/api/educacao/componente-curricular/${idEdicao}`)).data;
                if (!ativoReq) return;
                updateFields({entity: ent});
                const baseTecs = (ent as any)?.baseTecnologicas;
                setBaseTecnologicas(Array.isArray(baseTecs) ? baseTecs : []);
                const cronos = (ent as any)?.cronogramas;
                setCronogramas(Array.isArray(cronos)
                    ? cronos.map((c: any, i: number) => ({key: `crono-db-${c.id ?? i}`, ...c}))
                    : []);
                const refs = (ent as any)?.referenciasBibliograficas;
                setReferenciasBibliograficas(Array.isArray(refs) ? refs : []);
            } catch (erro) {
                console.error('Erro ao carregar componente curricular:', erro);
                alert('Não foi possível carregar o componente curricular para edição');
            } finally {
                if (ativoReq) setCarregando(false);
            }
        })();
        return () => {
            ativoReq = false;
        };
    }, [idEdicao, updateFields]);

    const adicionarCronograma = () => {
        if (!novoCronoNumero && novoCronoNumero !== 0) { alert('Informe o número da aula'); return; }
        if (!novoCronoAssunto.trim()) { alert('Informe o assunto'); return; }
        setCronogramas((prev) => [
            ...prev,
            {
                key: `crono-${Date.now()}-${prev.length}`,
                numeroAula: Number(novoCronoNumero),
                assunto: novoCronoAssunto.trim(),
                descricao: novoCronoDescricao.trim(),
            },
        ]);
        setNovoCronoNumero('');
        setNovoCronoAssunto('');
        setNovoCronoDescricao('');
    };

    const removerCronograma = (key: string) => {
        setCronogramas((prev) => prev.filter((item) => item.key !== key));
    };

    const moverCronograma = (indice: number, direcao: -1 | 1) => {
        setCronogramas((prev) => {
            const destino = indice + direcao;
            if (destino < 0 || destino >= prev.length) return prev;
            const copia = [...prev];
            [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
            return copia;
        });
    };

    const voltar = () => navigate('/view/componenteCurricular/listComponenteCurricular');

    const salvar = async (voltarDepois: boolean) => {
        if (!data.entity.descricao || data.entity.descricao.trim().length < 3) {
            alert('Nome deve ter pelo menos 3 caracteres');
            return;
        }
        if (!data.entity.sucinto || data.entity.sucinto.trim().length < 3) {
            alert('Sucinto deve ter pelo menos 3 caracteres');
            return;
        }
        if (!data.entity.ementa || data.entity.ementa.trim().length < 3) {
            alert('Ementa deve ter pelo menos 3 caracteres');
            return;
        }
        if (data.entity.qtdeCoringa === undefined || data.entity.qtdeCoringa === null) {
            alert('Informe a quantidade de aulas coringa');
            return;
        }
        if (!data.entity.cargaHoraria || data.entity.cargaHoraria <= 0) {
            alert('Carga horária deve ser maior que zero');
            return;
        }

        setSalvando(true);
        try {
            const payload: Record<string, unknown> = {
                ...semId(data.entity as unknown as Record<string, any>),
                baseTecnologicas,
                cronogramas: cronogramas.map(({key, ...resto}) => resto),
                referenciasBibliograficas,
            };
            const salvo = idEdicao
                ? await componenteCurricularApi.put(idEdicao, payload)
                : await componenteCurricularApi.post(payload);
            const id = (salvo as any)?.id ?? idEdicao;
            if (id) {
                updateField('entity', {...data.entity, id: Number(id)});
            }

            alert('Componente Curricular salvo com sucesso!');
            if (voltarDepois) {
                voltar();
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar componente curricular');
        } finally {
            setSalvando(false);
        }
    };

    const tabs: TabItem[] = useMemo(() => [
        {
            key: 'componenteCurricular',
            label: 'Componente Curricular',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">Id</span>
                        <input className="form-input" value={data.entity.id ?? ''} disabled/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome *</span>
                        <input className="form-input" value={data.entity.descricao ?? ''}
                               onChange={(e) => updateField('entity', {...data.entity, descricao: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Sucinto *</span>
                        <input className="form-input" value={data.entity.sucinto ?? ''}
                               onChange={(e) => updateField('entity', {...data.entity, sucinto: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Ementa *</span>
                        <textarea className="form-input" rows={5} value={data.entity.ementa ?? ''}
                                  style={{minHeight: '90px'}}
                                  onChange={(e) => updateField('entity', {...data.entity, ementa: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nº Aula Coringa *</span>
                        <input className="form-input" type="number" min={0} value={data.entity.qtdeCoringa ?? ''}
                               onChange={(e) => updateField('entity', {
                                   ...data.entity,
                                   qtdeCoringa: e.target.value === '' ? undefined : Number(e.target.value),
                               })}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Créditos</span>
                        <input className="form-input" type="number" min={0} value={data.entity.creditos ?? ''}
                               onChange={(e) => updateField('entity', {
                                   ...data.entity,
                                   creditos: e.target.value === '' ? undefined : Number(e.target.value),
                               })}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Carga Horária *</span>
                        <input className="form-input" type="number" min={1} value={data.entity.cargaHoraria ?? ''}
                               onChange={(e) => updateField('entity', {
                                   ...data.entity,
                                   cargaHoraria: e.target.value === '' ? undefined : Number(e.target.value),
                               })}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Tipo Sala</span>
                        <select className="form-input form-select"
                                value={data.entity.tipoSalaId ?? ''}
                                onChange={(e) => updateField('entity', {
                                    ...data.entity,
                                    tipoSalaId: e.target.value ? Number(e.target.value) : null,
                                })}>
                            <option value="">Selecione</option>
                            <TipoSalaOptions/>
                        </select>
                    </label>
                </div>
            ),
        },
        {
            key: 'habilidadeCompetencia',
            label: 'Habilidade/Competência',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">Habilidade/Competência</span>
                        <textarea className="form-input" rows={6}
                                  style={{gridColumn: 'span 3', minHeight: '140px'}}
                                  value={data.entity.habilidadeCompetencia ?? ''}
                                  onChange={(e) => updateField('entity', {
                                      ...data.entity,
                                      habilidadeCompetencia: e.target.value,
                                  })}/>
                    </label>
                </div>
            ),
        },
        {
            key: 'baseTecnologica',
            label: 'Base Tecnológica',
            content: (
                <>
                    <div className="form-grid">
                        <label className="form-field">
                            <span className="form-label">Base Tecnológica</span>
                            <textarea className="form-input" rows={4}
                                      style={{gridColumn: 'span 3', minHeight: '100px'}}
                                      value={data.entity.baseTecnologica ?? ''}
                                      onChange={(e) => updateField('entity', {
                                          ...data.entity,
                                          baseTecnologica: e.target.value,
                                      })}/>
                        </label>
                    </div>
                    <fieldset className="form-fieldset">
                        <legend>Bases Tecnológicas Vinculadas</legend>
                        <MasterDetail
                            label="Base Tecnológica"
                            source={BASE_TECNOLOGICA_SOURCE}
                            valueKey="id"
                            searchKeys={BASE_TECNOLOGICA_SEARCH}
                            columns={BASE_TECNOLOGICA_COLUMNS}
                            items={baseTecnologicas}
                            onChange={setBaseTecnologicas}
                        />
                    </fieldset>
                </>
            ),
        },
        {
            key: 'cronograma',
            label: 'Plano de Aula',
            content: (
                <fieldset className="form-fieldset">
                    <legend>Plano de Aula</legend>
                    <div className="form-grid">
                        <label className="form-field">
                            <span className="form-label">Nº Aula *</span>
                            <input className="form-input" type="number" min={1}
                                   value={novoCronoNumero}
                                   onChange={(e) => setNovoCronoNumero(
                                       e.target.value === '' ? '' : Number(e.target.value),
                                   )}/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Assunto *</span>
                            <input className="form-input" value={novoCronoAssunto}
                                   onChange={(e) => setNovoCronoAssunto(e.target.value)}/>
                        </label>
                    </div>
                    <div className="form-grid" style={{marginTop: 8}}>
                        <label className="form-field">
                            <span className="form-label">Descrição *</span>
                            <textarea className="form-input" rows={4}
                                      style={{gridColumn: 'span 3', minHeight: '80px'}}
                                      value={novoCronoDescricao}
                                      onChange={(e) => setNovoCronoDescricao(e.target.value)}/>
                        </label>
                    </div>
                    <div className="form-buttons" style={{borderTop: 'none', marginTop: 8}}>
                        <button type="button" className="btnblue" onClick={adicionarCronograma}>
                            Adicionar cronograma
                        </button>
                    </div>

                    {cronogramas.length > 0 ? (
                        <table className="data-table" style={{marginTop: 14, width: '100%'}}>
                            <thead>
                            <tr>
                                <th>Nº Aula</th>
                                <th>Assunto</th>
                                <th>Descrição</th>
                                <th style={{width: 120}}>Ordem</th>
                                <th style={{width: 50}}></th>
                            </tr>
                            </thead>
                            <tbody>
                            {cronogramas.map((item, indice) => (
                                <tr key={item.key}>
                                    <td>{item.numeroAula}</td>
                                    <td>{item.assunto}</td>
                                    <td>{item.descricao}</td>
                                    <td>
                                        <button type="button" className="btn-action btnstop"
                                                title="Mover para cima"
                                                disabled={indice === 0}
                                                onClick={() => moverCronograma(indice, -1)}>↑
                                        </button>
                                        <button type="button" className="btn-action btngreen"
                                                title="Mover para baixo"
                                                disabled={indice === cronogramas.length - 1}
                                                onClick={() => moverCronograma(indice, 1)}>↓
                                        </button>
                                    </td>
                                    <td>
                                        <button type="button" className="btn-action btnred" title="Remover"
                                                onClick={() => removerCronograma(item.key)}>✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="master-detail-empty">Nenhum registro selecionado.</p>
                    )}
                </fieldset>
            ),
        },
        {
            key: 'referenciaBibliografica',
            label: 'Referência Bibliográfica',
            content: (
                <MasterDetail
                    label="Referência Bibliográfica"
                    source={REFERENCIA_BIBLIOGRAFICA_SOURCE}
                    valueKey="id"
                    searchKeys={REFERENCIA_BIBLIOGRAFICA_SEARCH}
                    columns={REFERENCIA_BIBLIOGRAFICA_COLUMNS}
                    items={referenciasBibliograficas}
                    onChange={setReferenciasBibliograficas}
                />
            ),
        },
    ], [data, baseTecnologicas, cronogramas, referenciasBibliograficas, novoCronoNumero, novoCronoAssunto, novoCronoDescricao, updateField]);

    if (carregando) {
        return (
            <PermissionGate permission="READ">
                <main>
                    <h1>Componente Curricular</h1>
                    <div className="div_form">
                        <p className="master-detail-empty">Carregando...</p>
                    </div>
                </main>
            </PermissionGate>
        );
    }

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>{idEdicao ? `Editar Componente Curricular #${idEdicao}` : 'Componente Curricular'}</h1>
                <div className="div_form">
                    <div className="form-title">
                        {idEdicao ? `Componente Curricular #${idEdicao}` : 'Novo Componente Curricular'}
                    </div>
                    <div className="table_form">
                        <Tabs tabs={tabs} initial="componenteCurricular"/>
                        <div className="form-buttons">
                            <button type="button" className="btnstop" title="Salvar registro"
                                    disabled={salvando} onClick={() => void salvar(true)}>
                                {salvando ? 'Salvando...' : 'Gravar'}
                            </button>
                            <button type="button" className="btnblue" title="Salvar e continuar editando"
                                    disabled={salvando} onClick={() => void salvar(false)}>
                                Salvar e Continuar
                            </button>
                            <button type="button" className="btnyellow" title="Voltar para a lista"
                                    onClick={voltar} disabled={salvando}>
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}

function TipoSalaOptions() {
    const [itens, setItens] = useState<ApiItem[]>([]);

    useEffect(() => {
        api.get('/api/educacao/tipo-sala')
            .then((res) => setItens(res.data ?? []))
            .catch(() => setItens([]));
    }, []);

    return (
        <>
            {itens.map((item) => (
                <option key={String(item.id)} value={String(item.id)}>
                    {String((item as any).descricao ?? `#${item.id}`)}
                </option>
            ))}
        </>
    );
}
