import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../../shared/services/masterDetailSources';

export default function ViewPessoaColunasPessoaFisicaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Colunas Pessoa Fisica</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'identificacao', label: 'IdentificaÃ§Ã£o', path: '/api/view/pessoa/colunasPessoaFisica'},
                        {
                            key: 'informacoesBasicas',
                            label: 'InformaÃ§Ãµes BÃ¡sicas',
                            empty: 'ConteÃºdo de InformaÃ§Ãµes BÃ¡sicas.'
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
