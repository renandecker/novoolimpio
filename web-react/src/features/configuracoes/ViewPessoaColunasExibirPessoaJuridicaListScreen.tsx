import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../../shared/services/masterDetailSources';

export default function ViewPessoaColunasExibirPessoaJuridicaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Colunas Exibir Pessoa Juridica</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'informacoesBasicas',
                            label: 'InformaÃ§Ãµes BÃ¡sicas',
                            path: '/api/view/pessoa/colunasExibirPessoaJuridica'
                        },
                        {key: 'contato', label: 'Contato', empty: 'ConteÃºdo de Contato.'},
                        {key: 'endereco', label: 'EndereÃ§o', empty: 'ConteÃºdo de EndereÃ§o.'},
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
                        {key: 'outros', label: 'Outros', empty: 'ConteÃºdo de Outros.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
