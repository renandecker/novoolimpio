import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';
import {TURMA_SOURCE, TURMA_COLUMNS, TURMA_SEARCH} from '../masterDetailSources';

export default function ViewDigitalizacaoDocumentoDigitalizacaoDocumentoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Digitalizacao Documento</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'digitalizacaoDeContratos',
                            label: 'Digitalização de Contratos',
                            path: '/api/view/digitalizacaoDocumento/digitalizacaoDocumento'
                        },
                        {key: 'chamadaAssinada', label: 'Chamada Assinada', empty: 'Conteúdo de Chamada Assinada.'},
                        {key: 'arquivosAluno', label: 'Arquivos Aluno', empty: 'Conteúdo de Arquivos Aluno.'},
                        {
                            key: 'digitalizacaoDeChamada',
                            label: 'Digitalização de Chamada',
                            empty: 'Conteúdo de Digitalização de Chamada.'
                        },
                        {
                            key: 'turma',
                            label: 'Turma',
                            masterDetail: {
                                label: 'Turma',
                                source: TURMA_SOURCE,
                                valueKey: 'id',
                                searchKeys: TURMA_SEARCH,
                                columns: TURMA_COLUMNS
                            }
                        },
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
