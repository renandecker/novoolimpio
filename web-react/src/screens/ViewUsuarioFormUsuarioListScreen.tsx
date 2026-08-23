import {useState} from 'react';
import {PermissionGate} from '../permissions';
import {BooleanField} from '../BooleanField';
import {MasterDetail} from '../MasterDetail';
import {Tabs} from '../Tabs';
import type {TabItem} from '../Tabs';
import {
    PERFIL_SOURCE,
    PERFIL_COLUMNS,
    PERFIL_SEARCH,
    AGENDA_SOURCE,
    AGENDA_COLUMNS,
    AGENDA_SEARCH,
    TURNO_TRABALHO_SOURCE,
    TURNO_TRABALHO_COLUMNS,
    TURNO_TRABALHO_SEARCH,
} from '../masterDetailSources';
import type {ApiItem} from '../types';

interface DocumentoUploadProps {
    label: string;
    obrigatorio?: boolean;
}

function DocumentoUpload({label, obrigatorio = false}: DocumentoUploadProps) {
    return (
        <>
            <span className="form-label" style={{fontWeight: 'bold'}}>
                {label} {obrigatorio ? '*' : ''}
            </span>
            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <input type="file" accept="image/*,application/pdf" className="form-input" style={{flex: 1}}/>
                <button type="button" className="btn-action btnyellow" title="Visualizar documento">👁</button>
            </div>
        </>
    );
}

export default function ViewUsuarioFormUsuarioListScreen() {
    const [ativo, setAtivo] = useState(true);
    const [relatorio, setRelatorio] = useState(false);
    const [mensalista, setMensalista] = useState<'M' | 'H'>('M');
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [agendas, setAgendas] = useState<ApiItem[]>([]);
    const [turnos, setTurnos] = useState<ApiItem[]>([]);

    const tabs: TabItem[] = [
        {
            key: 'pessoal',
            label: 'Pessoal',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">CPF *</span>
                        <input className="form-input" placeholder="999.999.999-99"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">RG *</span>
                        <input className="form-input" placeholder="RG"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome *</span>
                        <input className="form-input" placeholder="Nome completo" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">E-mail *</span>
                        <input className="form-input" type="email" placeholder="E-mail" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Social</span>
                        <input className="form-input" placeholder="Nome social" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Data Nascimento *</span>
                        <input className="form-input" type="date"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome do Pai</span>
                        <input className="form-input" placeholder="Nome do pai" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome da Mãe *</span>
                        <input className="form-input" placeholder="Nome da mãe" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Residencial *</span>
                        <input className="form-input" placeholder="(99) 9999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular *</span>
                        <input className="form-input" placeholder="(99) 99999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Referência *</span>
                        <input className="form-input" placeholder="Nome da referência" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Referência</span>
                        <input className="form-input" placeholder="(99) 9999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular Referência</span>
                        <input className="form-input" placeholder="(99) 99999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Referência 2</span>
                        <input className="form-input" placeholder="Nome da referência 2"
                               style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Referência 2</span>
                        <input className="form-input" placeholder="(99) 9999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular Referência 2</span>
                        <input className="form-input" placeholder="(99) 99999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Sexo *</span>
                        <select className="form-input form-select">
                            <option value="">-- Selecione --</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="O">Outro</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Etnia</span>
                        <select className="form-input form-select">
                            <option value="">-- Selecione --</option>
                            <option value="1">Branca</option>
                            <option value="2">Preta</option>
                            <option value="3">Parda</option>
                            <option value="4">Amarela</option>
                            <option value="5">Indígena</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Estado Civil *</span>
                        <select className="form-input form-select">
                            <option value="">-- Selecione --</option>
                            <option value="1">Solteiro(a)</option>
                            <option value="2">Casado(a)</option>
                            <option value="3">Divorciado(a)</option>
                            <option value="4">Viúvo(a)</option>
                            <option value="5">União Estável</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Escolaridade *</span>
                        <select className="form-input form-select">
                            <option value="">-- Selecione --</option>
                            <option value="1">Ensino Fundamental Incompleto</option>
                            <option value="2">Ensino Fundamental Completo</option>
                            <option value="3">Ensino Médio Incompleto</option>
                            <option value="4">Ensino Médio Completo</option>
                            <option value="5">Superior Incompleto</option>
                            <option value="6">Superior Completo</option>
                            <option value="7">Pós-Graduação</option>
                        </select>
                    </label>
                </div>
            ),
        },
        {
            key: 'endereco',
            label: 'Endereço',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">CEP</span>
                        <div style={{display: 'flex', gap: '8px', width: '100%'}}>
                            <input className="form-input" placeholder="99.999-999" style={{width: '120px'}}/>
                            <button type="button" className="btnyellow">Busca</button>
                            <button type="button" className="btngreen">Ajuste</button>
                            <button type="button" className="btnstop">Novo</button>
                        </div>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Cidade</span>
                        <input className="form-input" placeholder="Cidade" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Bairro</span>
                        <input className="form-input" placeholder="Bairro" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Logradouro</span>
                        <input className="form-input" placeholder="Logradouro" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Número</span>
                        <input className="form-input" type="number" placeholder="Número"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Complemento</span>
                        <textarea className="form-input" placeholder="Complemento" rows={3}
                                  style={{gridColumn: 'span 3', minHeight: '80px'}}/>
                    </label>
                </div>
            ),
        },
        {
            key: 'documentos',
            label: 'Documentos',
            content: (
                <>
                    <div className="form-grid">
                        <label className="form-field">
                            <span className="form-label">CTPS *</span>
                            <input className="form-input" placeholder="Carteira de Trabalho"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Série *</span>
                            <input className="form-input" placeholder="Série"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">PIS *</span>
                            <input className="form-input" placeholder="999.9999.999-9"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Data Emissão RG</span>
                            <input className="form-input" type="date"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Órgão Emissor</span>
                            <input className="form-input" placeholder="Órgão Emissor"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Título Eleitor</span>
                            <input className="form-input" placeholder="Título de Eleitor"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Zona</span>
                            <input className="form-input" placeholder="Zona"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Seção</span>
                            <input className="form-input" placeholder="Seção"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Carteira Reservista</span>
                            <input className="form-input" placeholder="Carteira de Reservista"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Qtd. Filhos Menores de 14</span>
                            <input className="form-input" type="number" placeholder="Quantidade"/>
                        </label>
                    </div>
                    <fieldset className="form-fieldset">
                        <legend>Documentos Digitalizados
                            <small> (campos com * são obrigatórios)</small>
                        </legend>
                        <div className="form-grid">
                            <DocumentoUpload label="Foto 3x4" obrigatorio/>
                            <DocumentoUpload label="Carteira de Trabalho - Pág. 1" obrigatorio/>
                            <DocumentoUpload label="Carteira de Trabalho - Pág. 2" obrigatorio/>
                            <DocumentoUpload label="Contrato de Trabalho" obrigatorio/>
                            <DocumentoUpload label="Comprovante de Residência" obrigatorio/>
                            <DocumentoUpload label="CPF" obrigatorio/>
                            <DocumentoUpload label="RG - Frente"/>
                            <DocumentoUpload label="RG - Verso"/>
                            <DocumentoUpload label="Título Eleitoral"/>
                            <DocumentoUpload label="Carteira de Reservista"/>
                            <DocumentoUpload label="Certidão de Nascimento dos Filhos Menores" obrigatorio/>
                            <DocumentoUpload label="Carteira de Vacinação dos Filhos Menores" obrigatorio/>
                        </div>
                    </fieldset>
                </>
            ),
        },
        {
            key: 'trabalho',
            label: 'Trabalho',
            content: (
                <div className="form-grid">
                    <div className="form-field">
                        <span className="form-label">Usuário Ativo</span>
                        <BooleanField value={ativo} onChange={setAtivo}/>
                    </div>
                    <label className="form-field">
                        <span className="form-label">Função *</span>
                        <select className="form-input form-select" style={{gridColumn: 'span 3'}}>
                            <option value="">-- Selecione --</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Data Admissão</span>
                        <input className="form-input" type="date"/>
                    </label>
                    <div className="form-field">
                        <span className="form-label">Vínculo</span>
                        <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                            <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                                <input type="radio" name="vinculo" checked={mensalista === 'M'}
                                       onChange={() => setMensalista('M')}/>
                                Mensalista
                            </label>
                            <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                                <input type="radio" name="vinculo" checked={mensalista === 'H'}
                                       onChange={() => setMensalista('H')}/>
                                Horista
                            </label>
                        </div>
                    </div>
                    {mensalista === 'M' && (
                        <div className="form-field" style={{gridColumn: 'span 4'}}>
                            <MasterDetail
                                label="Turnos de Trabalho"
                                source={TURNO_TRABALHO_SOURCE}
                                valueKey="id"
                                searchKeys={TURNO_TRABALHO_SEARCH}
                                columns={TURNO_TRABALHO_COLUMNS}
                                items={turnos}
                                onChange={setTurnos}
                            />
                        </div>
                    )}
                    <div className="form-field">
                        <span className="form-label">Relatório</span>
                        <BooleanField value={relatorio} onChange={setRelatorio}/>
                    </div>
                    <label className="form-field">
                        <span className="form-label">Observação</span>
                        <textarea className="form-input" placeholder="Observações" rows={3}
                                  style={{gridColumn: 'span 3', minHeight: '80px'}}/>
                    </label>
                </div>
            ),
        },
        {
            key: 'acesso',
            label: 'Acessos',
            content: (
                <Tabs
                    tabs={[
                        {
                            key: 'unidades',
                            label: 'Unidades',
                            content: (
                                <MasterDetail
                                    label="Unidade"
                                    source={"/api/view/unidade/list"}
                                    valueKey="id"
                                    searchKeys={["nome", "sucinto"]}
                                    columns={[{key: "sucinto", label: "Unidade"}]}
                                    items={[]}
                                    onChange={() => {
                                    }}
                                />
                            ),
                        },
                        {
                            key: 'perfis',
                            label: 'Perfis',
                            content: (
                                <MasterDetail
                                    label="Perfil"
                                    source={PERFIL_SOURCE}
                                    valueKey="id"
                                    searchKeys={PERFIL_SEARCH}
                                    columns={PERFIL_COLUMNS}
                                    items={perfis}
                                    onChange={setPerfis}
                                />
                            ),
                        },
                        {
                            key: 'agendas',
                            label: 'Agendas',
                            content: (
                                <MasterDetail
                                    label="Agenda"
                                    source={AGENDA_SOURCE}
                                    valueKey="id"
                                    searchKeys={AGENDA_SEARCH}
                                    columns={AGENDA_COLUMNS}
                                    items={agendas}
                                    onChange={setAgendas}
                                />
                            ),
                        },
                    ]}
                    initial="unidades"
                />
            ),
        },
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Cadastro de Usuário</h1>
                <div className="div_form">
                    <div className="form-title">Usuário</div>
                    <div className="table_form">
                        <Tabs tabs={tabs} initial="pessoal"/>
                        <div className="form-buttons">
                            <button type="button" className="btnblue" title="Salvar registro">Gravar</button>
                            <button type="button" className="btnstop" title="Salvar e continuar editando">
                                Salvar e Continuar
                            </button>
                            <button type="button" className="btnyellow" title="Voltar para a lista">Voltar</button>
                        </div>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
