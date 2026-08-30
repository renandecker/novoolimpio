import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../../shared/services/masterDetailSources';

export default function ViewUsuarioFormUsuarioRapidoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Usuario Rapido</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'pessoal', label: 'Pessoal', path: '/api/view/usuario/formUsuarioRapido'},
                        {
                            key: 'unidade',
                            label: 'Unidade',
                            masterDetail: {
                                label: 'Unidade',
                                source: UNIDADE_SOURCE,
                                valueKey: 'id',
                                searchKeys: UNIDADE_SEARCH,
                                columns: UNIDADE_COLUMNS
                            }
                        },
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
