import {PermissionGate} from '../../../shared/services/permissions';
import {ModuleTabs} from '../../../shared/components/ModuleTabs';
import {COMPONENTE_SOURCE, COMPONENTE_COLUMNS, COMPONENTE_SEARCH} from '../../../shared/services/masterDetailSources';

export default function ViewProfessorFormProfessorListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Professor</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'informacoes', label: 'Informações', path: '/api/view/professor/formProfessor'},
                        {key: 'disponibilidade', label: 'Disponibilidade', empty: 'Conteúdo de Disponibilidade.'},
                        {
                            key: 'componenteCurricular',
                            label: 'Componente Curricular',
                            masterDetail: {
                                label: 'Componente Curricular',
                                source: COMPONENTE_SOURCE,
                                valueKey: 'id',
                                searchKeys: COMPONENTE_SEARCH,
                                columns: COMPONENTE_COLUMNS
                            }
                        },
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
