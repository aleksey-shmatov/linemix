export function ToolButton({
  active,
  onClick,
  label,
  children,
  name,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  name?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={name ?? label}
      aria-pressed={active}
      className={`grid size-8 place-items-center rounded transition ${
        active ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
      }`}
    >
      {children}
    </button>
  );
}
