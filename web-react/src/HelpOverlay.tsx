import { useEffect, useRef, useState } from 'react';
import { useCurrentModule } from './useCurrentModule';

export default function HelpOverlay() {
  const { module } = useCurrentModule();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  if (!module) return null;

  return (
    <div className="help-overlay-container" ref={containerRef}>
      <button
        type="button"
        className="help-overlay-trigger"
        title={`Ajuda — ${module.rotulo}`}
        aria-label="Ajuda"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        ?
      </button>
      {open && (
        <div className="help-overlay-panel" role="dialog" aria-label="Ajuda">
          <div className="help-overlay-title">Ajuda — {module.rotulo}</div>
          <div className="help-overlay-body">
            {module.ajuda || 'Nenhuma ajuda cadastrada para esta tela.'}
          </div>
        </div>
      )}
    </div>
  );
}
