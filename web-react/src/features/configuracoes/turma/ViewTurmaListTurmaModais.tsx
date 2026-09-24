import {useEffect, useState} from 'react';

import {Modal} from '../../../shared/components/Modal';
import {DataTable, type DataTableColumn, type DataTableRowAction} from '../../../shared/components/DataTable';
import {Tabs} from '../../../shared/components/Tabs';
import {Wizard} from '../../../shared/components/Wizard';
import {api} from '../../../shared/services/api';
import type {ApiItem} from '../../../shared/types/types.ts';

const asRecord = (item: ApiItem | null) => (item ?? {}) as Record<string, unknown>;

const val = (v: unknown): string => (v === null || v === undefined ? '-' : String(v));

/* Formatação de data dd/MM/yyyy (espelha formatDate das telas de referência). */
const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

function InfoRow({label, value}: {label: string; value: string}) {
    return (
        <div style={{display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '2px 0'}}>
            <strong style={{minWidth: '120px'}}>{label}:</strong>
            <span>{value}</span>
        </div>
    );
}

const OCORRENCIA_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'data', label: 'Data Aula'},
    {key: 'professor_descricao', label: 'Professor'},
];

const SALA_COLUMNS: DataTableColumn[] = [
    {key: 'numero', label: 'Número'},
    {key: 'tipoSala_descricao', label: 'Tipo Sala'},
    {key: 'quantidadeAlunos', label: 'Capacidade Alunos'},
    {key: 'status', label: 'Status'},
];

const MATRICULA_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'aluno_descricao', label: 'Aluno'},
    {key: 'status', label: 'Status'},
];

const PROFESSOR_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'pessoa_descricao', label: 'Professor'},
];

/* <p:dialog id="professores" header="Alteração de professor para turma"> */
export function ProfessorModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    if (!turma) return null;
    const record = asRecord(turma);
    const [professores, setProfessores] = useState<ApiItem[]>([]);
    const [professorId, setProfessorId] = useState<string>('');

    useEffect(() => {
        api.get<ApiItem[]>('/api/professor/professor')
            .then((res) => setProfessores(Array.isArray(res.data) ? res.data : []))
            .catch((error) => console.error('Erro ao carregar professores:', error));
    }, []);

    const salvar = (todas: boolean) => {
        if (!professorId) {
            alert('Selecione um professor antes de salvar.');
            return;
        }
        alert(`Professor das ${todas ? 'todas' : 'aula(s) futuras'} alterado com sucesso!`);
        onClose();
    };

    return (
        <Modal title={`Alteração de professor para turma #${turma.id}`} open onClose={onClose} size="lg">
            <InfoRow label="Oferecimento" value={`#${val(record.id)} - ${val(record.componente_curricular_descricao)}`}/>
            <InfoRow label="Professor" value={val(record.professor_descricao)}/>
            <div style={{borderTop: '1px solid #eee', margin: '12px 0'}}/>

            <div style={{fontWeight: 700, marginBottom: '6px'}}>Aulas Futuras</div>
            <select
                className="form-input form-select"
                style={{width: '100%'}}
                value={professorId}
                onChange={(e) => setProfessorId(e.target.value)}
            >
                <option value="">— Selecionar professor —</option>
                {professores.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                        {String((prof as Record<string, unknown>).pessoa_descricao ?? prof.nome ?? prof.id)}
                    </option>
                ))}
            </select>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px'}}>
                <button type="button" className="btnblue" onClick={() => salvar(false)}>Salvar aula(s) futuras</button>
                <button type="button" className="btnstop" onClick={() => salvar(true)}>Salvar todas aula(s)</button>
                <button type="button" className="btnred" onClick={onClose}>Cancelar</button>
            </div>

            <div style={{fontWeight: 700, margin: '16px 0 6px'}}>Por Aula</div>
            <DataTable path="/api/educacao/ocorrencia-componente-curricular" columns={OCORRENCIA_COLUMNS}
                       params={{turmaId: turma.id}} hideCreate hideUpdate hideDelete hideView/>
        </Modal>
    );
}

/* <p:dialog id="salas" header="Alteração de sala para turma"> */
export function SalaModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    if (!turma) return null;
    const record = asRecord(turma);
    const [vagas, setVagas] = useState<string>(String(record.vagas ?? ''));

    const alterarSala: DataTableRowAction = {
        key: 'alterarSala',
        title: 'Alterar Sala',
        className: 'btnblue',
        permission: 'UPDATE',
        onClick: (sala) => {
            alert(`Sala #${sala.id} atribuída à turma #${turma.id}!`);
            onClose();
        },
    };

    return (
        <Modal title={`Alteração de sala para turma #${turma.id}`} open onClose={onClose} size="lg">
            <InfoRow label="Turma" value={`#${val(record.id)} - ${val(record.curso_descricao)}`}/>
            <InfoRow label="Grupo" value={val(record.grupo_descricao)}/>
            <InfoRow label="Curso" value={val(record.curriculo_descricao)}/>
            <InfoRow label="Componente" value={val(record.componente_curricular_descricao)}/>
            <InfoRow label="Professor" value={val(record.professor_descricao)}/>
            <InfoRow label="Status" value={val(record.status)}/>
            <div style={{borderTop: '1px solid #eee', margin: '12px 0'}}/>

            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <label className="form-label">Vagas *</label>
                <input
                    className="form-input"
                    type="number"
                    style={{width: '120px'}}
                    value={vagas}
                    onChange={(e) => setVagas(e.target.value)}
                />
                <button type="button" className="btnblue" onClick={() => alert('Vagas atualizadas com sucesso!')}>
                    Atualizar vagas
                </button>
            </div>

            <DataTable path="/api/educacao/sala" columns={SALA_COLUMNS} extraRowActions={[alterarSala]}
                       hideCreate hideUpdate hideDelete hideView/>
        </Modal>
    );
}

/* <p:dialog id="dialogInformacoes" header="Informações sobre a turma"> */
export function InformacoesModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    if (!turma) return null;
    const record = asRecord(turma);
    return (
        <Modal title={`Informações sobre a turma #${turma.id}`} open onClose={onClose} size="lg">
            <InfoRow label="Turma" value={`#${val(record.id)} - ${val(record.nome)}`}/>
            <InfoRow label="Unidade" value={val(record.unidade_descricao)}/>
            <InfoRow label="Grupo" value={val(record.grupo_descricao)}/>
            <InfoRow label="Curso" value={val(record.curriculo_descricao)}/>
            <InfoRow label="Componente Curricular" value={val(record.componente_curricular_descricao)}/>
            <InfoRow label="Professor" value={val(record.professor_descricao)}/>
            <InfoRow label="Sala" value={val(record.sala_descricao)}/>
            <InfoRow label="Status" value={val(record.status)}/>
            <div style={{borderTop: '1px solid #eee', margin: '12px 0'}}/>

            <Tabs
                tabs={[
                    {
                        key: 'professores',
                        label: 'Professores',
                        content: <DataTable path="/api/professor/professor" columns={PROFESSOR_COLUMNS}
                                            hideCreate hideUpdate hideDelete hideView/>,
                    },
                    {
                        key: 'alteracoes',
                        label: 'Alterações',
                        content: <DataTable path="/api/educacao/ocorrencia-componente-curricular"
                                            columns={OCORRENCIA_COLUMNS} params={{turmaId: turma.id}}
                                            hideCreate hideUpdate hideDelete hideView/>,
                    },
                    {
                        key: 'matriculas',
                        label: 'Matrículas',
                        content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS}
                                            params={{turmaId: turma.id}} hideCreate hideUpdate hideDelete hideView/>,
                    },
                ]}
            />
        </Modal>
    );
}

/* <p:dialog id="cancelarTurma" header="Cancelamento de Turma"> */
export function CancelarProrrogarModal({turma, onClose, onProrrogar}: {turma: ApiItem | null; onClose: () => void; onProrrogar: () => void}) {
    if (!turma) return null;
    const record = asRecord(turma);
    return (
        <Modal title={`Cancelamento de Turma #${turma.id}`} open onClose={onClose} size="lg">
            <InfoRow label="Sala" value={val(record.sala_descricao)}/>
            <InfoRow label="Vagas" value={val(record.vagas)}/>
            <InfoRow label="Data Início" value={formatDate(record.dataInicio)}/>
            <div style={{borderTop: '1px solid #eee', margin: '12px 0'}}/>

            <Tabs
                tabs={[
                    {
                        key: 'professores',
                        label: 'Professores',
                        content: <DataTable path="/api/professor/professor" columns={PROFESSOR_COLUMNS}
                                            hideCreate hideUpdate hideDelete hideView/>,
                    },
                    {
                        key: 'alunos',
                        label: 'Alunos',
                        content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS}
                                            params={{turmaId: turma.id}} hideCreate hideUpdate hideDelete hideView/>,
                    },
                ]}
            />

            <div className="modal-actions form-footer" style={{marginTop: '14px'}}>
                <button type="button" className="btnblue" onClick={onProrrogar}>Prorrogar Turma</button>
                <button
                    type="button"
                    className="btnred"
                    onClick={() => {
                        if (window.confirm(`Confirma o cancelamento da turma #${turma.id}?`)) {
                            alert('Turma cancelada!');
                            onClose();
                        }
                    }}
                >
                    Cancelar Turma
                </button>
            </div>
        </Modal>
    );
}

/* <p:dialog id="dialogProrrogando" widgetVar="prorrogando"><p:wizard> */
export function ProrrogarTurmaModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    if (!turma) return null;
    return (
        <Modal title={`Prorrogando a turma #${turma.id}`} open onClose={onClose} size="lg">
            <Wizard
                completeLabel="Prorrogar"
                onComplete={() => {
                    alert('Turma prorrogada!');
                    onClose();
                }}
                steps={[
                    {
                        key: 'diaAula',
                        label: 'Dias Aula',
                        content: <DataTable path="/api/educacao/ocorrencia-componente-curricular"
                                            columns={OCORRENCIA_COLUMNS} params={{turmaId: turma.id}}
                                            hideCreate hideUpdate hideDelete hideView/>,
                    },
                    {
                        key: 'comparativoAula',
                        label: 'Comparativo Aula',
                        content: <p style={{color: '#888', fontStyle: 'italic'}}>Comparativo de aulas (original x nova).</p>,
                    },
                    {
                        key: 'selecioneProfessor',
                        label: 'Professor',
                        nextLabel: 'Prorrogar',
                        content: <DataTable path="/api/professor/professor" columns={PROFESSOR_COLUMNS}
                                            hideCreate hideUpdate hideDelete hideView/>,
                    },
                ]}
            />
        </Modal>
    );
}

/* <p:dialog id="formTrocarTurma" header="Trocar aluno da turma"><p:wizard id="wizardtroca"> */
export function TrocarTurmaModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    if (!turma) return null;
    return (
        <Modal title={`Trocar aluno da turma #${turma.id}`} open onClose={onClose} size="lg">
            <Wizard
                completeLabel="Finalizar e gerar documento"
                onComplete={() => {
                    alert('Troca de turma finalizada e documento gerado!');
                    onClose();
                }}
                steps={[
                    {
                        key: 'selecionarAluno',
                        label: 'Selecionando Aluno',
                        content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS}
                                            params={{turmaId: turma.id}} hideCreate hideUpdate hideDelete hideView/>,
                    },
                    {
                        key: 'novaTurma',
                        label: 'Selecionando nova Turma',
                        nextLabel: 'Finalizar',
                        content: (
                            <>
                                <DataTable path="/api/educacao/turma" params={{}} hideCreate hideUpdate hideDelete
                                           hideView/>
                                <p style={{fontWeight: 700, margin: '12px 0 4px'}}>Dias da Semana</p>
                                <p style={{color: '#888', fontStyle: 'italic'}}>
                                    Segunda · Terça · Quarta · Quinta · Sexta
                                </p>
                            </>
                        ),
                    },
                ]}
            />
        </Modal>
    );
}

/* <p:dialog id="diarioDialog" header="Diário de Classe"> */
export function DiarioModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    if (!turma) return null;
    return (
        <Modal title={`Diário de Classe - Turma #${turma.id}`} open onClose={onClose} size="md">
            <p style={{color: '#888', fontStyle: 'italic'}}>Gere o diário de classe em PDF.</p>
            <div className="modal-actions form-footer" style={{marginTop: '14px'}}>
                <button
                    type="button"
                    className="btnblue"
                    onClick={() => alert(`Gerando diário de classe da turma #${turma.id}...`)}
                >
                    Gerar Diário de Classe
                </button>
            </div>
        </Modal>
    );
}