type HalloweenToggleProps = {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export default function HalloweenToggle({ active, onToggle, disabled = false }: HalloweenToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Desactivar modo Halloween' : 'Activar modo Halloween'}
      className={`halloween-toggle ${active ? 'halloween-toggle--active' : ''}`}
      onClick={onToggle}
      disabled={disabled}
    >
      <img src="/assets/halloween-pumpkin-toggle.png" alt="" />
      <span>{active ? 'Cerrar noche' : 'Modo Halloween'}</span>
    </button>
  );
}

export function HalloweenTransition({ activating }: { activating: boolean }) {
  return <div className={`halloween-transition ${activating ? 'halloween-transition--night' : 'halloween-transition--day'}`} aria-hidden="true"><span className="halloween-transition__ring halloween-transition__ring--one" /><span className="halloween-transition__ring halloween-transition__ring--two" /><img className="halloween-transition__pumpkin" src="/assets/halloween-pumpkin-toggle.png" alt="" /></div>;
}
