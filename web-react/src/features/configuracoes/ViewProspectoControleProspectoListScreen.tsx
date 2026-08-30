import React, { useState, useEffect } from 'react';
import { PermissionGate } from '../../shared/services/permissions';
import { Modal } from '../../shared/components/Modal';

interface Campo {
    id: number;
    nome: string;
}

interface ControleProspectoItem {
    id: number;
    nome: string;
    valor: string;
    outro?: string;
    unidade?: { sucinto: string };
    nota?: number;
}

export default function ViewProspectoControleProspectoListScreen() {
    const [campos, setCampos] = useState<Campo[]>([]);
    const [selectedCampo, setSelectedCampo] = useState<Campo | null>(null);
    const [items, setItems] = useState<ControleProspectoItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Modals
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailHtml, setDetailHtml] = useState('');
    
    const [ajustarModalOpen, setAjustarModalOpen] = useState(false);
    const [ajustarItem, setAjustarItem] = useState<ControleProspectoItem | null>(null);

    const [ajustarSelecionarModalOpen, setAjustarSelecionarModalOpen] = useState(false);
    const [prospectosSimilares, setProspectosSimilares] = useState<ControleProspectoItem[]>([]);
    const [selectedProspectosIds, setSelectedProspectosIds] = useState<number[]>([]);

    useEffect(() => {
        // Fetch Campos for AutoComplete
        fetch('/api/comercial/campo')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCampos(data);
            })
            .catch(err => console.error(err));
    }, []);

    const handleCampoSelect = (campo: Campo) => {
        setSelectedCampo(campo);
        setLoading(true);
        fetch(`/api/comercial/controle-prospecto?campoId=${campo.id}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setItems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleCarregarDetalhes = (id: number) => {
        setLoading(true);
        fetch(`/api/comercial/controle-prospecto/carregar-prospecto-para-visualizacao?id=${id}`)
            .then(res => res.text())
            .then(html => {
                setDetailHtml(html || '<p>Detalhes do prospecto carregados com sucesso.</p>');
                setDetailModalOpen(true);
                setLoading(false);
            })
            .catch(() => {
                setDetailHtml('<p>InformaÃ§Ãµes detalhadas do prospecto.</p>');
                setDetailModalOpen(true);
                setLoading(false);
            });
    };

    const handleOpenAjustar = (item: ControleProspectoItem) => {
        setAjustarItem(item);
        setAjustarModalOpen(true);
    };

    const handleSalvarAjustar = () => {
        if (!ajustarItem) return;
        fetch(`/api/comercial/controle-prospecto/salvar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ajustarItem.id, outro: ajustarItem.outro })
        }).then(() => {
            setAjustarModalOpen(false);
            if (selectedCampo) handleCampoSelect(selectedCampo);
        });
    };

    const handleOpenAjustarSelecionar = (item: ControleProspectoItem) => {
        setAjustarItem(item);
        fetch(`/api/comercial/controle-prospecto/carregar-outros-prospecto?id=${item.id}&valor=${encodeURIComponent(item.valor || '')}`)
            .then(res => res.json())
            .then(data => {
                setProspectosSimilares(Array.isArray(data) ? data : []);
                setSelectedProspectosIds([]);
                setAjustarSelecionarModalOpen(true);
            })
            .catch(() => {
                setProspectosSimilares([]);
                setAjustarSelecionarModalOpen(true);
            });
    };

    const handleSalvarSelecionados = () => {
        if (!ajustarItem) return;
        fetch(`/api/comercial/controle-prospecto/salvar-selecionados`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ajustarItem.id, selectedIds: selectedProspectosIds })
        }).then(() => {
            setAjustarSelecionarModalOpen(false);
            if (selectedCampo) handleCampoSelect(selectedCampo);
        });
    };

    return (
        <PermissionGate permission="READ">
            <main style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1>Controle Prospecto</h1>
                <hr style={{ marginBottom: '20px' }} />

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Campo *</label>
                    <select
                        style={{ padding: '8px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
                        onChange={(e) => {
                            const found = campos.find(c => c.id === Number(e.target.value));
                            if (found) handleCampoSelect(found);
                        }}
                        defaultValue=""
                    >
                        <option value="" disabled>Selecione o campo...</option>
                        {campos.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>

                {loading && <p>Carregando, aguarde...</p>}

                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                            <th style={{ padding: '10px', width: '20%' }}>ID</th>
                            <th style={{ padding: '10px', width: '40%' }}>Nome</th>
                            <th style={{ padding: '10px', width: '30%' }}>Valor</th>
                            <th style={{ padding: '10px', width: '10%' }}>AÃ§Ãµes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        ) : (
                            items.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{item.id}</td>
                                    <td style={{ padding: '10px' }}>{item.nome}</td>
                                    <td style={{ padding: '10px' }}>{item.valor}</td>
                                    <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                                        <button
                                            title="Mais informaÃ§Ãµes"
                                            style={{ background: '#f0ad4e', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                                            onClick={() => handleCarregarDetalhes(item.id)}
                                        >
                                            â„¹ï¸
                                        </button>
                                        {item.outro && (
                                            <>
                                                <button
                                                    title="Ajustar prospecto"
                                                    style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                                                    onClick={() => handleOpenAjustar(item)}
                                                >
                                                    âš™ï¸
                                                </button>
                                                <button
                                                    title="Ajustar prospecto selecionados"
                                                    style={{ background: '#5cb85c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                                                    onClick={() => handleOpenAjustarSelecionar(item)}
                                                >
                                                    â˜‘ï¸
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Modal Ajustar Prospecto */}
                <Modal isOpen={ajustarModalOpen} onClose={() => setAjustarModalOpen(false)} title="Ajustar prospecto">
                    {ajustarItem && (
                        <div>
                            <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                VocÃª tem certeza que deseja Ajustar o prospecto {ajustarItem.nome}?
                            </p>
                            <p style={{ margin: '15px 0', color: '#555' }}>{ajustarItem.outro}</p>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button
                                    style={{ background: '#0275d8', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
                                    onClick={handleSalvarAjustar}
                                >
                                    Sim
                                </button>
                                <button
                                    style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
                                    onClick={() => setAjustarModalOpen(false)}
                                >
                                    NÃ£o
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Modal Ajustar Prospectos Selecionados */}
                <Modal isOpen={ajustarSelecionarModalOpen} onClose={() => setAjustarSelecionarModalOpen(false)} title="Prospectos encontrados">
                    {ajustarItem && (
                        <div>
                            <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                VocÃª tem certeza que deseja Ajustar o prospecto {ajustarItem.nome}?
                            </p>
                            <div style={{ margin: '10px 0' }}>
                                <strong>Nome:</strong> {ajustarItem.nome}
                            </div>
                            <hr />
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                               <thead>
                                   <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                                       <th style={{ padding: '8px' }}>Sel</th>
                                       <th style={{ padding: '8px' }}>ID</th>
                                       <th style={{ padding: '8px' }}>Nome</th>
                                       <th style={{ padding: '8px' }}>Unidade</th>
                                       <th style={{ padding: '8px' }}>Nota</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {prospectosSimilares.map(p => (
                                       <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                           <td style={{ padding: '8px', textAlign: 'center' }}>
                                               <input
                                                   type="checkbox"
                                                   checked={selectedProspectosIds.includes(p.id)}
                                                   onChange={(e) => {
                                                       if (e.target.checked) {
                                                           setSelectedProspectosIds([...selectedProspectosIds, p.id]);
                                                       } else {
                                                           setSelectedProspectosIds(selectedProspectosIds.filter(id => id !== p.id));
                                                       }
                                                   }}
                                               />
                                           </td>
                                           <td style={{ padding: '8px' }}>{p.id}</td>
                                           <td style={{ padding: '8px' }}>{p.nome}</td>
                                           <td style={{ padding: '8px' }}>{p.unidade?.sucinto || '-'}</td>
                                           <td style={{ padding: '8px' }}>{p.nota || '-'}</td>
                                       </tr>
                                   ))}
                               </tbody>
                            </table>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button
                                    style={{ background: '#0275d8', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
                                    onClick={handleSalvarSelecionados}
                                >
                                    Sim
                                </button>
                                <button
                                    style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
                                    onClick={() => setAjustarSelecionarModalOpen(false)}
                                >
                                    NÃ£o
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Modal Detalhes Prospecto */}
                <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="InformaÃ§Ãµes Prospecto">
                    <div dangerouslySetInnerHTML={{ __html: detailHtml }} />
                </Modal>
            </main>
        </PermissionGate>
    );
}
