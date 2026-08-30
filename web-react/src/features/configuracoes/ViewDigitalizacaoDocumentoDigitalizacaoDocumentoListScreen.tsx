import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';
import {TURMA_SOURCE, TURMA_COLUMNS, TURMA_SEARCH} from '../../shared/services/masterDetailSources';

export default function ViewDigitalizacaoDocumentoDigitalizacaoDocumentoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Digitalizacao Documento</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'digitalizacaoDeContratos',
                            label: 'DigitalizaÃ§Ã£o de Contratos',
                            path: '/api/view/digitalizacaoDocumento/digitalizacaoDocumento'
                        },
                        {key: 'chamadaAssinada', label: 'Chamada Assinada', empty: 'ConteÃºdo de Chamada Assinada.'},
                        {key: 'arquivosAluno', label: 'Arquivos Aluno', empty: 'ConteÃºdo de Arquivos Aluno.'},
                        {
                            key: 'digitalizacaoDeChamada',
                            label: 'DigitalizaÃ§Ã£o de Chamada',
                            empty: 'ConteÃºdo de DigitalizaÃ§Ã£o de Chamada.'
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
