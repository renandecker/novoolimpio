import {useEffect, useState} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {MasterDetail} from '../../shared/components/MasterDetail';
import {Tabs} from '../../shared/components/Tabs';
import type {ApiItem} from '../../features/auth/types';

const CAMPO_COLUMNS = [
    {key: 'rotulo', label: 'RÃ³tulo'},
    {key: 'nome', label: 'Nome'},
    {key: 'tipo', label: 'Tipo de Campo'},
    {key: 'categoria', label: 'Categoria de Campo'},
    {key: 'obrigatorio', label: 'ObrigatÃ³rio'},
    {key: 'permitirHistorico', label: 'Permitir HistÃ³rico'},
    {key: 'ordem', label: 'Ordem'},
];

const UNIDADE_COLUMNS = [
    {key: 'id', label: 'Id_unidade'},
    {key: 'sucinto', label: 'Sucinto'},
    {key: 'razaoSocial', label: 'RazÃ£o Social'},
    {key: 'nomeFantasia', label: 'Nome Fantasia'},
    {key: 'CNPJ', label: 'CNPJ'},
    {key: 'ativo', label: 'Ativo'},
];

export default function ViewAcaoFormAcaoListScreen() {
    const [campos, setCampos] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [tipoAcoes, setTipoAcoes] = useState<ApiItem[]>([]);
    const [formData, setFormData] = useState({
        id: '',
        descricao: '',
        responsavelId: '',
        dataColeta: '',
        dataInicial: '',
        dataFinalCaptacao: '',
        tipoAcaoId: '',
        dataFinal: '',
        meta: '',
        custo: '',
    });
    const [showPessoaModal, setShowPessoaModal] = useState(false);

    useEffect(() => {
        fetch('/api/comercial/tipo-acao').then(r => r.json()).then(data => {
            const list = Array.isArray(data) ? data : (data.content || data.items || []);
            setTipoAcoes(list);
        }).catch(() => {});
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.descricao.trim().length < 3) {
            alert('DescriÃ§Ã£o deve ter pelo menos 3 caracteres');
            return;
        }
        if (!formData.responsavelId || !formData.tipoAcaoId) {
            alert('Contratante e Tipo AÃ§Ã£o sÃ£o obrigatÃ³rios');
            return;
        }
        if (unidades.length === 0) {
            alert('Selecione pelo menos uma unidade');
            return;
        }
        if (campos.length === 0) {
            alert('Selecione pelo menos um campo');
            return;
        }
        if (formData.dataColeta && formData.dataInicial && formData.dataFinal) {
            if (formData.dataColeta < formData.dataInicial || formData.dataColeta > formData.dataFinal) {
                alert('A data da coleta tem que estar entre a data inicial e data Final');
                return;
            }
        }
        if (formData.dataInicial && formData.dataFinalCaptacao && formData.dataFinalCaptacao < formData.dataInicial) {
            alert('A data final de captaÃ§Ã£o nÃ£o pode ser anterior a data inicial');
            return;
        }
        if (formData.dataFinal && formData.dataFinalCaptacao && formData.dataFinal < formData.dataFinalCaptacao) {
            alert('A data final de Cadastro nÃ£o pode ser anterior a data final de CaptaÃ§Ã£o');
            return;
        }
        try {
            const res = await fetch('/api/comercial/acao', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    ...formData,
                    id: formData.id ? Number(formData.id) : null,
                    meta: formData.meta ? Number(formData.meta) : null,
                    custo: formData.custo ? Number(formData.custo) : null,
                    tipoAcaoId: formData.tipoAcaoId ? Number(formData.tipoAcaoId) : null,
                    responsavelId: formData.responsavelId ? Number(formData.responsavelId) : null,
                })
            });
            if (res.ok) {
                alert('AÃ§Ã£o salva com sucesso!');
            } else {
                const txt = await res.text();
                alert('Erro ao salvar aÃ§Ã£o: ' + txt);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form AÃ§Ã£o</h1>
                <div className="div_form">
                    <div className="form-title">AÃ§Ã£o</div>
                    <form onSubmit={handleSubmit} className="table_form">
                        <Tabs
                            tabs={[
                                {
                                    key: 'acao',
                                    label: 'AÃ§Ã£o',
                                    content: (
                                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '10px'}}>
                                            <div>
                                                <label>ID</label>
                                                <input type="text" disabled value={formData.id} style={{width: '60px'}} />
                                            </div>
                                            <div style={{gridColumn: 'span 3'}}></div>

                                            <div style={{gridColumn: 'span 4'}}>
                                                <label>DescriÃ§Ã£o *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.descricao}
                                                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                                                    style={{width: '100%'}}
                                                />
                                            </div>

                                            <div style={{gridColumn: 'span 2'}}>
                                                <label>Contratante (ResponsÃ¡vel) *</label>
                                                <div style={{display: 'flex', gap: '5px'}}>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="ID ResponsÃ¡vel"
                                                        value={formData.responsavelId}
                                                        onChange={e => setFormData({...formData, responsavelId: e.target.value})}
                                                        style={{flex: 1}}
                                                    />
                                                    <button type="button" onClick={() => setShowPessoaModal(true)}>+</button>
                                                </div>
                                            </div>
                                            <div style={{gridColumn: 'span 2'}}></div>

                                            <div>
                                                <label>Data Coleta</label>
                                                <input
                                                    type="date"
                                                    value={formData.dataColeta}
                                                    onChange={e => setFormData({...formData, dataColeta: e.target.value})}
                                                />
                                            </div>
                                            <div style={{gridColumn: 'span 3'}}></div>

                                            <div>
                                                <label>Data Inicial CaptaÃ§Ã£o</label>
                                                <input
                                                    type="date"
                                                    value={formData.dataInicial}
                                                    onChange={e => setFormData({...formData, dataInicial: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label>Data Final CaptaÃ§Ã£o</label>
                                                <input
                                                    type="date"
                                                    value={formData.dataFinalCaptacao}
                                                    onChange={e => setFormData({...formData, dataFinalCaptacao: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label>Tipo AÃ§Ã£o *</label>
                                                <select
                                                    required
                                                    value={formData.tipoAcaoId}
                                                    onChange={e => setFormData({...formData, tipoAcaoId: e.target.value})}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {tipoAcoes.map((t: any) => (
                                                        <option key={t.id} value={t.id}>{t.descricao || t.nome || `#${t.id}`}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label>Data Final Cadastro</label>
                                                <input
                                                    type="date"
                                                    value={formData.dataFinal}
                                                    onChange={e => setFormData({...formData, dataFinal: e.target.value})}
                                                />
                                            </div>

                                            <div>
                                                <label>Prev. Meta *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.meta}
                                                    onChange={e => setFormData({...formData, meta: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label>Prev. Custo *</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={formData.custo}
                                                    onChange={e => setFormData({...formData, custo: e.target.value})}
                                                />
                                            </div>
                                            <div style={{gridColumn: 'span 2'}}></div>
                                        </div>
                                    )
                                },
                                {
                                    key: 'campos',
                                    label: 'Campos',
                                    content: (
                                        <MasterDetail
                                            label="Campo"
                                            source="/api/comercial/campo"
                                            valueKey="id"
                                            searchKeys={['rotulo', 'nome', 'tipo']}
                                            columns={CAMPO_COLUMNS}
                                            items={campos}
                                            onChange={setCampos}
                                        />
                                    ),
                                },
                                {
                                    key: 'unidade',
                                    label: 'Unidade',
                                    content: (
                                        <MasterDetail
                                            label="Unidade"
                                            source="/api/basico/unidade"
                                            valueKey="id"
                                            searchKeys={['sucinto', 'razaoSocial', 'nomeFantasia']}
                                            columns={UNIDADE_COLUMNS}
                                            items={unidades}
                                            onChange={setUnidades}
                                        />
                                    ),
                                },
                            ]}
                        />
                        <div style={{marginTop: '15px'}}>
                            <button type="submit" className="btnblue">Salvar</button>
                        </div>
                    </form>
                </div>

                {showPessoaModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '500px'}}>
                            <h3>Cadastro de Aluno / Pessoa</h3>
                            <p>Modal de cadastro rÃ¡pido de pessoa fÃ­sica.</p>
                            <button type="button" onClick={() => setShowPessoaModal(false)}>Fechar</button>
                        </div>
                    </div>
                )}
            </main>
        </PermissionGate>
    );
}
