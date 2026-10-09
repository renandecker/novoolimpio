import React, { ReactNode } from 'react';
import './FormField.css';

export interface FormFieldProps {
  /** Campo nome/id único do input */
  name: string;
  /** Rótulo exibido acima ou ao lado do input */
  label: string;
  /** Campo obrigatório? */
  required?: boolean;
  /** Tipo de input: text, email, password, number, date, select, textarea, checkbox, radio */
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'time' | 'tel' | 'url' | 'select' | 'textarea' | 'checkbox' | 'radio';
  /** Valor atual */
  value?: string | number | boolean;
  /** Callback ao alterar valor */
  onChange?: (value: string | boolean) => void;
  /** Placeholder do input */
  placeholder?: string;
  /** Mensagem de erro */
  error?: string;
  /** Desabilitado? */
  disabled?: boolean;
  /** Apenas leitura? */
  readOnly?: boolean;
  /** Dica/ajuda exibida abaixo do input */
  helpText?: string;
  /** Opções para select ou radio (para select/radio/checkbox múltiplos) */
  options?: Array<{ value: string | number; label: string }>;
  /** Largura customizada (grid span) */
  span?: number;
  /** Altura customizada (para textarea) */
  rows?: number;
  /** Min value (para number/date) */
  min?: string | number;
  /** Max value (para number/date) */
  max?: string | number;
  /** Step value (para number) */
  step?: string | number;
  /** Classe CSS adicional */
  className?: string;
  /** Conteúdo customizado dentro do input (para componentes especializados) */
  children?: ReactNode;
  /** Ícone/addon à esquerda do input */
  iconLeft?: ReactNode;
  /** Ícone/addon à direita do input */
  iconRight?: ReactNode;
  /** Callback ao focar */
  onFocus?: () => void;
  /** Callback ao desfocar */
  onBlur?: () => void;
  /** Padrão de validação */
  pattern?: string;
  /** Máximo de caracteres */
  maxLength?: number;
  /** Mínimo de caracteres */
  minLength?: number;
  /** Autocompletar (on/off/email/password etc) */
  autoComplete?: string;
  /** Sugestões para autocomplete (datalist) */
  datalist?: Array<string>;
  /** Aceitar múltiplas seleções (para select) */
  multiple?: boolean;
}

/**
 * Componente FormField padronizado
 * 
 * Exemplo de uso básico:
 * ```tsx
 * <FormField
 *   name="email"
 *   label="E-mail"
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   placeholder="seu@email.com"
 *   required
 * />
 * ```
 * 
 * Com erro:
 * ```tsx
 * <FormField
 *   name="cpf"
 *   label="CPF"
 *   value={cpf}
 *   onChange={setCpf}
 *   error={cpfError}
 *   helpText="Formato: 999.999.999-99"
 * />
 * ```
 * 
 * Com select:
 * ```tsx
 * <FormField
 *   name="status"
 *   label="Status"
 *   type="select"
 *   value={status}
 *   onChange={setStatus}
 *   options={[
 *     { value: 'ativo', label: 'Ativo' },
 *     { value: 'inativo', label: 'Inativo' },
 *   ]}
 * />
 * ```
 */
export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  required = false,
  type = 'text',
  value = '',
  onChange,
  placeholder,
  error,
  disabled = false,
  readOnly = false,
  helpText,
  options = [],
  span = 1,
  rows = 3,
  min,
  max,
  step,
  className = '',
  children,
  iconLeft,
  iconRight,
  onFocus,
  onBlur,
  pattern,
  maxLength,
  minLength,
  autoComplete,
  datalist = [],
  multiple = false,
}) => {
  const fieldId = `field-${name}`;
  const errorId = error ? `error-${name}` : undefined;
  const helpId = helpText ? `help-${name}` : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!onChange) return;

    if (type === 'checkbox') {
      onChange((e.target as HTMLInputElement).checked);
    } else {
      onChange(e.target.value);
    }
  };

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      onChange: handleChange,
      onFocus,
      onBlur,
      disabled,
      readOnly: readOnly && type !== 'checkbox',
      className: `form-input ${error ? 'form-input--error' : ''} ${disabled ? 'form-input--disabled' : ''}`,
      'aria-invalid': !!error,
      'aria-describedby': [errorId, helpId].filter(Boolean).join(' ') || undefined,
    };
    const textValue = typeof value === 'boolean' ? String(value) : value;

    switch (type) {
      case 'select':
        return (
          <select {...commonProps} value={textValue} multiple={multiple}>
            <option value="">-- Selecione --</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={textValue}
            placeholder={placeholder}
            rows={rows}
            minLength={minLength}
            maxLength={maxLength}
          />
        );

      case 'checkbox':
        return (
          <input
            {...commonProps}
            type="checkbox"
            checked={!!value}
          />
        );

      case 'radio':
        return (
          <div className="form-radio-group">
            {options.map((opt) => (
              <label key={opt.value} className="form-radio">
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={handleChange}
                  disabled={disabled}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type={type}
            value={textValue}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            pattern={pattern}
            maxLength={maxLength}
            minLength={minLength}
            autoComplete={autoComplete}
            list={datalist.length > 0 ? `datalist-${name}` : undefined}
          />
        );
    }
  };

  const renderContent = children || renderInput();

  return (
    <div
      className={`form-field-wrapper ${className}`}
      style={{
        gridColumn: span > 1 ? `span ${span}` : undefined,
      }}
    >
      {/* Label */}
      <label htmlFor={fieldId} className="form-field-label">
        <span className="form-field-label-text">
          {label}
          {required && <span className="form-field-required" aria-label="obrigatório">*</span>}
        </span>
      </label>

      {/* Input Wrapper com ícones */}
      <div className={`form-field-input-wrapper ${iconLeft ? 'form-field-input-wrapper--with-left-icon' : ''} ${iconRight ? 'form-field-input-wrapper--with-right-icon' : ''}`}>
        {iconLeft && <span className="form-field-icon form-field-icon--left">{iconLeft}</span>}
        
        {renderContent}
        
        {iconRight && <span className="form-field-icon form-field-icon--right">{iconRight}</span>}
      </div>

      {/* Datalist (se aplicável) */}
      {datalist.length > 0 && (
        <datalist id={`datalist-${name}`}>
          {datalist.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div id={errorId} className="form-field-error" role="alert">
          {error}
        </div>
      )}

      {/* Texto de Ajuda */}
      {helpText && !error && (
        <div id={helpId} className="form-field-help">
          {helpText}
        </div>
      )}
    </div>
  );
};

export default FormField;
