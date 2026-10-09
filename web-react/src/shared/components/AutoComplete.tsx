import {useEffect, useRef, useState, useCallback} from 'react';
import type {CSSProperties} from 'react';
import './AutoComplete.css';

export interface AutoCompleteOption {
    id: number;
    label: string;
}

interface AutoCompleteBaseProps {
    id?: string;
    label?: string;
    placeholder?: string;
    fetchOptions: (query: string) => Promise<AutoCompleteOption[]>;
    fetchById?: (id: number) => Promise<AutoCompleteOption | null>;
    minChars?: number;
    disabled?: boolean;
    minDropdownResults?: number;
    required?: boolean;
    style?: CSSProperties;
}

type AutoCompleteProps = AutoCompleteBaseProps & (
    | {
        multiple?: false;
        value: AutoCompleteOption | null;
        onChange: (option: AutoCompleteOption | null) => void;
    }
    | {
        multiple: true;
        value: AutoCompleteOption[];
        onChange: (options: AutoCompleteOption[]) => void;
    }
);

export function AutoComplete(props: AutoCompleteProps) {
    const {
              id,
              label,
              placeholder,
              fetchOptions,
              fetchById,
              minChars = 3,
              disabled = false,
              minDropdownResults = 10,
              required = false,
              style,
          } = props as AutoCompleteBaseProps;
    const multiple = props.multiple === true;
    const value = (props.value ?? null) as AutoCompleteOption | AutoCompleteOption[] | null;
    const onChange = props.onChange as (option: AutoCompleteOption | AutoCompleteOption[] | null) => void;
    const selected = multiple ? ((value ?? []) as AutoCompleteOption[]) : [];
    const single = multiple ? null : (value as AutoCompleteOption | null);
    const [text, setText] = useState(multiple ? '' : single?.label ?? '');
    const [options, setOptions] = useState<AutoCompleteOption[]>([]);
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const [carregando, setCarregando] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<number | null>(null);
    const fetchByIdRef = useRef(fetchById);
    fetchByIdRef.current = fetchById;

    useEffect(() => {
        if (multiple) return;
        const opt = single;
        if (opt?.id && !opt?.label && fetchByIdRef.current) {
            setCarregando(true);
            fetchByIdRef.current(opt.id)
                .then((found) => {
                    if (found) setText(found.label);
                })
                .finally(() => setCarregando(false));
        } else {
            setText(opt?.label ?? '');
        }
    }, [value]);

    useEffect(() => {
        function onDocClick(event: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
        }

        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    useEffect(
        () => () => {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        },
        [],
    );

    const pesquisar = useCallback((termo: string) => {
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        const termoLimpo = termo.trim();
        if (termoLimpo.length < minChars) {
            setOptions([]);
            setOpen(false);
            return;
        }
        timerRef.current = window.setTimeout(() => {
            setCarregando(true);
            fetchOptions(termoLimpo)
                .then((resultado) => {
                    setOptions(resultado);
                    setOpen(true);
                    setHighlighted(resultado.length > 0 ? 0 : -1);
                })
                .catch(() => {
                    setOptions([]);
                    setOpen(false);
                })
                .finally(() => setCarregando(false));
        }, 300);
    }, [fetchOptions, minChars]);

    const abrirDropdown = useCallback(() => {
        if (disabled) return;
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        setCarregando(true);
        fetchOptions('')
            .then((resultado) => {
                const limited = resultado.slice(0, minDropdownResults);
                setOptions(limited);
                setOpen(true);
                setHighlighted(limited.length > 0 ? 0 : -1);
            })
            .catch(() => {
                setOptions([]);
                setOpen(false);
            })
            .finally(() => setCarregando(false));
        inputRef.current?.focus();
    }, [disabled, minDropdownResults, fetchOptions]);

    function selecionar(option: AutoCompleteOption) {
        if (multiple) {
            const jaSelecionado = selected.some((o) => o.id === option.id);
            onChange(jaSelecionado ? selected.filter((o) => o.id !== option.id) : [...selected, option]);
            setText('');
            setOpen(false);
            setHighlighted(-1);
            return;
        }
        onChange(option);
        setText(option.label);
        setOpen(false);
        setHighlighted(-1);
    }

    function removerSelecionado(option: AutoCompleteOption) {
        onChange(selected.filter((o) => o.id !== option.id));
    }

    function limpar() {
        onChange(multiple ? [] : null);
        setText('');
        setOptions([]);
        setOpen(false);
        setHighlighted(-1);
        inputRef.current?.focus();
    }

    function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (options.length > 0) setHighlighted((atual) => (atual + 1) % options.length);
            else abrirDropdown();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (options.length > 0) setHighlighted((atual) => (atual - 1 + options.length) % options.length);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (options.length > 0 && highlighted >= 0) selecionar(options[highlighted]);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    }

    return (
        <div className="autocomplete" ref={rootRef} style={style}>
            {label && <span className="autocomplete-label">{label}</span>}
            {multiple && selected.length > 0 && (
                <div className="autocomplete-chips">
                    {selected.map((option) => (
                        <span key={option.id} className="autocomplete-chip">
                            {option.label}
                            <button type="button" className="autocomplete-chip-remove" title="Remover"
                                    onClick={() => removerSelecionado(option)}>
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <div className="autocomplete-input-wrap">
                <input
                    id={id}
                    ref={inputRef}
                    className="autocomplete-input"
                    value={text}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    onChange={(event) => {
                        setText(event.target.value);
                        if (!multiple) onChange(null);
                        setHighlighted(-1);
                        pesquisar(event.target.value);
                    }}
                    onFocus={() => {
                        if (text.trim().length >= minChars) pesquisar(text);
                    }}
                    onKeyDown={onKeyDown}
                />
                {(value || selected.length > 0) && (
                    <button type="button" className="autocomplete-btn autocomplete-btn-clear" title="Limpar"
                            onClick={limpar}>
                        ✕
                    </button>
                )}
                <button
                    type="button"
                    className="autocomplete-btn autocomplete-btn-dropdown"
                    title="Listar"
                    disabled={disabled}
                    onClick={abrirDropdown}
                >
                    ▾
                </button>
                {open && (
                    <ul className="autocomplete-list">
                        {carregando && <li className="autocomplete-item autocomplete-mensagem">Buscando...</li>}
                        {!carregando && options.length === 0 && (
                            <li className="autocomplete-item autocomplete-mensagem">Nenhum registro encontrado.</li>
                        )}
                        {!carregando &&
                        options.map((option, index) => (
                            <li key={option.id}>
                                <button
                                    type="button"
                                    className={`autocomplete-item${index === highlighted ? ' autocomplete-item-active' : ''}`}
                                    onMouseEnter={() => setHighlighted(index)}
                                    onClick={() => selecionar(option)}
                                >
                                    {option.label ?? String(option.id)}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
