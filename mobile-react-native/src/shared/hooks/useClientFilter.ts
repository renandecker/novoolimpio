import {useState, useMemo} from 'react';

/**
 * Hook for client-side filtering without backend /search integration.
 * Provides a "Buscar" button + filter modal that filters the items array.
 */
export function useClientFilter(items, getItemKey = (item) => item.id) {
  const [visible, setVisible] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [filterField, setFilterField] = useState('nome');

  // Fields to search across (configure per screen)
  const searchFields = useMemo(() => ['nome', 'descricao', 'titulo', 'razao_social'], []);

  const filteredItems = useMemo(() => {
    if (!filterText.trim()) return items;
    const lower = filterText.toLowerCase();
    return items.filter((item) => {
      const record = item;
      return searchFields.some((field) => {
        const value = record[field];
        return value && String(value).toLowerCase().includes(lower);
      });
    });
  }, [items, filterText, searchFields]);

  const toggleFilter = () => setVisible((v) => !v);
  const applyFilter = () => setVisible(false);
  const clearFilter = () => {
    setFilterText('');
    setVisible(false);
  };

  return {
    visible,
    filterText,
    setFilterText,
    filterField,
    setFilterField,
    filteredItems,
    toggleFilter,
    applyFilter,
    clearFilter,
    searchFields,
  };
}