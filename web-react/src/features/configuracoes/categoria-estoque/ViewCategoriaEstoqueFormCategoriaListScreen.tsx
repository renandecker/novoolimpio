import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../../../shared/services/permissions';
import {api} from '../../../shared/services/api';
import type {ApiItem} from '../../../shared/types/types';

export default function ViewCategoriaEstoqueFormCategoriaListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idEdicao = searchParams.get('id');

    const [carregando, setCarregando] = useState(!!idEdicao);
    const [salvando, setSalvando] = useState(false);
    const [categorias, setCategorias] = useState<ApiItem[]>([]);

    const [formData, setFormData] = useState({
        descricao: '',
        id_categoria_pai: '',
        ativo: true,
    });

    useEffect(() => {
        api.get<ApiItem[]>('/api/view/categoriaEstoque/listCategoria')
            .then(r => setCategorias(r.data ?? []))
            .catch(() => setCategorias([]));
    }, []);

    useEffect(() => {
        if (idEdicao) {
            setCarregando(true);
            api.get(`/api/view/categoriaEstoque/listCategoria/${idEdicao}`)
                .then(r => {
                    const cat = r.data;
                    setFormData({
                        descricao: cat.descricao ?? '',
                        id_categoria_pai: cat.id_categoria_pai ?? '',
                        ativo: cat.ativo ?? true,
                    });
                })
                .catch(() => alert('Erro ao carregar categoria'))
                .finally(() => setCarregando(false));
        } else {
            setFormData({descricao: '', id_categoria_pai: '', ativo: true});
        }
    }, [idEdicao]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.descricao.trim()) {
            alert('Descrição é obrigatória');
            return;
        }

        setSalvando(true);
        try {
            const payload = {
                descricao: formData.descricao.trim(),
                id_categoria_pai: formData.id_categoria_pai ? Number(formData.id_categoria_pai) : null,
                ativo: formData.ativo,
            };

            if (idEdicao) {
                await api.put(`/api/view/categoriaEstoque/listCategoria/${idEdicao}`, payload);
            } else {
                await api.post('/api/view/categoriaEstoque/listCategoria', payload);
            }

            alert('Categoria salva com sucesso!');
            navigate('/view/categoriaEstoque/listCategoria');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar categoria');
        } finally {
            setSalvando(false);
        }
    };

    const handleChange = (field: string, value: unknown) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    if (carregando) {
        return (
            <PermissionGate permission="READ">
                <main><h1>Categoria Estoque</h1><p>Carregando...</p></main>
            </PermissionGate>
        );
    }

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>{idEdicao ? `Editar Categoria #${idEdicao}` : 'Nova Categoria'}</h1>
                <div className="div_form">
                    <form className="table_form" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <label className="form-field">
                                <span className="form-label">Descrição *</span>
                                <input className="form-input"
                                       value={formData.descricao}
                                       onChange={e => handleChange('descricao', e.target.value)}
                                       placeholder="Nome da categoria"/>
                            </label>

                            <label className="form-field">
                                <span className="form-label">Categoria Pai (opcional)</span>
                                <select className="form-input form-select"
                                        value={formData.id_categoria_pai}
                                        onChange={e => handleChange('id_categoria_pai', e.target.value)}>
                                    <option value="">-- Nenhuma (Categoria Raiz) --</option>
                                    {categorias
                                        .filter(c => !idEdicao || Number(c.id) !== Number(idEdicao))
                                        .map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.descricao}
                                            </option>
                                        ))}
                                </select>
                            </label>

                            <div className="form-field">
                                <span className="form-label">Ativo</span>
                                <input type="checkbox"
                                       checked={formData.ativo}
                                       onChange={e => handleChange('ativo', e.target.checked)}/>
                            </div>
                        </div>

                        <div className="form-footer">
                            <button type="button" className="btn-form-back btnyellow"
                                    onClick={() => navigate('/view/categoriaEstoque/listCategoria')}>
                                Voltar
                            </button>
                            <button type="submit" className="btnstop" disabled={salvando}>
                                {salvando ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </PermissionGate>
    );
}