import {useState} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';
import {MasterDetail} from '../../shared/components/MasterDetail';
import {Tabs} from '../../shared/components/Tabs';
import {
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    AGENDA_SOURCE,
    AGENDA_COLUMNS,
    AGENDA_SEARCH,
    PERFIL_SOURCE,
    PERFIL_COLUMNS,
    PERFIL_SEARCH,
    PESSOA_SOURCE,
    PESSOA_COLUMNS,
    PESSOA_SEARCH,
    USUARIO_SOURCE,
    USUARIO_COLUMNS,
    USUARIO_SEARCH,
    TURMA_SOURCE,
    TURMA_COLUMNS,
    TURMA_SEARCH,
    COMPONENTE_SOURCE,
    COMPONENTE_COLUMNS,
    COMPONENTE_SEARCH,
    CURSO_SOURCE,
    CURSO_COLUMNS,
    CURSO_SEARCH,
    GRUPO_SOURCE,
    GRUPO_COLUMNS,
    GRUPO_SEARCH,
} from '../../shared/services/masterDetailSources';
import type {ApiItem} from '../../shared/types/index';

export default function ViewComunicacaoFormComunicacaoListScreen() {
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [agendas, setAgendas] = useState<ApiItem[]>([]);
    const [perfils, setPerfils] = useState<ApiItem[]>([]);
    const [pessoas, setPessoas] = useState<ApiItem[]>([]);
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [turmas, setTurmas] = useState<ApiItem[]>([]);
    const [componentes, setComponentes] = useState<ApiItem[]>([]);
    const [cursos, setCursos] = useState<ApiItem[]>([]);
    const [grupos, setGrupos] = useState<ApiItem[]>([]);

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Comunicacao</h1>
                <div className="div_form">
                    <div className="form-title">Comunicação</div>
                    <div className="table_form">
                        <Tabs
                            tabs={[
                                {
                                    key: 'geral',
                                    label: 'Geral',
                                    content: <p className="master-detail-empty">Formulário de comunicação (título e
                                        mensagem).</p>
                                },
                                {
                                    key: 'unidade',
                                    label: 'Id_unidade',
                                    content: (
                                        <MasterDetail
                                            label="Unidade"
                                            source={UNIDADE_SOURCE}
                                            valueKey="id"
                                            searchKeys={UNIDADE_SEARCH}
                                            columns={UNIDADE_COLUMNS}
                                            items={unidades}
                                            onChange={setUnidades}
                                        />
                                    ),
                                },
                                {
                                    key: 'agenda',
                                    label: 'Agenda',
                                    content: (
                                        <div className="form-grid">
                                            <div style={{gridColumn: '1 / -1'}}>
                                                <MasterDetail
                                                    label="Agendas Selecionadas"
                                                    source={AGENDA_SOURCE}
                                                    valueKey="id"
                                                    searchKeys={AGENDA_SEARCH}
                                                    columns={AGENDA_COLUMNS}
                                                    items={agendas}
                                                    onChange={setAgendas}
                                                />
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'perfil',
                                    label: 'Perfil',
                                    content: (
                                        <div className="form-grid">
                                            <div style={{gridColumn: '1 / -1'}}>
                                                <MasterDetail
                                                    label="Perfis Selecionados"
                                                    source={PERFIL_SOURCE}
                                                    valueKey="id"
                                                    searchKeys={PERFIL_SEARCH}
                                                    columns={PERFIL_COLUMNS}
                                                    items={perfils}
                                                    onChange={setPerfils}
                                                />
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'pessoa',
                                    label: 'Pessoa',
                                    content: (
                                        <MasterDetail
                                            label="Pessoa"
                                            source={PESSOA_SOURCE}
                                            valueKey="id"
                                            searchKeys={PESSOA_SEARCH}
                                            columns={PESSOA_COLUMNS}
                                            items={pessoas}
                                            onChange={setPessoas}
                                        />
                                    ),
                                },
                                {
                                    key: 'usuario',
                                    label: 'Usuário',
                                    content: (
                                        <MasterDetail
                                            label="Usuário"
                                            source={USUARIO_SOURCE}
                                            valueKey="id"
                                            searchKeys={USUARIO_SEARCH}
                                            columns={USUARIO_COLUMNS}
                                            items={usuarios}
                                            onChange={setUsuarios}
                                        />
                                    ),
                                },
                                {
                                    key: 'turma',
                                    label: 'Turma',
                                    content: (
                                        <MasterDetail
                                            label="Turma"
                                            source={TURMA_SOURCE}
                                            valueKey="id"
                                            searchKeys={TURMA_SEARCH}
                                            columns={TURMA_COLUMNS}
                                            items={turmas}
                                            onChange={setTurmas}
                                        />
                                    ),
                                },
                                {
                                    key: 'componente',
                                    label: 'Componente',
                                    content: (
                                        <MasterDetail
                                            label="Componente Curricular"
                                            source={COMPONENTE_SOURCE}
                                            valueKey="id"
                                            searchKeys={COMPONENTE_SEARCH}
                                            columns={COMPONENTE_COLUMNS}
                                            items={componentes}
                                            onChange={setComponentes}
                                        />
                                    ),
                                },
                                {
                                    key: 'curso',
                                    label: 'Curso',
                                    content: (
                                        <MasterDetail
                                            label="Curso"
                                            source={CURSO_SOURCE}
                                            valueKey="id"
                                            searchKeys={CURSO_SEARCH}
                                            columns={CURSO_COLUMNS}
                                            items={cursos}
                                            onChange={setCursos}
                                        />
                                    ),
                                },
                                {
                                    key: 'grupo',
                                    label: 'Grupo',
                                    content: (
                                        <MasterDetail
                                            label="Grupo"
                                            source={GRUPO_SOURCE}
                                            valueKey="id"
                                            searchKeys={GRUPO_SEARCH}
                                            columns={GRUPO_COLUMNS}
                                            items={grupos}
                                            onChange={setGrupos}
                                        />
                                    ),
                                },
                            ]}
                        />
                    </div>
                </div>
                <DataTable path="/api/view/comunicacao/formComunicacao"/>
            </main>
        </PermissionGate>
    );
}
