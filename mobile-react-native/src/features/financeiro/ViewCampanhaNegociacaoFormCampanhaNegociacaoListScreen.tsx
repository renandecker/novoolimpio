import React from 'react';
import {ModuleWizard} from '../ModuleWizard';

const TIPO_CAMPANHA_OPTIONS = [
    {value: 'PARCELA_ZERO_ATRITO', label: 'Parcela Zero Atrito (Atrasos até 30 dias - Isenção Juros/Multa PIX)'},
    {value: 'TROCA_POR_DESCONTO', label: 'Troca por Desconto (Liquidação Rápida - Desconto % Fixo)'},
    {value: 'SEGUNDA_CHANCE', label: 'Segunda Chance (Prevenção Inadimplência - Reagendamento)'},
    {value: 'QUITA_FACIL', label: 'Quita Fáci (Engajamento/Retenção - Quita 1 + Benefício Próx. Mês)'},
];

export default function ViewCampanhaNegociacaoFormCampanhaNegociacaoListScreen() {
    return (
        <ModuleWizard
            steps={[
                {
                    key: 'dadosGerais',
                    label: 'Dados Gerais',
                    path: '/api/financeiro/campanha-negociacao',
                    empty: 'Nenhuma campanha cadastrada.',
                },
                {
                    key: 'configuracao',
                    label: 'Configuração da Campanha',
                    fields: [
                        {label: 'Tipo da Campanha', placeholder: 'Selecione o tipo de campanha'},
                        {label: 'Objetivo', placeholder: 'Selecione o objetivo'},
                        {label: 'Percentual (%)', placeholder: 'Ex: 10, 15'},
                        {label: 'Tipo de Oferta', placeholder: 'Selecione o tipo de oferta'},
                        {label: 'Condição Especial', placeholder: 'Descreva a condição especial'},
                        {label: 'Benefício Próx. Mês', placeholder: 'true/false'},
                    ],
                    empty: 'Configure os parâmetros da campanha selecionada.',
                },
                {
                    key: 'descricoes',
                    label: 'Tipos de Campanha',
                    empty: (
                        <>
                            <strong>Parcela Zero Atrito:</strong> Foco em atrasos recentes (até 30 dias). Isenção de juros/multa para pagamento via PIX no mesmo dia.
                            <br/><br/>
                            <strong>Troca por Desconto:</strong> Foco em liquidação rápida. Desconto percentual fixo (5% a 15%) para pagamento imediato.
                            <br/><br/>
                            <strong>Segunda Chance:</strong> Foco em prevenção de inadimplência longa. Pula parcela do mês atual ou divide em parcelas futuras sem multa.
                            <br/><br/>
                            <strong>Quita Fáci:</strong> Foco em engajamento e retenção. Quitação + 15% desconto na próxima mensalidade.
                        </>
                    ),
                },
            ]}
        />
    );
}