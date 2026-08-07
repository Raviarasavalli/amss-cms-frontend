import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

// ─── Motion variants ─────────────────────────────────────────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export const slideRight = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export const slideUp = {
  hidden: { opacity: 0, y: '100%' },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, y: '100%', transition: { duration: 0.25 } },
};

// ─── Spinner ─────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const s = { sm: 'w-4 h-4 border-[2px]', md: 'w-7 h-7 border-[3px]', lg: 'w-11 h-11 border-[3px]' }[size];
  return (
    <div className={`${s} rounded-full border-[var(--border)] border-t-[#6366f1] animate-spin ${className}`} />
  );
};

// ─── Page Loader ─────────────────────────────────────────────────────────────
export const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-4 border-[var(--border)] border-t-[#6366f1]"
      />
      <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>Loading AMSS CMS…</p>
    </div>
  </div>
);

// ─── Avatar ──────────────────────────────────────────────────────────────────
const COLORS = [
  ['#6366f1', '#e0e7ff'], ['#10b981', '#d1fae5'], ['#f59e0b', '#fef3c7'],
  ['#ef4444', '#fee2e2'], ['#0ea5e9', '#e0f2fe'], ['#8b5cf6', '#ede9fe'],
  ['#f97316', '#ffedd5'], ['#14b8a6', '#ccfbf1'],
];
export const Avatar = ({ name = '?', size = 'md', src, className = '' }) => {
  const idx = (name.charCodeAt(0) || 0) % COLORS.length;
  const [fg, bg] = COLORS[idx];
  const sizeClass = size === 'lg' ? 'avatar-lg' : size === 'sm' ? 'w-8 h-8 text-sm' : 'avatar';
  if (src) return <img src={src} alt={name} className={`${sizeClass} object-cover ${className}`} style={{ borderRadius: '9999px' }} />;
  return (
    <div className={`avatar ${size === 'lg' ? 'avatar-lg' : ''} ${className}`} style={{ background: bg, color: fg }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

// ─── Badge ───────────────────────────────────────────────────────────────────
export const Badge = ({ status, label }) => {
  const map = {
    active: 'badge-active', inactive: 'badge-inactive',
    pending: 'badge-pending', viewer: 'badge-viewer', admin: 'badge-admin',
  };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{label || status}</span>;
};

// ─── Button ──────────────────────────────────────────────────────────────────
export const Button = ({ variant = 'primary', size = 'md', loading, icon: Icon, children, className = '', ...props }) => {
  const varMap = { primary: 'btn-primary', secondary: 'btn-secondary', ghost: 'btn-ghost', danger: 'btn-danger', success: 'btn-success' };
  const szMap  = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' };
  return (
    <button
      className={`btn ${varMap[variant]} ${szMap[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
};

// ─── IconButton ──────────────────────────────────────────────────────────────
export const IconButton = ({ icon: Icon, size = 'md', variant = 'ghost', title, className = '', ...props }) => (
  <button
    title={title}
    className={`btn btn-${variant} ${size === 'sm' ? 'btn-icon-sm' : 'btn-icon'} ${className}`}
    {...props}
  >
    <Icon size={size === 'sm' ? 14 : 16} />
  </button>
);

// ─── Input ───────────────────────────────────────────────────────────────────
export const Input = ({ error, prefix, className = '', ...props }) => (
  <div className="relative">
    {prefix && (
      <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}>
        {prefix}
      </span>
    )}
    <input
      className={`input ${prefix ? 'pl-9' : ''} ${error ? '!border-[#ef4444]' : ''} ${className}`}
      {...props}
    />
  </div>
);

// ─── Select ──────────────────────────────────────────────────────────────────
export const Select = ({ error, className = '', children, ...props }) => (
  <select className={`input select ${error ? '!border-[#ef4444]' : ''} ${className}`} {...props}>
    {children}
  </select>
);

// ─── Textarea ────────────────────────────────────────────────────────────────
export const Textarea = ({ error, className = '', ...props }) => (
  <textarea
    className={`input resize-none ${error ? '!border-[#ef4444]' : ''} ${className}`}
    rows={3}
    {...props}
  />
);

// ─── Form Field ──────────────────────────────────────────────────────────────
export const Field = ({ label, error, hint, required, children }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
        {label}{required && <span className="text-[#ef4444] ml-0.5">*</span>}
      </label>
    )}
    {children}
    {hint && !error && <p className="text-xs" style={{ color: 'var(--text-3)' }}>{hint}</p>}
    {error && <p className="text-xs text-[#ef4444] flex items-center gap-1"><AlertTriangle size={11} />{error}</p>}
  </div>
);
export const FormField = Field;

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ className = '', children, onClick, ...props }) => (
  <div
    className={`card ${onClick ? 'card-interactive' : ''} ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', trend, index = 0 }) => {
  const colors = {
    indigo: { ring: '#6366f1', bg: 'rgba(99,102,241,.1)',  text: '#6366f1' },
    emerald:{ ring: '#10b981', bg: 'rgba(16,185,129,.1)',  text: '#10b981' },
    amber:  { ring: '#f59e0b', bg: 'rgba(245,158,11,.1)',  text: '#f59e0b' },
    rose:   { ring: '#ef4444', bg: 'rgba(239,68,68,.1)',   text: '#ef4444' },
    sky:    { ring: '#0ea5e9', bg: 'rgba(14,165,233,.1)',  text: '#0ea5e9' },
    violet: { ring: '#8b5cf6', bg: 'rgba(139,92,246,.1)',  text: '#8b5cf6' },
  };
  const c = colors[color] || colors.indigo;
  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible">
      <Card className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
              {title}
            </span>
            <span className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>{value}</span>
            {subtitle && <span className="text-xs" style={{ color: 'var(--text-3)' }}>{subtitle}</span>}
          </div>
          {Icon && (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: c.bg }}>
              <Icon size={20} style={{ color: c.text }} />
            </div>
          )}
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold ${trend >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>vs last month</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const Skeleton = ({ h = 4, w = 'full', className = '' }) => (
  <div className={`skeleton h-${h} w-${w} ${className}`} />
);

export const SkeletonCard = () => (
  <Card className="p-5 flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton h={3} w="24" />
        <Skeleton h={7} w="32" />
        <Skeleton h={3} w="20" />
      </div>
      <Skeleton h={11} className="!w-11 !rounded-xl" />
    </div>
  </Card>
);

export const SkeletonRow = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="p-3">
        <Skeleton h={4} />
      </td>
    ))}
  </tr>
);

// ─── Empty State ─────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div variants={fadeIn} initial="hidden" animate="visible"
    className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3"
  >
    {Icon && (
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <Icon size={24} style={{ color: 'var(--text-3)' }} />
      </div>
    )}
    <div>
      <p className="font-semibold" style={{ color: 'var(--text-1)' }}>{title}</p>
      {description && <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>{description}</p>}
    </div>
    {action}
  </motion.div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
export const Pagination = ({ page, pages, total, limit, onPageChange }) => {
  if (pages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const getPages = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', pages];
    if (page >= pages - 3) return [1, '...', pages-4, pages-3, pages-2, pages-1, pages];
    return [1, '...', page-1, page, page+1, '...', pages];
  };
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3">
      <span className="text-xs" style={{ color: 'var(--text-3)' }}>
        Showing {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="btn btn-ghost btn-sm disabled:opacity-30 px-2">‹ Prev</button>
        {getPages().map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} className="px-2 text-sm" style={{ color: 'var(--text-3)' }}>…</span>
            : <button key={p} onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
                  ${p === page ? 'bg-[#6366f1] text-white' : 'btn-ghost'}`}>
                {p}
              </button>
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= pages}
          className="btn btn-ghost btn-sm disabled:opacity-30 px-2">Next ›</button>
      </div>
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, size = 'md', children }) => {
  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-5xl' };
  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" variants={fadeIn} initial="hidden" animate="visible" exit="hidden"
        onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div className={`modal-box ${widths[size]} mx-auto`} variants={scaleIn} initial="hidden" animate="visible" exit="exit">
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-lg" style={{ color: 'var(--text-1)' }}>{title}</h2>
            <button onClick={onClose} className="btn btn-ghost btn-icon-sm">
              <X size={16} />
            </button>
          </div>
          <div className="p-5 overflow-y-auto flex-1">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export const Confirm = ({ open, onClose, onConfirm, title, message, loading, danger = true }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: danger ? 'rgba(239,68,68,.1)' : 'rgba(99,102,241,.1)' }}>
          <AlertTriangle size={16} style={{ color: danger ? '#ef4444' : '#6366f1' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>{message}</p>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} size="sm" loading={loading} onClick={onConfirm}>
          {danger ? 'Delete' : 'Confirm'}
        </Button>
      </div>
    </div>
  </Modal>
);

// ─── Drawer ───────────────────────────────────────────────────────────────────
export const Drawer = ({ open, onClose, children }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div className="drawer-overlay" variants={fadeIn} initial="hidden" animate="visible" exit="hidden"
          onClick={onClose} />
        <motion.div className="drawer-panel" variants={slideRight} initial="hidden" animate="visible" exit="exit">
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ─── Search Bar ───────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder = 'Search…', className = '' }) => (
  <div className={`relative ${className}`}>
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor"
      strokeWidth={2} viewBox="0 0 24 24" style={{ color: 'var(--text-3)' }}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input pl-9 w-full"
    />
  </div>
);

// ─── Tooltip ─────────────────────────────────────────────────────────────────
export const Tooltip = ({ text, children }) => (
  <div className="relative group inline-flex">
    {children}
    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-xs
      bg-[var(--surface-900)] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none
      transition-opacity z-50 shadow-lg">
      {text}
    </div>
  </div>
);

// ─── Divider ─────────────────────────────────────────────────────────────────
export const Divider = ({ className = '' }) => (
  <hr className={`border-0 border-t ${className}`} style={{ borderColor: 'var(--border)' }} />
);

// ─── Section Header ───────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>
    <div>
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>{title}</h1>
      {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─── Viewer Badge ─────────────────────────────────────────────────────────────
export const ViewerBadge = () => (
  <span className="badge badge-viewer text-xs">
    👁 Read Only
  </span>
);
