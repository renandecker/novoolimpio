import {useState} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';
import type {AutoCompleteOption} from '../../shared/components/AutoComplete';

export default function ViewValorProdutoFormValorProdutoListScreen() {
    const [unidade, setUnidade] = useState<AutoCompleteOption | null>(null);
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Valor Produto</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'valorProduto', label: 'Valor Produto', path: '/api/view/valorProduto/formValorProduto'},
                        {
                            key: 'unidade',
                            label: 'Unidade',
                            unidadeCombo: {
                                label: 'Unidade',
                                value: unidade,
                                onChange: setUnidade,
                            }
                        },
                        {key: 'formaPagamento', label: 'Forma Pagamento', empty: 'Conteúdo de Forma Pagamento.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
