import {useState} from 'react';
import type {ReactNode} from 'react';

import {Modal} from '../../../shared/components/Modal';
import {DataTable, type DataTableColumn, type DataTableRowAction} from '../../../shared/components/DataTable';
import {AutoComplete, type AutoCompleteOption} from '../../../shared/components/AutoComplete';
import {Wizard} from '../../../shared/components/Wizard';
import {api} from '../../../shared/services/api';
import type {ApiItem} from '../../../shared/types/types.ts';

export function formatarData(valor: string | null | undefined): string {
    if (!valor) return '-';
    const [ano, mes, dia] = valor.split('T')[0].split('-');
    if (!ano || !mes || !dia) return valor;
    return `${dia}/${mes}/${ano}`;
}

function CampoInfo({label, valor}: {label: string; valor: ReactNode}) {
    return (
        <div className="modal-field">
            <label>{label}</label>
            <span style={{lineHeight: '34px'}}>{valor ?? '-'}</span>
        </div>
    );
}

function infoGrid(turma: ApiItem | null) {
    const rec = (turma ?? {}) as Record<string, unknown>;
    return (
        <div className="info-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px 16px', marginBottom: '14px'}}>
            <CampoInfo label="Turma" valor={turma ? `#${turma.id} ${turma.nome ?? ''}` : '-'} />
            <CampoInfo label="Unidade" valor={String(rec.unidade_descricao ?? '')} />
            <CampoInfo label="Grupo" valor={String(rec.grupo_descricao ?? '')} />
            <CampoInfo label="Curso" valor={String(rec.curriculo_descricao ?? '')} />
            <CampoInfo label="Componente Curricular" valor={String(rec.componente_curricular_descricao ?? '')} />
            <CampoInfo label="Professor" valor={String(rec.professor_descricao ?? '')} />
            <CampoInfo label="Sala" valor={String(rec.sala_descricao ?? '')} />
            <CampoInfo label="Status" valor={String(rec.status ?? '')} />
            <CampoInfo label="Inscritos" valor={String(rec.inscritos ?? '')} />
            <CampoInfo label="Vagas" valor={String(rec.vagas ?? '')} />
            <CampoInfo label="C.H." valor={String(rec.cargaHoraria ?? '')} />
            <CampoInfo label="Data Início" valor={formatarData(String(rec.dataInicio ?? ''))} />
            <CampoInfo label="Data Fim" valor={formatarData(String(rec.dataFim ?? ''))} />
        </div>
    );
}

const SALA_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'numero', label: 'Número'},
    {key: 'tipoSala', label: 'Tipo'},
    {key: 'capacidade', label: 'Capacidade'},
];

const PROFESSOR_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'nome', label: 'Nome'},
    {key: 'ativo', label: 'Ativo'},
    {key: 'dataInicio', label: 'Início'},
    {key: 'dataFim', label: 'Fim'},
];

const OCORRENCIA_COLUMNS: DataTableColumn[] = [
    {key: 'data', label: 'Data'},
    {key: 'professor_descricao', label: 'Professor'},
    {key: 'sala_descricao', label: 'Sala'},
    {key: 'aulaCoringa', label: 'Aula Coringa'},
    {key: 'aulaPresencial', label: 'Presencial'},
    {key: 'ativo', label: 'Ativo'},
];

const MATRICULA_COLUMNS: DataTableColumn[] = [
    {key: 'contratoId', label: 'Contrato'},
    {key: 'oferecimentoComponenteCurricularId', label: 'Oferecimento'},
    {key: 'formaPagamentoId', label: 'Forma de Pagamento'},
    {key: 'status', label: 'Status'},
    {key: 'data', label: 'Data'},
];

/** <p:dialog id="professores" header="Alterando professor para turma"> */
export function ProfessorModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    const [professor, setProfessor] = useState<AutoCompleteOption | null>(null);

    const fetchProfessores = async (query: string): Promise<AutoCompleteOption[]> => {
        try {
            const {data} = await api.get<Array<Record<string, any>>>('/api/professor/professor');
            const professores = Array.isArray(data) ? data : ((data as any)?.content ?? []);
            const termo = query.trim().toLowerCase();
            return professores
                .filter((p) => String(p.nome ?? p.pessoa?.nome ?? '').toLowerCase().includes(termo))
                .map((p) => ({id: Number(p.id), label: String(p.nome ?? p.pessoa?.nome ?? `#${p.id}`)}));
        } catch {
            return [];
        }
    };

    const salvar = async (endpoint: string, msg = 'Operação realizada com sucesso!') => {
        try {
            await api.post(`/api/educacao/turma/${turma?.id}/${endpoint}`, {professorId: professor?.id});
            alert(msg);
        } catch {
            alert('Erro ao executar a operação.');
        }
    };

    if (!turma) return null;

    const ocorrenciaActions: DataTableRowAction[] = [
        {
            key: 'salvarPorAula',
            title: 'Salvar por aula',
            className: 'btngreen',
            permission: 'CREATE',
            onClick: async (item) => {
                await api.post(`/api/educacao/ocorrencia-componente-curricular/${item.id}/alterar-professor`, {
                    professorId: professor?.id,
                });
                alert('Professor da aula alterado!');
            },
        },
    ];

    return (
        <Modal title={`Alterando professor da turma #${turma.id} ${turma.nome ?? ''}`} open onClose={onClose} size="xl">
            <div className="info-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px 16px', marginBottom: '14px'}}>
                <CampoInfo label="Turma" valor={`#${turma.id} ${turma.nome ?? ''}`} />
                <CampoInfo label="Status" valor={String((turma as Record<string, unknown>).status ?? '')} />
                <CampoInfo label="Professor atual" valor={String((turma as Record<string, unknown>).professor_descricao ?? '')} />
            </div>

            <div className="form-title">Aulas Futuras</div>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: '8px', flexWrap: 'wrap'}}>
                <div style={{minWidth: '320px'}}>
                    <AutoComplete
                        label="Professor"
                        placeholder="Pesquise pelo nome do professor"
                        value={professor}
                        onChange={setProfessor}
                        fetchOptions={fetchProfessores}
                        minChars={1}
                    />
                </div>
                <button type="button" className="btnblue" onClick={() => salvar('alterar-professor', 'Professor das aulas futuras alterado!')}>
                    Salvar aula(s) futuras
                </button>
                <button type="button" className="btnblue" onClick={() => salvar('alterar-professor-todas', 'Professor de todas as aulas alterado!')}>
                    Salvar todas aula(s)
                </button>
                <button type="button" className="btnred" onClick={onClose}>Cancelar</button>
            </div>

            <div className="form-title" style={{marginTop: '16px'}}>Por Aula</div>
            <DataTable
                path="/api/educacao/ocorrencia-componente-curricular"
                columns={OCORRENCIA_COLUMNS}
                params={{turmaId: turma.id}}
                module="educacao"
                hideCreate
                hideUpdate
                hideDelete
                hideView
                extraRowActions={ocorrenciaActions}
            />
        </Modal>
    );
}

/** <p:dialog id="salas" header="Alterando sala da turma"> */
export function SalaModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    const [vagas, setVagas] = useState<string>(() => String((turma as Record<string, unknown>)?.vagas ?? ''));

    if (!turma) return null;

    const atualizarVagas = async () => {
        try {
            await api.post(`/api/educacao/turma/${turma.id}/atualizar-vagas`, {vagas: Number(vagas)});
            alert('Vagas atualizadas!');
        } catch {
            alert('Erro ao atualizar vagas.');
        }
    };

    const salaActions: DataTableRowAction[] = [
        {
            key: 'alterarSala',
            title: 'Alterar Sala',
            className: 'btngreen',
            onClick: async (item) => {
                try {
                    await api.post(`/api/educacao/turma/${turma.id}/alterar-sala`, {salaId: item.id});
                    alert(`Sala #${item.id} atribuída à turma ${turma.nome}!`);
                    onClose();
                } catch {
                    alert('Erro ao alterar a sala.');
                }
            },
        },
    ];

    return (
        <Modal title={`Alterando sala da turma #${turma.id} ${turma.nome ?? ''}`} open onClose={onClose} size="lg">
            {infoGrid(turma)}

            <div className="div_form">
                <div className="form-title">Vagas</div>
                <div style={{display: 'flex', alignItems: 'flex-end', gap: '8px', flexWrap: 'wrap'}}>
                    <div className="modal-field">
                        <label>Capacidade de vagas</label>
                        <input type="number" value={vagas} min={0} onChange={(e) => setVagas(e.target.value)} />
                    </div>
                    <button type="button" className="btnblue" onClick={atualizarVagas}>Atualizar vagas</button>
                </div>
            </div>

            <div className="div_form" style={{marginTop: '16px'}}>
                <div className="form-title">Salas</div>
                <DataTable
                    path="/api/educacao/sala"
                    columns={SALA_COLUMNS}
                    module="educacao"
                    hideCreate
                    hideUpdate
                    hideDelete
                    hideView
                    extraRowActions={salaActions}
                />
            </div>
        </Modal>
    );
}

/** <p:dialog id="dialogInformacoes" header="Informações sobre a turma"> */
export function InformacoesModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    if (!turma) return null;
    return (
        <Modal title="Informações sobre a turma" open onClose={onClose} size="xl">
            {infoGrid(turma)}

            <div className="div_form">
                <div className="form-title">Professores</div>
                <DataTable
                    path="/api/professor/professor"
                    columns={PROFESSOR_COLUMNS}
                    module="basico"
                    hideCreate
                    hideUpdate
                    hideDelete
                    hideView
                />
            </div>

            <div className="div_form" style={{marginTop: '16px'}}>
                <div className="form-title">Alterações realizadas na turma</div>
                <DataTable
                    path="/api/educacao/ocorrencia-componente-curricular"
                    columns={OCORRENCIA_COLUMNS}
                    params={{turmaId: turma.id}}
                    module="educacao"
                    hideCreate
                    hideUpdate
                    hideDelete
                    hideView
                />
            </div>

            <div className="div_form" style={{marginTop: '16px'}}>
                <div className="form-title">Matrículas</div>
                <DataTable
                    path="/api/educacao/matricula"
                    columns={MATRICULA_COLUMNS}
                    params={{turmaId: turma.id}}
                    module="educacao"
                    hideCreate
                    hideUpdate
                    hideDelete
                    hideView
                />
            </div>
        </Modal>
    );
}

/** <p:dialog id="cancelarTurma" header="Cancelamento de Turma"> */
export function CancelarProrrogarModal({turma, onClose, onProrrogar}: {turma: ApiItem | null; onClose: () => void; onProrrogar: () => void}) {
    if (!turma) return null;

    const cancelarTurma = async () => {
        if (!window.confirm(`Confirma o cancelamento da turma #${turma.id}?`)) return;
        try {
            await api.post(`/api/educacao/turma/${turma.id}/cancelar`);
            alert('Turma cancelada com sucesso!');
            onClose();
        } catch {
            alert('Erro ao cancelar a turma.');
        }
    };

    return (
        <Modal title={`Cancelamento de Turma #${turma.id} ${turma.nome ?? ''}`} open onClose={onClose} size="xl">
            <div className="info-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px 16px', marginBottom: '14px'}}>
                <CampoInfo label="Turma" valor={`#${turma.id} ${turma.nome ?? ''}`} />
                <CampoInfo label="Unidade" valor={String((turma as Record<string, unknown>).unidade_descricao ?? '')} />
                <CampoInfo label="Sala" valor={String((turma as Record<string, unknown>).sala_descricao ?? '')} />
                <CampoInfo label="Vagas" valor={String((turma as Record<string, unknown>).vagas ?? '')} />
                <CampoInfo label="Data Início" valor={formatarData(String((turma as Record<string, unknown>).dataInicio ?? ''))} />
                <CampoInfo label="Status" valor={String((turma as Record<string, unknown>).status ?? '')} />
            </div>

            <div className="div_form">
                <div className="form-title">Professores</div>
                <DataTable
                    path="/api/professor/professor"
                    columns={PROFESSOR_COLUMNS}
                    module="basico"
                    hideCreate
                    hideUpdate
                    hideDelete
                    hideView
                />
            </div>

            <div className="div_form" style={{marginTop: '16px'}}>
                <div className="form-title">Alunos</div>
                <DataTable
                    path="/api/educacao/matricula"
                    columns={MATRICULA_COLUMNS}
                    params={{turmaId: turma.id}}
                    module="educacao"
                    hideCreate
                    hideUpdate
                    hideDelete
                    hideView
                />
            </div>

            <div className="modal-actions form-footer" style={{borderTop: '1px solid #ddd', paddingTop: '12px', marginTop: '16px'}}>
                <button type="button" className="btnblue" onClick={onProrrogar} title="Prorrogar a turma">
                    Prorrogar Turma
                </button>
                <button type="button" className="btnred" onClick={cancelarTurma} title="Cancelar a turma">
                    Cancelar Turma
                </button>
                <button type="button" className="btn-form-back" onClick={onClose}>Fechar</button>
            </div>
        </Modal>
    );
}

const DIAS_AULA_COLUMNS: DataTableColumn[] = [
    {key: 'data', label: 'Data'},
    {key: 'professor_descricao', label: 'Professor'},
    {key: 'sala_descricao', label: 'Sala'},
    {key: 'aulaCoringa', label: 'Aula Coringa'},
    {key: 'aulaPresencial', label: 'Presencial'},
    {key: 'ativo', label: 'Ativo'},
];

/** <p:dialog id="dialogProrrogando" widgetVar="prorrogando" header="Prorrogando Turma"><p:wizard> */
export function ProrrogarTurmaModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    if (!turma) return null;

    const prorrogar = async () => {
        try {
            await api.post(`/api/educacao/turma/${turma.id}/prorrogar`);
            alert('Turma prorrogada com sucesso!');
        } catch {
            alert('Erro ao prorrogar a turma.');
        }
        onClose();
    };

    return (
        <Modal title={`Prorrogando a turma #${turma.id} ${turma.nome ?? ''}`} open onClose={onClose} size="xl">
            <Wizard
                completeLabel="Prorrogar"
                onComplete={prorrogar}
                steps={[
                    {
                        key: 'diaAula',
                        label: 'Dias Aula',
                        content: <DataTable path="/api/educacao/ocorrencia-componente-curricular" columns={DIAS_AULA_COLUMNS} params={{turmaId: turma.id}} module="educacao" hideCreate hideUpdate hideDelete hideView />,
                    },
                    {
                        key: 'comparativoAula',
                        label: 'Comparativo Aula',
                        content: (
                            <div className="div_form">
                                <div className="form-title">Comparativo de aulas (original x nova)</div>
                                <DataTable path="/api/educacao/ocorrencia-componente-curricular" columns={DIAS_AULA_COLUMNS} params={{turmaId: turma.id}} module="educacao" hideCreate hideUpdate hideDelete hideView />
                            </div>
                        ),
                    },
                    {
                        key: 'selecioneProfessor',
                        label: 'Professor',
                        nextLabel: 'Prorrogar',
                        content: (
                            <div className="div_form">
                                <div className="form-title">Selecione o professor para as novas aulas</div>
                                <DataTable path="/api/professor/professor" columns={PROFESSOR_COLUMNS} module="basico" hideCreate hideUpdate hideDelete hideView />
                            </div>
                        ),
                    },
                ]}
            />
            <div className="modal-actions form-footer" style={{marginTop: '14px'}}>
                <button type="button" className="btn-form-back" onClick={onClose}>Cancelar</button>
            </div>
        </Modal>
    );
}

const NOVA_TURMA_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'unidade_descricao', label: 'Unidade'},
    {key: 'grupo_descricao', label: 'Grupo'},
    {key: 'curriculo_descricao', label: 'Curso'},
    {key: 'componente_curricular_descricao', label: 'Componente Curricular'},
    {key: 'professor_descricao', label: 'Professor'},
    {key: 'sala_descricao', label: 'Sala'},
    {key: 'vagas', label: 'Vagas'},
    {key: 'dataInicio', label: 'Data Início'},
];

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

/** <p:dialog id="formTrocarTurma" header="Trocar aluno da turma"><p:wizard id="wizardtroca"> */
export function TrocarTurmaModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    const [dias, setDias] = useState<string[]>(['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta']);

    if (!turma) return null;

    const toggleDia = (dia: string) => {
        setDias((atual) => (atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia]));
    };

    const finalizar = async () => {
        try {
            await api.post(`/api/educacao/turma/${turma.id}/finalizar-troca`, {diasSemana: dias});
            alert('Troca de turma finalizada e documento gerado!');
        } catch {
            alert('Erro ao finalizar a troca de turma.');
        }
        onClose();
    };

    return (
        <Modal title={`Trocar aluno da turma #${turma.id} ${turma.nome ?? ''}`} open onClose={onClose} size="xl">
            <Wizard
                completeLabel="Finalizar e gerar documento"
                onComplete={finalizar}
                steps={[
                    {
                        key: 'selecionarAluno',
                        label: 'Selecionando Aluno',
                        content: (
                            <div className="div_form">
                                <div className="form-title">Selecione o (s) aluno (s) que serão transferidos</div>
                                <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS} params={{turmaId: turma.id}} module="educacao" hideCreate hideUpdate hideDelete hideView />
                            </div>
                        ),
                    },
                    {
                        key: 'novaTurma',
                        label: 'Selecionando nova Turma',
                        content: (
                            <div className="div_form">
                                <div className="form-title">Selecione a nova turma e os dias da semana</div>
                                <DataTable path="/api/educacao/turma" columns={NOVA_TURMA_COLUMNS} module="educacao" hideCreate hideUpdate hideDelete hideView />
                                <div className="form-title" style={{marginTop: '12px'}}>Dias da Semana</div>
                                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                    {DIAS_SEMANA.map((dia) => (
                                        <label key={dia} style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                                            <input type="checkbox" checked={dias.includes(dia)} onChange={() => toggleDia(dia)} />
                                            {dia}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ),
                    },
                ]}
            />
            <div className="modal-actions form-footer" style={{marginTop: '14px'}}>
                <button type="button" className="btn-form-back" onClick={onClose}>Cancelar</button>
            </div>
        </Modal>
    );
}

/** <p:dialog id="diarioDialog" header="Diário de Classe"> */
export function DiarioModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    if (!turma) return null;

    const gerar = () => {
        window.open(`/api/educacao/turma/${turma.id}/diario-classe/gerar`, '_blank');
    };

    return (
        <Modal title={`Diário de Classe - Turma #${turma.id} ${turma.nome ?? ''}`} open onClose={onClose} size="md">
            <p className="master-detail-empty" style={{margin: '8px 0 16px'}}>
                Gere o diário de classe da turma #<strong>{turma.id}</strong> - {turma.nome} em PDF.
            </p>
            <div className="modal-actions form-footer" style={{borderTop: '1px solid #ddd', paddingTop: '12px'}}>
                <button type="button" className="btnblue" onClick={gerar}>
                    Gerar Diário de Classe
                </button>
                <button type="button" className="btn-form-back" onClick={onClose}>Fechar</button>
            </div>
        </Modal>
    );
}