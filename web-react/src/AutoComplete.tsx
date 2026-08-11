import { useEffect, useRef, useState } from 'react';
import './AutoComplete.css';

export interface AutoCompleteOption {
  id: number;
  label: string;
}

interface AutoCompleteProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: AutoCompleteOption | null;
  onChange: (option: AutoCompleteOption | null) => void;
  fetchOptions: (query: string) => Promise<AutoCompleteOption[]>;
  minChars?: number;
  disabled?: boolean;
}

export function AutoComplete({
  id,
  label,
  placeholder,
  value,
  onChange,
  fetchOptions,
  minChars = 3,
  disabled = false,
}: AutoCompleteProps) {
  const [text, setText] = useState(value?.label ?? '');
  const [options, setOptions] = useState<AutoCompleteOption[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [carregando, setCarregando] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setText(value?.label ?? '');
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

  function pesquisar(termo: string) {
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
  }

  function selecionar(option: AutoCompleteOption) {
    onChange(option);
    setText(option.label);
    setOpen(false);
    setHighlighted(-1);
  }

  function limpar() {
    onChange(null);
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
    <div className="autocomplete" ref={rootRef}>
      {label && <span className="autocomplete-label">{label}</span>}
      <div className="autocomplete-input-wrap">
        <input
          id={id}
          ref={inputRef}
          className="autocomplete-input"
          value={text}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => {
            setText(event.target.value);
            onChange(null);
            setHighlighted(-1);
            pesquisar(event.target.value);
          }}
          onFocus={() => {
            if (text.trim().length >= minChars) pesquisar(text);
          }}
          onKeyDown={onKeyDown}
        />
        {value && (
          <button type="button" className="autocomplete-btn autocomplete-btn-clear" title="Limpar" onClick={limpar}>
            ✕
          </button>
        )}
        <button
          type="button"
          className="autocomplete-btn autocomplete-btn-dropdown"
          title="Listar"
          disabled={disabled}
          onClick={() => {
            if (text.trim().length >= minChars) pesquisar(text);
            inputRef.current?.focus();
          }}
        >
          ▾
        </button>
      </div>
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
                  {option.label || `#${option.id}`}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
