import {useState} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import {MasterDetail} from '../../shared/components/MasterDetail';
import {Wizard, useWizardData} from '../../shared/components/Wizard';
import {
    USUARIO_SOURCE,
    USUARIO_COLUMNS,
    USUARIO_SEARCH,
    AGENDA_SOURCE,
    AGENDA_COLUMNS,
    AGENDA_SEARCH,
    TURNO_TRABALHO_SOURCE,
    TURNO_TRABALHO_COLUMNS,
    TURNO_TRABALHO_SEARCH,
} from '../../shared/services/masterDetailSources';
import type {ApiItem} from '../../features/auth/types';
import {useApi} from '../../shared/services/api';
import {API_PATHS} from '../../shared/services/apiPaths';

const CONSULTOR_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID do Consultor'},
    {key: 'usuarioId', label: 'Consultor/Usuário'},
];

interface ConsultorData {
    entity: {
        id?: number;
        usuarioId?: number;
    };
    agendas: ApiItem[];
    turnosTrabalho: ApiItem[];
}

export default function ViewConsultorFormConsultorListScreen() {
    const [agendas, setAgendas] = useState<ApiItem[]>([]);
    const [turnosTrabalho, setTurnosTrabalho] = useState<ApiItem[]>([]);
    const {data, updateFields} = useWizardData<ConsultorData>({
        entity: {},
        agendas: [],
        turnosTrabalho: [],
    });

    const {get, post} = useApi(API_PATHS.comercial.consultor);

    // Simple form without wizard - using master detail for agendas and turnos
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Consultor</h1>
                <div className="div_form">
                    <div className="form-title">Consultor</div>
                    <div className="table_form">
                        <div style={{marginBottom: '20px'}}>
                            <DataTable path="/api/comercial/consultor" columns={CONSULTOR_COLUMNS}/>
                        </div>
                        <div style={{marginBottom: '20px'}}>
                            <h3>Agendas</h3>
                            <MasterDetail
                                label="Agenda"
                                source={AGENDA_SOURCE}
                                valueKey="id"
                                searchKeys={AGENDA_SEARCH}
                                columns={AGENDA_COLUMNS}
                                items={agendas}
                                onChange={setAgendas}
                            />
                        </div>
                        <div style={{marginBottom: '20px'}}>
                            <h3>Turnos de Trabalho</h3>
                            <MasterDetail
                                label="Turno de Trabalho"
                                source={TURNO_TRABALHO_SOURCE}
                                valueKey="id"
                                searchKeys={TURNO_TRABALHO_SEARCH}
                                columns={TURNO_TRABALHO_COLUMNS}
                                items={turnosTrabalho}
                                onChange={setTurnosTrabalho}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
