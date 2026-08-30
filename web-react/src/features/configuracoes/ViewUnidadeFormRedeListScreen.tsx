import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../../shared/services/masterDetailSources';

export default function ViewUnidadeFormRedeListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Rede</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'geral', label: 'Geral', path: '/api/view/unidade/formRede'},
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
                        {key: 'pessoal', label: 'Pessoal', empty: 'ConteÃºdo de Pessoal.'},
                        {
                            key: 'unidade2',
                            label: 'Unidade 2',
                            masterDetail: {
                                label: 'Unidade 2',
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
