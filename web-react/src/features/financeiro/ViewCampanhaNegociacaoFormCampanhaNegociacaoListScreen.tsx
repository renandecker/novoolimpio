import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';
import {Wizard} from '../../shared/components/Wizard';

const TIPO_CAMPANHA_OPTIONS = [
    {value: 'PARCELA_ZERO_ATRITO', label: 'Parcela Zero Atrito (Atrasos até 30 dias - Isenção Juros/Multa PIX)'},
    {value: 'TROCA_POR_DESCONTO', label: 'Troca por Desconto (Liquidação Rápida - Desconto % Fixo)'},
    {value: 'SEGUNDA_CHANCE', label: 'Segunda Chance (Prevenção Inadimplência - Reagendamento)'},
    {value: 'QUITA_FACIL', label: 'Quita Fáci (Engajamento/Retenção - Quita 1 + Benefício Próx. Mês)'},
];

const OBJETIVO_OPTIONS = [
    {value: 'atrasos_recentes', label: 'Atrasos Recentes'},
    {value: 'liquidacao_rapida', label: 'Liquidação Rápida'},
    {value: 'prevencao_inadimplencia', label: 'Prevenção Inadimplência'},
    {value: 'engajamento_retencao', label: 'Engajamento e Retenção'},
];

const TIPO_OFERTA_OPTIONS = [
    {value: 'isenacao_juros_multa', label: 'Isenção Juros/Multa (Parcela Zero Atrito)'},
    {value: 'desconto_percentual', label: 'Desconto Percentual (Troca por Desconto)'},
    {value: 'reagendamento_sem_multa', label: 'Reagendamento s/ Multa (Segunda Chance)'},
    {value: 'quittar_1_desbloqueie_beneficio_proximo_mes', label: 'Quita 1 + Benefício Próx. Mês (Quita Fáci)'},
];

export default function ViewCampanhaNegociacaoFormCampanhaNegociacaoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Campanha de Negociação</h1>
                <div className="div_form">
                    <div className="form-title">Cadastro de Campanha de Negociação</div>
                    <div className="table_form">
                        <Wizard
                            steps={[
                                {
                                    key: 'dadosGerais',
                                    label: 'Dados Gerais',
                                    content: (
                                        <DataTable
                                            path="/api/financeiro/campanha-negociacao"
                                            combos={{
                                                tipoCampanha: {path: '', valueKey: 'value', labelKey: 'label'},
                                                objetivo: {path: '', valueKey: 'value', labelKey: 'label'},
                                                tipoOferta: {path: '', valueKey: 'value', labelKey: 'label'},
                                            }}
                                            hideCreate={false}
                                            hideUpdate={false}
                                            hideDelete={false}
                                        />
                                    ),
                                },
                                {
                                    key: 'configuracao',
                                    label: 'Configuração da Campanha',
                                    content: (
                                        <div style={{padding: '16px'}}>
                                            <h3>Tipos de Campanha Disponíveis</h3>
                                            <ul style={{lineHeight: '2'}}>
                                                <li><strong>Parcela Zero Atrito:</strong> Foco em atrasos recentes (até 30 dias). Oferece isenção de juros e multa para pagamento via PIX no mesmo dia.</li>
                                                <li><strong>Troca por Desconto:</strong> Foco em liquidação rápida. Desconto percentual fixo (5% a 15%) para pagamento imediato da parcela pendente.</li>
                                                <li><strong>Segunda Chance:</strong> Foco em prevenção de inadimplência longa. Permite pular a parcela do mês atual jogando o valor para o final do contrato, ou dividir em parcelas futuras sem multa.</li>
                                                <li><strong>Quita Fáci:</strong> Foco em engajamento e retenção. Quitação da parcela + bônus de pontualidade (15% desconto) na próxima mensalidade.</li>
                                            </ul>
                                            <p style={{marginTop: '16px', color: '#666'}}>Selecione o tipo de campanha acima para configurar os parâmetros específicos.</p>
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}