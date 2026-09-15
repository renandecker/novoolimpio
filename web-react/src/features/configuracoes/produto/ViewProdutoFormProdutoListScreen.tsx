import {useState} from 'react';
import {PermissionGate} from '../../../shared/services/permissions';
import {ModuleTabs} from '../../../shared/components/ModuleTabs';
import type {AutoCompleteOption} from '../../../shared/components/AutoComplete';

export default function ViewProdutoFormProdutoListScreen() {
    const [unidade, setUnidade] = useState<AutoCompleteOption | null>(null);
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Produto</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'informacoesBasicas',
                            label: 'Informações básicas',
                            path: '/api/view/produto/formProduto'
                        },
                        {
                            key: 'unidades',
                            label: 'Unidade',
                            unidadeCombo: {
                                label: 'Unidade',
                                value: unidade,
                                onChange: setUnidade,
                            }
                        },
                        {key: 'fornecedores', label: 'Fornecedores', empty: 'Conteúdo de Fornecedores.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
