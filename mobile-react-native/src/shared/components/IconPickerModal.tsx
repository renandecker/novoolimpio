import {useState, useEffect, useCallback} from 'react';
import {View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, ActivityIndicator, FlatList} from 'react-native';
import {api} from './api';
import type {Icone} from './hooks/useIcones';

interface IconPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (classe: string) => void;
    initialValue?: string;
    title?: string;
}

export function IconPickerModal({visible, onClose, onSelect, initialValue, title = 'Selecionar Ícone'}: IconPickerModalProps) {
    const [icones, setIcones] = useState<Icone[]>([]);
    const [filteredIcones, setFilteredIcones] = useState<Icone[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVersao, setSelectedVersao] = useState<'all' | '4.x' | '5.x' | '6.x'>('all');
    const [page, setPage] = useState(0);
    const pageSize = 100;
    const [hasMore, setHasMore] = useState(true);

    const fetchIcones = useCallback(async (reset = false) => {
        setLoading(true);
        try {
            const nextPage = reset ? 0 : page;
            let url = `/api/icones?page=${nextPage}&size=${pageSize}`;
            if (selectedVersao !== 'all') url += `&versao=${selectedVersao}`;
            if (searchTerm) url += `&q=${encodeURIComponent(searchTerm)}`;
            
            const response = await api.get<Icone[]>(url);
            const newIcones = response.data;
            
            if (reset) {
                setIcones(newIcones);
                setFilteredIcones(newIcones);
            } else {
                setIcones(prev => [...prev, ...newIcones]);
                setFilteredIcones(prev => [...prev, ...newIcones]);
            }
            setHasMore(newIcones.length >= pageSize);
            if (reset) setPage(1);
            else setPage(p => p + 1);
        } catch (error) {
            console.error('Failed to load icons:', error);
            if (reset) {
                setIcones([]);
                setFilteredIcones([]);
            }
        } finally {
            setLoading(false);
        }
    }, [selectedVersao, searchTerm, page, pageSize]);

    useEffect(() => {
        if (visible) {
            fetchIcones(true);
        }
    }, [visible, selectedVersao, searchTerm, fetchIcones]);

    const handleSelect = (icone: Icone) => {
        onSelect(icone.classe);
        onClose();
    };

    const renderIcon = ({item}: {item: Icone}) => (
        <TouchableOpacity
            style={[
                styles.iconItem,
                initialValue === item.classe ? styles.iconItemSelected : {}
            ]}
            onPress={() => handleSelect(item)}
        >
            <Text style={styles.iconGlyph}>{item.classe.startsWith('fa-') ? '●' : '●'}</Text>
            <Text style={styles.iconClass}>{item.classe}</Text>
        </TouchableOpacity>
    );

    if (!visible) return null;

    return (
        <View style={styles.overlay} onStartShouldSetResponder={() => true}>
            <View style={styles.modal}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.toolbar}>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar ícone..."
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </View>
                    <View style={styles.filterContainer}>
                        <Text style={styles.filterLabel}>Versão:</Text>
                        <TextInput
                            style={styles.filterInput}
                            value={selectedVersao}
                            editable={false}
                            onFocus={() => {
                                const versions = ['all', '4.x', '5.x', '6.x'];
                                const idx = versions.indexOf(selectedVersao);
                                setSelectedVersao(versions[(idx + 1) % versions.length]);
                            }}
                        />
                    </View>
                </View>

                <View style={styles.gridContainer}>
                    {loading && icones.length === 0 ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#337ab7" />
                            <Text style={styles.loadingText}>Carregando ícones...</Text>
                        </View>
                    ) : icones.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Nenhum ícone encontrado</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={icones}
                            keyExtractor={item => String(item.id)}
                            renderItem={renderIcon}
                            numColumns={4}
                            contentContainerStyle={styles.gridContent}
                            onEndReached={hasMore && !loading ? () => fetchIcones(false) : undefined}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={hasMore && loading ? (
                                <View style={styles.loadingFooter}>
                                    <ActivityIndicator size="small" color="#337ab7" />
                                </View>
                            ) : undefined}
                        />
                    )}
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    {initialValue && (
                        <TouchableOpacity style={styles.clearButton} onPress={() => {onSelect(''); onClose();}}>
                            <Text style={styles.clearText}>Limpar ícone</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

interface IconPickerButtonProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function IconPickerButton({value, onChange, placeholder = 'Selecionar ícone'}: IconPickerButtonProps) {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.buttonWrapper}>
            <View style={styles.preview}>
                {value ? (
                    <Text style={styles.previewGlyph}>●</Text>
                ) : (
                    <Text style={styles.placeholder}>{placeholder}</Text>
                )}
            </View>
            <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.selectButtonText}>{value ? 'Alterar' : 'Selecionar'}</Text>
            </TouchableOpacity>
            <IconPickerModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelect={onChange}
                initialValue={value}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 1000,
    },
    modal: {
        width: '100%',
        maxWidth: 500,
        maxHeight: '85%',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#337ab7',
        borderBottomWidth: 3,
        borderBottomColor: '#c2aa3c',
    },
    title: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    closeText: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#f5f5f5',
    },
    searchContainer: {
        flex: 1,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        fontSize: 14,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    filterLabel: {
        fontSize: 14,
        color: '#333',
    },
    filterInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        minWidth: 80,
        fontSize: 14,
    },
    gridContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    gridContent: {
        padding: 12,
    },
    iconItem: {
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 6,
        backgroundColor: '#ffffff',
        margin: 4,
    },
    iconItemSelected: {
        borderColor: '#265a88',
        backgroundColor: '#dce9f7',
        borderWidth: 2,
    },
    iconGlyph: {
        fontSize: 24,
        color: '#333',
    },
    iconClass: {
        fontSize: 10,
        textAlign: 'center',
        color: '#666',
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        color: '#888',
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        color: '#337ab7',
        fontSize: 14,
        marginTop: 8,
    },
    loadingFooter: {
        padding: 16,
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#f5f5f5',
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    cancelText: {
        color: '#333',
        fontSize: 14,
    },
    clearButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#ff4444',
        borderRadius: 4,
    },
    clearText: {
        color: '#ffffff',
        fontSize: 14,
    },
    buttonWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    preview: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#d3d3d3',
        borderRadius: 4,
        backgroundColor: '#ffffff',
    },
    previewGlyph: {
        fontSize: 20,
        color: '#333',
    },
    placeholder: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    selectButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#337ab7',
        borderRadius: 4,
    },
    selectButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});