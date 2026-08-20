import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../masterDetailSources';

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
                        {key: 'pessoal', label: 'Pessoal', empty: 'Conteúdo de Pessoal.'},
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
