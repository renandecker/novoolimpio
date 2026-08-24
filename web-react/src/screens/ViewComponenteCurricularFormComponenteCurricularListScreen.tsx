import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../permissions';
import {MasterDetail} from '../MasterDetail';
import {Wizard, useWizardData} from '../Wizard';
import {
    TIPO_SALA_SOURCE,
    BASE_TECNOLOGICA_SOURCE,
    BASE_TECNOLOGICA_COLUMNS,
    BASE_TECNOLOGICA_SEARCH,
    REFERENCIA_BIBLIOGRAFICA_SOURCE,
    REFERENCIA_BIBLIOGRAFICA_COLUMNS,
    REFERENCIA_BIBLIOGRAFICA_SEARCH,
} from '../masterDetailSources';
import type {ApiItem} from '../types';
import {api, useApi} from '../api';

interface CronogramaItem {
    key: string;
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

export default function ViewComponenteCurricularFormComponenteCurricularListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idEdicao = searchParams.get('id');
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

    useEffect(() => {
        if (idEdicao) {
            (async () => {
                try {
                    const ent = await api.get(`/api/educacao/componente-curricular/${idEdicao}`);
                    updateFields({entity: ent});
                    if (ent.baseTecnologicas) setBaseTecnologicas(ent.baseTecnologicas);
                    if (ent.cronogramas) setCronogramas(ent.cronogramas.map((c: any, i: number) => ({key: `crono-db-${c.id ?? i}`, ...c})));
                    if (ent.referenciasBibliograficas) setReferenciasBibliograficas(ent.referenciasBibliograficas);
                } catch {
                    alert('Não foi possível carregar o componente curricular para edição');
                }
            })();
        }
    }, [idEdicao, updateFields]);

    const {post: saveComponente} = useApi('/api/educacao/componente-curricular');

    const validateStep1 = async (currentData: ComponenteCurricularData) => {
        if (!currentData.entity.descricao || currentData.entity.descricao.length < 3) {
            return 'Nome deve ter pelo menos 3 caracteres';
        }
        if (!currentData.entity.sucinto || currentData.entity.sucinto.length < 3) {
            return 'Sucinto deve ter pelo menos 3 caracteres';
        }
        if (!currentData.entity.ementa || currentData.entity.ementa.length < 3) {
            return 'Ementa deve ter pelo menos 3 caracteres';
        }
        if (currentData.entity.qtdeCoringa === undefined || currentData.entity.qtdeCoringa === null) {
            return 'Informe a quantidade de aulas coringa';
        }
        if (!currentData.entity.cargaHoraria || currentData.entity.cargaHoraria <= 0) {
            return 'Carga horária deve ser maior que zero';
        }
        return true;
    };

    const adicionarCronograma = () => {
        if (!novoCronoNumero && novoCronoNumero !== 0) return;
        if (!novoCronoAssunto.trim()) return;
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

    const handleComplete = async (formData: ComponenteCurricularData) => {
        try {
            await saveComponente({
                ...formData.entity,
                baseTecnologicas: formData.baseTecnologicas,
                cronogramas: formData.cronogramas,
                referenciasBibliograficas: formData.referenciasBibliograficas,
            });
            alert('Componente Curricular salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar componente curricular');
        }
    };

    const renderStep1 = () => (
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
                          style={{gridColumn: 'span 3', minHeight: '90px'}}
                          onChange={(e) => updateField('entity', {...data.entity, ementa: e.target.value})}/>
            </label>
            <label className="form-field">
                <span className="form-label">Nº Aula Coringa *</span>
                <input className="form-input" type="number" min={0} value={data.entity.qtdeCoringa ?? ''}
                       onChange={(e) => updateField('entity', {...data.entity, qtdeCoringa: Number(e.target.value)})}/>
            </label>
            <label className="form-field">
                <span className="form-label">Créditos</span>
                <input className="form-input" type="number" min={0} value={data.entity.creditos ?? ''}
                       onChange={(e) => updateField('entity', {...data.entity, creditos: Number(e.target.value)})}/>
            </label>
            <label className="form-field">
                <span className="form-label">Carga Horária *</span>
                <input className="form-input" type="number" min={1} value={data.entity.cargaHoraria ?? ''}
                       onChange={(e) => updateField('entity', {...data.entity, cargaHoraria: Number(e.target.value)})}/>
            </label>
            <label className="form-field">
                <span className="form-label">Tipo Sala</span>
                <select
                    className="form-input form-select"
                    value={data.entity.tipoSalaId ?? ''}
                    onChange={(e) => updateField('entity', {
                        ...data.entity,
                        tipoSalaId: e.target.value ? Number(e.target.value) : null,
                    })}
                >
                    <option value="">Selecione</option>
                    <TipoSalaOptions/>
                </select>
            </label>
        </div>
    );

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Componente Curricular</h1>
                <div className="div_form">
                    <div className="form-title">Componente Curricular</div>
                    <div className="table_form">
                        <Wizard
                            initialData={data}
                            onDataChange={(merged) => {
                                if (merged.entity) updateField('entity', merged.entity);
                            }}
                            onCancel={() => navigate('/view/componenteCurricular/listComponenteCurricular')}
                            steps={[
                                {
                                    key: 'componenteCurricular',
                                    label: 'Componente Curricular',
                                    content: renderStep1(),
                                    validate: validateStep1,
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
                                                <button type="button" className="btnblue"
                                                        onClick={adicionarCronograma}>
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
                                                                <button type="button" className="btn-action btnred"
                                                                        title="Remover"
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
                                    nextLabel: 'Salvar',
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
                            ]}
                            onComplete={handleComplete}
                        />
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
                    {String(item.descricao ?? `#${item.id}`)}
                </option>
            ))}
        </>
    );
}
