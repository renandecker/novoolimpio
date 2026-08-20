import React from 'react';
import {ModuleWizard} from '../ModuleWizard';

export default function ViewCancelamentoColunasPreCancelamentoListScreen() {
    return (
        <ModuleWizard
            steps={[
                {
                    key: 'selecao',
                    label: 'Seleção',
                    path: '/api/view/cancelamento/colunasPreCancelamento',
                    empty: 'Selecione as matrículas que serão canceladas.'
                },
                {
                    key: 'confirmacao',
                    label: 'Confirmação',
                    empty: 'Revise as matrículas selecionadas e confirme o cancelamento.'
                },
                {
                    key: 'conclusao',
                    label: 'Conclusão',
                    empty: 'Cancelamento efetuado com sucesso.',
                    nextLabel: 'Finalizar'
                },
            ]}
        />
    );
}
