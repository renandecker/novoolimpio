import {useState, useEffect, useCallback} from 'react';
import {api} from '../services/api';

export interface Icone {
    id: number;
    classe: string;
    icone: string;
    versao: '4.x' | '5.x' | '6.x';
    search?: string;
}

interface IconPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (classe: string) => void;
    initialValue?: string;
    title?: string;
}

export function IconPickerModal({open, onClose, onSelect, initialValue, title = 'Selecionar Ícone'}: IconPickerModalProps) {
    const [icones, setIcones] = useState<Icone[]>([]);
    const [filteredIcones, setFilteredIcones] = useState<Icone[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVersao, setSelectedVersao] = useState<'all' | '4.x' | '5.x' | '6.x'>('all');
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 200;

    const fetchIcones = useCallback(async (versao?: string, search?: string) => {
        setLoading(true);
        try {
            let url = '/api/icones';
            const params = new URLSearchParams();
            if (versao && versao !== 'all') params.append('versao', versao);
            if (search) params.append('q', search);
            if (params.toString()) url += '?' + params.toString();
            
            const response = await api.get<Icone[]>(url);
            setIcones(response.data);
            setFilteredIcones(response.data);
        } catch (error) {
            console.error('Failed to load icons:', error);
            setIcones([]);
            setFilteredIcones([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            fetchIcones(selectedVersao === 'all' ? undefined : selectedVersao, searchTerm);
            setCurrentPage(0);
        }
    }, [open, selectedVersao, searchTerm, fetchIcones]);

    useEffect(() => {
        if (searchTerm) {
            setCurrentPage(0);
        }
    }, [searchTerm]);

    const handleSelect = (icone: Icone) => {
        onSelect(icone.classe);
        onClose();
    };

    const paginatedIcones = filteredIcones.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    const totalPages = Math.ceil(filteredIcones.length / pageSize);

    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal icon-picker-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '900px', width: '95%', maxHeight: '80vh'}}>
                <div className="div_form">
                    <div className="form-title">{title}</div>
                    
                    <div className="icon-picker-toolbar">
                        <div className="icon-search">
                            <input
                                type="text"
                                placeholder="Buscar ícone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="icon-filter">
                            <select
                                value={selectedVersao}
                                onChange={(e) => setSelectedVersao(e.target.value as 'all' | '4.x' | '5.x' | '6.x')}
                                className="form-input form-select"
                            >
                                <option value="all">Todas as versões</option>
                                <option value="4.x">Font Awesome 4.x</option>
                                <option value="5.x">Font Awesome 5.x</option>
                                <option value="6.x">Font Awesome 6.x</option>
                            </select>
                        </div>
                    </div>

                    <div className="icon-picker-grid" style={{maxHeight: '50vh', overflowY: 'auto'}}>
                        {loading ? (
                            <div className="icon-loading">Carregando ícones...</div>
                        ) : paginatedIcones.length === 0 ? (
                            <div className="icon-empty">Nenhum ícone encontrado</div>
                        ) : (
                            paginatedIcones.map((icone) => (
                                <button
                                    key={icone.id}
                                    type="button"
                                    className={`icon-picker-item ${initialValue === icone.classe ? 'selected' : ''}`}
                                    onClick={() => handleSelect(icone)}
                                    title={`${icone.classe} (${icone.versao})${icone.search ? ' - ' + icone.search : ''}`}
                                >
                                    <i className={icone.classe} style={{fontSize: '24px'}}/>
                                    <span className="icon-class">{icone.classe}</span>
                                </button>
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="icon-pagination">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0 || loading}
                                className="btn-form-back"
                            >
                                Anterior
                            </button>
                            <span>Página {currentPage + 1} de {totalPages} ({filteredIcones.length} ícones)</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage >= totalPages - 1 || loading}
                                className="btn-form-back"
                            >
                                Próxima
                            </button>
                        </div>
                    )}

                    <div className="modal-actions form-footer">
                        <button type="button" className="btn-form-back" onClick={onClose}>Cancelar</button>
                        {initialValue && (
                            <button type="button" className="btn-danger" onClick={() => onSelect('')}>Limpar ícone</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface IconPickerButtonProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function IconPickerButton({value, onChange, placeholder = 'Selecionar ícone'}: IconPickerButtonProps) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className="icon-picker-button-wrapper">
            <div className="icon-preview">
                {value ? (
                    <i className={value} style={{fontSize: '20px'}}/>
                ) : (
                    <span className="icon-placeholder">{placeholder}</span>
                )}
            </div>
            <button
                type="button"
                className="btn-form-back"
                onClick={() => setModalOpen(true)}
            >
                {value ? 'Alterar' : 'Selecionar'}
            </button>
            <IconPickerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={onChange}
                initialValue={value}
            />
        </div>
    );
}