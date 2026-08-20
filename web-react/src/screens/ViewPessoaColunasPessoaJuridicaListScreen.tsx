import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../masterDetailSources';

export default function ViewPessoaColunasPessoaJuridicaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Colunas Pessoa Juridica</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'identificacao', label: 'Identificação', path: '/api/view/pessoa/colunasPessoaJuridica'},
                        {
                            key: 'informacoesBasicas',
                            label: 'Informações Básicas',
                            empty: 'Conteúdo de Informações Básicas.'
                        },
                        {key: 'contato', label: 'Contato', empty: 'Conteúdo de Contato.'},
                        {key: 'endereco', label: 'Endereço', empty: 'Conteúdo de Endereço.'},
                        {
                            key: 'unidades',
                            label: 'Unidades',
                            masterDetail: {
                                label: 'Unidades',
                                source: UNIDADE_SOURCE,
                                valueKey: 'id',
                                searchKeys: UNIDADE_SEARCH,
                                columns: UNIDADE_COLUMNS
                            }
                        },
                        {key: 'outros', label: 'Outros', empty: 'Conteúdo de Outros.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
