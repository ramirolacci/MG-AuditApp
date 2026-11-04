import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  DASHBOARD_SEED, 
  DashboardSeedData, 
  DashboardTienda 
} from '../data/dashboardSeed';
import { SavedAuditRecord } from '../types/audit';
import { f2, fmtDate } from '../utils/formatters';
import gsap from 'gsap';
import { 
  Calendar, 
  Users, 
  ChevronDown, 
  Check, 
  ClipboardCheck, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

interface DashboardSectionProps {
  records: SavedAuditRecord[];
  onSelectAudit?: (record: SavedAuditRecord) => void;
}

const SUPERVISOR_COLORS: Record<string, string> = {
  'p-damaris': '#f472b6', // Rosa
  'p-evelyn': '#a855f7',  // Morado
  'p-wanda': '#38bdf8',   // Celeste
  'p-selene': '#2dd4bf',  // Turquesa
  'p-sasha': '#818cf8',   // Índigo
  'p-lidya': '#c084fc',   // Violeta claro
  'p-martin': '#60a5fa'   // Azul
};

const DEFAULT_SUP_COLOR = '#3b82f6';

function normalizeName(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\bde\b/g, '')
    .replace(/\bla\b/g, '')
    .replace(/\blas\b/g, '')
    .replace(/\blos\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  decimals = 0,
  duration = 0.9,
  className = '',
  prefix = '',
  suffix = ''
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevValRef = useRef<number>(0);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const startVal = prevValRef.current;
    const endVal = isNaN(value) ? 0 : value;

    const proxy = { val: startVal };
    el.textContent = `${prefix}${decimals > 0 ? startVal.toFixed(decimals) : Math.round(startVal)}${suffix}`;

    const tween = gsap.to(proxy, {
      val: endVal,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (el) {
          el.textContent = `${prefix}${decimals > 0 ? proxy.val.toFixed(decimals) : Math.round(proxy.val)}${suffix}`;
        }
      }
    });

    prevValRef.current = endVal;
    return () => {
      tween.kill();
    };
  }, [value, decimals, duration, prefix, suffix]);

  return (
    <span ref={spanRef} className={className}>
      {prefix}{decimals > 0 ? '0.00' : '0'}{suffix}
    </span>
  );
};

export const DashboardSection: React.FC<DashboardSectionProps> = ({ records }) => {
  const [seedData] = useState<DashboardSeedData>(() => {
    try {
      const saved = localStorage.getItem('dashboard-auditorias-datos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.config?.tiendas) return parsed;
      }
    } catch (e) {}
    return DASHBOARD_SEED;
  });

  const [periodo, setPeriodo] = useState<'mes' | 'mesant' | '3m' | 'todo'>('mes');
  const [selectedSup, setSelectedSup] = useState<string>('');
  const [dashFilter, setDashFilter] = useState<'all' | 'crit' | 'rev' | 'ok' | 'none'>('all');

  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isSupOpen, setIsSupOpen] = useState(false);

  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const supDropdownRef = useRef<HTMLDivElement>(null);
  const auditsContainerRef = useRef<HTMLDivElement>(null);
  const bottomContainerRef = useRef<HTMLDivElement>(null);

  const handleTileClick = (filter: 'all' | 'crit' | 'rev' | 'ok' | 'none', e?: React.MouseEvent<HTMLButtonElement>) => {
    const nextFilter = dashFilter === filter && filter !== 'all' ? 'all' : filter;
    setDashFilter(nextFilter);

    if (e?.currentTarget) {
      gsap.fromTo(
        e.currentTarget,
        { scale: 0.95 },
        { scale: 1, duration: 0.35, ease: 'back.out(2.5)' }
      );
    }

    if (nextFilter === 'none') {
      setTimeout(() => {
        bottomContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  };

  // Smooth transition effect when switching filters, periods, or supervisors
  useEffect(() => {
    if (auditsContainerRef.current) {
      const cards = auditsContainerRef.current.querySelectorAll('.dash-store-card');
      const headers = auditsContainerRef.current.querySelectorAll('.dash-group-header');

      if (headers.length > 0) {
        gsap.fromTo(
          headers,
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.28, ease: 'power2.out', clearProps: 'transform' }
        );
      }

      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 14, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.32,
            stagger: 0.02,
            ease: 'power2.out',
            clearProps: 'transform,scale'
          }
        );
      }
    }

    if (bottomContainerRef.current) {
      const chips = bottomContainerRef.current.querySelectorAll('.dash-none-chip');
      const noneHeader = bottomContainerRef.current.querySelector('.dash-group-header');

      if (noneHeader && (dashFilter === 'all' || dashFilter === 'none')) {
        gsap.fromTo(
          noneHeader,
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out', clearProps: 'transform' }
        );
      }

      if (chips.length > 0 && (dashFilter === 'all' || dashFilter === 'none')) {
        gsap.fromTo(
          chips,
          { opacity: 0, y: 8, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.26,
            stagger: 0.012,
            ease: 'back.out(1.4)',
            clearProps: 'transform,scale'
          }
        );
      }
    }
  }, [dashFilter, periodo, selectedSup]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(e.target as Node)) {
        setIsPeriodOpen(false);
      }
      if (supDropdownRef.current && !supDropdownRef.current.contains(e.target as Node)) {
        setIsSupOpen(false);
      }
    }
    if (isPeriodOpen || isSupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPeriodOpen, isSupOpen]);

  // Close dropdowns on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsPeriodOpen(false);
        setIsSupOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const THR = seedData.umbrales || { critica: 70, ok: 85 };

  // Calculate Period Date Range
  const [dateFrom, dateTo] = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    const firstDay = (yy: number, mm: number) => {
      const d = new Date(yy, mm, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    };

    if (periodo === 'mes') return [firstDay(y, m), '9999-99-99'];
    if (periodo === 'mesant') return [firstDay(y, m - 1), firstDay(y, m)];
    if (periodo === '3m') return [firstDay(y, m - 2), '9999-99-99'];
    return ['', '9999-99-99'];
  }, [periodo]);

  // Combined audit records: app's live records + any uploaded custom auditorias
  const allRecords = useMemo(() => {
    const customRecs = (seedData.auditorias || []) as SavedAuditRecord[];
    const combined = [...records];
    
    // Merge custom records if any, deduplicating by _id
    customRecs.forEach(cr => {
      if (!combined.some(r => r._id === cr._id || (r.tienda === cr.tienda && r.fecha === cr.fecha))) {
        combined.push(cr);
      }
    });

    return combined;
  }, [records, seedData.auditorias]);

  // Helper to map store names to seed stores
  const storeMap = useMemo(() => {
    const map = new Map<string, DashboardTienda>();
    seedData.config.tiendas.forEach(t => {
      map.set(normalizeName(t.name), t);
      map.set(normalizeName(t.id), t);
    });
    return map;
  }, [seedData.config.tiendas]);

  // Determine supervisor for a store
  const getSupIdOfStore = (storeName: string): string => {
    const matched = storeMap.get(normalizeName(storeName));
    if (matched) return matched.sup;
    // Fallback search
    const norm = normalizeName(storeName);
    for (const t of seedData.config.tiendas) {
      if (norm.includes(normalizeName(t.name)) || normalizeName(t.name).includes(norm)) {
        return t.sup;
      }
    }
    return '';
  };

  // Determine status according to business thresholds:
  // - Crítica: menos de 70 (< 70)
  // - Revisión: de 70 a 84,99 (70 <= total < 85)
  // - Aprobado: 85 en adelante (>= 85)
  const getRecordStatus = (r: SavedAuditRecord): 'crit' | 'rev' | 'ok' => {
    const total = Number(r.total) || 0;
    if (total < THR.critica) return 'crit';
    if (total >= THR.ok) return 'ok';
    return 'rev';
  };

  // Filter records by period and supervisor
  const periodFilteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      const f = r.fecha || '';
      if (f < dateFrom || f >= dateTo) return false;
      if (selectedSup) {
        const supId = getSupIdOfStore(r.tienda);
        if (supId !== selectedSup && (r as any).supervisoraId !== selectedSup) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  }, [allRecords, dateFrom, dateTo, selectedSup, storeMap]);

  // Store statuses calculated based on their last audit in period
  const storeStatusList = useMemo(() => {
    const tiendas = seedData.config.tiendas.filter(t => !selectedSup || t.sup === selectedSup);

    return tiendas.map(t => {
      const normT = normalizeName(t.name);
      const storeAudits = periodFilteredRecords.filter(r => {
        const normR = normalizeName(r.tienda);
        return normR === normT || normR.includes(normT) || normT.includes(normR);
      });

      const last = storeAudits[0] || null;
      const status: 'crit' | 'rev' | 'ok' | 'none' = last ? getRecordStatus(last) : 'none';

      return {
        tienda: t,
        last,
        auditCount: storeAudits.length,
        status
      };
    });
  }, [seedData.config.tiendas, selectedSup, periodFilteredRecords]);

  // Counts for tiles
  const counts = useMemo(() => {
    const c = { crit: 0, rev: 0, ok: 0, none: 0 };
    storeStatusList.forEach(s => c[s.status]++);
    const totalStores = storeStatusList.length;
    const audited = totalStores - c.none;
    const auditedPct = totalStores > 0 ? Math.round((audited / totalStores) * 100) : 0;
    return { ...c, totalStores, audited, auditedPct };
  }, [storeStatusList]);

  // Supervisora Summary Table Data
  const supervisorStats = useMemo(() => {
    return seedData.config.supervisoras
      .filter(s => !selectedSup || s.id === selectedSup)
      .map(sup => {
        const supStores = storeStatusList.filter(x => x.tienda.sup === sup.id);
        const k = { crit: 0, rev: 0, ok: 0, none: 0 };
        supStores.forEach(x => k[x.status]++);

        const auditedStores = supStores.filter(x => x.last);
        const avg = auditedStores.length
          ? auditedStores.reduce((acc, curr) => acc + Number(curr.last!.total), 0) / auditedStores.length
          : null;

        return {
          sup,
          total: supStores.length,
          audited: auditedStores.length,
          crit: k.crit,
          rev: k.rev,
          ok: k.ok,
          none: k.none,
          avg
        };
      })
      .filter(x => x.total > 0);
  }, [seedData.config.supervisoras, selectedSup, storeStatusList]);

  const supNameById = (id: string): string => {
    return seedData.config.supervisoras.find(s => s.id === id)?.name || 'Sin supervisora';
  };

  const supColorById = (id: string): string => {
    return SUPERVISOR_COLORS[id] || DEFAULT_SUP_COLOR;
  };

  // Group definitions for the store cards grid
  const groups: Array<{ key: 'crit' | 'rev' | 'ok' | 'none'; label: string; color: string; borderVar: string }> = [
    { key: 'crit', label: 'Críticas', color: 'var(--bad)', borderVar: 'var(--bad)' },
    { key: 'rev', label: 'Para revisión', color: 'var(--warn)', borderVar: 'var(--warn)' },
    { key: 'ok', label: 'Aprobado', color: 'var(--ok)', borderVar: 'var(--ok)' },
    { key: 'none', label: 'Sin auditar', color: 'var(--fg-muted)', borderVar: 'var(--line)' }
  ];

  // Filtered stores to display
  const displayedGroups = groups.filter(g => dashFilter === 'all' || dashFilter === g.key);

  const auditedGroups = useMemo(() => {
    return displayedGroups.filter(g => g.key !== 'none');
  }, [displayedGroups]);

  const noneItems = useMemo(() => {
    return storeStatusList
      .filter(x => x.status === 'none')
      .sort((a, b) => a.tienda.name.localeCompare(b.tienda.name));
  }, [storeStatusList]);

  const PERIOD_OPTIONS = [
    { id: 'mes', label: 'Este mes' },
    { id: 'mesant', label: 'Mes anterior' },
    { id: '3m', label: 'Últimos 3 meses' },
    { id: 'todo', label: 'Todo el historial' },
  ] as const;

  return (
    <div className="dashboard-wrapper">
      {/* Primer Sección Unificada en un solo contenedor Card */}
      <section className="dash-overview-card card" aria-label="Resumen de Dashboard">
        {/* Dashboard Top Header */}
        <div className="dash-header-row">
          <div>
            <h2 className="dash-title">Dashboard de Auditorías</h2>
            <p className="dash-subtitle">
              Estado de cada tienda según su última auditoría: críticas, para revisión, aprobado y sin auditar.
            </p>
          </div>
        </div>

        {/* Filter Bar: Periodo y Supervisora con desplegables estilizados */}
        <div className="dash-filters-row">
          {/* Desplegable Período */}
          <div className="dash-filter-col">
            <label id="dPeriodoLabel">Período</label>
            <div className="dash-filter-dropdown-wrapper" ref={periodDropdownRef}>
              <button
                type="button"
                className={`dash-select-trigger ${isPeriodOpen ? 'is-open' : ''}`}
                onClick={() => {
                  setIsPeriodOpen(prev => !prev);
                  setIsSupOpen(false);
                }}
                aria-expanded={isPeriodOpen}
                aria-haspopup="listbox"
                aria-labelledby="dPeriodoLabel"
              >
                <div className="dash-select-trigger-left">
                  <Calendar size={15} className="dash-select-icon" />
                  <span className="dash-select-trigger-label">
                    {PERIOD_OPTIONS.find(p => p.id === periodo)?.label || 'Este mes'}
                  </span>
                </div>
                <ChevronDown size={14} className={`dash-select-chevron ${isPeriodOpen ? 'rotate' : ''}`} />
              </button>

              {isPeriodOpen && (
                <div className="dash-select-menu" role="listbox">
                  {PERIOD_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      role="option"
                      aria-selected={periodo === opt.id}
                      className={`dash-select-item ${periodo === opt.id ? 'is-selected' : ''}`}
                      onClick={() => {
                        setPeriodo(opt.id);
                        setIsPeriodOpen(false);
                      }}
                    >
                      <span className="dash-select-item-text">{opt.label}</span>
                      {periodo === opt.id && <Check size={14} className="selected-check" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desplegable Supervisora */}
          <div className="dash-filter-col">
            <label id="dSupLabel">Supervisora</label>
            <div className="dash-filter-dropdown-wrapper" ref={supDropdownRef}>
              <button
                type="button"
                className={`dash-select-trigger ${isSupOpen ? 'is-open' : ''} ${selectedSup ? 'has-filter' : ''}`}
                onClick={() => {
                  setIsSupOpen(prev => !prev);
                  setIsPeriodOpen(false);
                }}
                aria-expanded={isSupOpen}
                aria-haspopup="listbox"
                aria-labelledby="dSupLabel"
              >
                <div className="dash-select-trigger-left">
                  {selectedSup ? (
                    <i className="dash-dot" style={{ background: supColorById(selectedSup), marginRight: '4px' }} />
                  ) : (
                    <Users size={15} className="dash-select-icon" />
                  )}
                  <span className="dash-select-trigger-label">
                    {selectedSup ? supNameById(selectedSup) : 'Todas'}
                  </span>
                </div>
                <ChevronDown size={14} className={`dash-select-chevron ${isSupOpen ? 'rotate' : ''}`} />
              </button>

              {isSupOpen && (
                <div className="dash-select-menu" role="listbox" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedSup === ''}
                    className={`dash-select-item ${selectedSup === '' ? 'is-selected' : ''}`}
                    onClick={() => {
                      setSelectedSup('');
                      setIsSupOpen(false);
                    }}
                  >
                    <div className="dash-select-item-left">
                      <Users size={13} style={{ opacity: 0.7 }} />
                      <span className="dash-select-item-text">Todas las supervisoras</span>
                    </div>
                    {selectedSup === '' && <Check size={14} className="selected-check" />}
                  </button>

                  {seedData.config.supervisoras
                    .filter(s => seedData.config.tiendas.some(t => t.sup === s.id))
                    .map(s => (
                      <button
                        key={s.id}
                        type="button"
                        role="option"
                        aria-selected={selectedSup === s.id}
                        className={`dash-select-item ${selectedSup === s.id ? 'is-selected' : ''}`}
                        onClick={() => {
                          setSelectedSup(s.id);
                          setIsSupOpen(false);
                        }}
                      >
                        <div className="dash-select-item-left">
                          <i className="dash-dot" style={{ background: supColorById(s.id) }} />
                          <span className="dash-select-item-text">{s.name}</span>
                        </div>
                        {selectedSup === s.id && <Check size={14} className="selected-check" />}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI Tiles */}
        <div className="dash-tiles-grid">
          {/* Auditadas */}
          <button
            type="button"
            className={`dash-tile t-all ${dashFilter === 'all' ? 'active' : ''}`}
            onClick={(e) => handleTileClick('all', e)}
          >
            <div className="dash-tile-head">
              <span className="dash-tile-label">Auditadas</span>
              <div className="dash-tile-icon-badge t-all">
                <ClipboardCheck size={16} />
              </div>
            </div>

            <div className="dash-tile-main">
              <span className="dash-tile-val num">
                <AnimatedCounter value={counts.audited} />
              </span>
              <span className="dash-tile-denom num">/{counts.totalStores}</span>
            </div>

            <div className="dash-tile-bar-track">
              <div
                className="dash-tile-bar-fill t-all"
                style={{ width: `${counts.auditedPct}%` }}
              />
            </div>

            <div className="dash-tile-foot">
              <span className="dash-tile-sub">
                {counts.totalStores ? 'de las tiendas' : 'Sin tiendas'}
              </span>
              <span className="dash-tile-pct num">{counts.auditedPct}%</span>
            </div>
          </button>

          {/* Críticas */}
          <button
            type="button"
            className={`dash-tile t-crit ${dashFilter === 'crit' ? 'active' : ''}`}
            onClick={(e) => handleTileClick('crit', e)}
          >
            <div className="dash-tile-head">
              <span className="dash-tile-label">Críticas</span>
              <div className="dash-tile-icon-badge t-crit">
                <AlertTriangle size={16} />
              </div>
            </div>

            <div className="dash-tile-main">
              <span className="dash-tile-val num">
                <AnimatedCounter value={counts.crit} />
              </span>
            </div>

            <div className="dash-tile-bar-track">
              <div
                className="dash-tile-bar-fill t-crit"
                style={{
                  width: `${counts.totalStores ? (counts.crit / counts.totalStores) * 100 : 0}%`
                }}
              />
            </div>

            <div className="dash-tile-foot">
              <span className="dash-tile-sub">menos de {THR.critica} puntos</span>
              <span className="dash-tile-pct num">
                {counts.totalStores ? Math.round((counts.crit / counts.totalStores) * 100) : 0}%
              </span>
            </div>
          </button>

          {/* Para revisión */}
          <button
            type="button"
            className={`dash-tile t-rev ${dashFilter === 'rev' ? 'active' : ''}`}
            onClick={(e) => handleTileClick('rev', e)}
          >
            <div className="dash-tile-head">
              <span className="dash-tile-label">Para revisión</span>
              <div className="dash-tile-icon-badge t-rev">
                <AlertCircle size={16} />
              </div>
            </div>

            <div className="dash-tile-main">
              <span className="dash-tile-val num">
                <AnimatedCounter value={counts.rev} />
              </span>
            </div>

            <div className="dash-tile-bar-track">
              <div
                className="dash-tile-bar-fill t-rev"
                style={{
                  width: `${counts.totalStores ? (counts.rev / counts.totalStores) * 100 : 0}%`
                }}
              />
            </div>

            <div className="dash-tile-foot">
              <span className="dash-tile-sub">de {THR.critica} a {f2(THR.ok - 0.01)}</span>
              <span className="dash-tile-pct num">
                {counts.totalStores ? Math.round((counts.rev / counts.totalStores) * 100) : 0}%
              </span>
            </div>
          </button>

          {/* Aprobado */}
          <button
            type="button"
            className={`dash-tile t-ok ${dashFilter === 'ok' ? 'active' : ''}`}
            onClick={(e) => handleTileClick('ok', e)}
          >
            <div className="dash-tile-head">
              <span className="dash-tile-label">Aprobado</span>
              <div className="dash-tile-icon-badge t-ok">
                <CheckCircle2 size={16} />
              </div>
            </div>

            <div className="dash-tile-main">
              <span className="dash-tile-val num">
                <AnimatedCounter value={counts.ok} />
              </span>
            </div>

            <div className="dash-tile-bar-track">
              <div
                className="dash-tile-bar-fill t-ok"
                style={{
                  width: `${counts.totalStores ? (counts.ok / counts.totalStores) * 100 : 0}%`
                }}
              />
            </div>

            <div className="dash-tile-foot">
              <span className="dash-tile-sub">{THR.ok} puntos o más</span>
              <span className="dash-tile-pct num">
                {counts.totalStores ? Math.round((counts.ok / counts.totalStores) * 100) : 0}%
              </span>
            </div>
          </button>

          {/* Sin auditar */}
          <button
            type="button"
            className={`dash-tile t-none ${dashFilter === 'none' ? 'active' : ''}`}
            onClick={(e) => handleTileClick('none', e)}
          >
            <div className="dash-tile-head">
              <span className="dash-tile-label">Sin auditar</span>
              <div className="dash-tile-icon-badge t-none">
                <Clock size={16} />
              </div>
            </div>

            <div className="dash-tile-main">
              <span className="dash-tile-val num">
                <AnimatedCounter value={counts.none} />
              </span>
            </div>

            <div className="dash-tile-bar-track">
              <div
                className="dash-tile-bar-fill t-none"
                style={{
                  width: `${counts.totalStores ? (counts.none / counts.totalStores) * 100 : 0}%`
                }}
              />
            </div>

            <div className="dash-tile-foot">
              <span className="dash-tile-sub">en el período</span>
              <span className="dash-tile-pct num">
                {counts.totalStores ? Math.round((counts.none / counts.totalStores) * 100) : 0}%
              </span>
            </div>
          </button>
        </div>

        {/* Coverage Progress Bar & Legend */}
        {counts.totalStores > 0 && (
          <div className="dash-coverage-block">
            <div className="dash-coverage-bar" role="img" aria-label="Distribución de auditorías">
              <span
                style={{
                  width: `${(counts.crit / counts.totalStores) * 100}%`,
                  background: 'var(--bad)'
                }}
              />
              <span
                style={{
                  width: `${(counts.rev / counts.totalStores) * 100}%`,
                  background: 'var(--warn)'
                }}
              />
              <span
                style={{
                  width: `${(counts.ok / counts.totalStores) * 100}%`,
                  background: 'var(--ok)'
                }}
              />
            </div>

            <div className="dash-coverage-legend num">
              <span>
                <i className="dash-dot" style={{ background: 'var(--bad)' }} />
                Críticas <b>{counts.crit}</b>
              </span>
              <span>
                <i className="dash-dot" style={{ background: 'var(--warn)' }} />
                Revisión <b>{counts.rev}</b>
              </span>
              <span>
                <i className="dash-dot" style={{ background: 'var(--ok)' }} />
                Aprobado <b>{counts.ok}</b>
              </span>
              <span>
                <i className="dash-dot" style={{ background: 'var(--surface-3)', border: '1px solid var(--line-strong)' }} />
                Sin auditar <b>{counts.none}</b>
              </span>
            </div>

            <div className="dash-threshold-notes">
              <span>Se toma la última auditoría de cada tienda en el período.</span>
              <span><b style={{ color: 'var(--ok)' }}>Aprobado</b>: {THR.ok} o más</span>
              <span><b style={{ color: 'var(--warn)' }}>Revisión</b>: {THR.critica} a {f2(THR.ok - 0.01)}</span>
              <span><b style={{ color: 'var(--bad)' }}>Crítica</b>: menos de {THR.critica}</span>
            </div>
          </div>
        )}
      </section>

      {/* Contenedor Medio: Tiendas Auditadas (Críticas, Para revisión, OK) */}
      {auditedGroups.length > 0 && dashFilter !== 'none' && (
        <section ref={auditsContainerRef} className="dash-audits-card card" aria-label="Tiendas auditadas por estado">
          <div key={dashFilter} className="dash-status-sections dash-filter-enter">
            {auditedGroups.map((group, gIdx) => {
              const items = storeStatusList
                .filter(x => x.status === group.key)
                .sort((a, b) => Number(a.last?.total || 0) - Number(b.last?.total || 0));

              if (!items.length) {
                if (dashFilter === group.key) {
                  return (
                    <div key={group.key} className="dash-group-section">
                      <div className="dash-group-header">
                        <h3 style={{ color: group.color }}>{group.label}</h3>
                        <span className="dash-group-empty">ninguna</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }

              return (
                <div key={group.key} className="dash-group-section">
                  <div className="dash-group-header">
                    <h3 style={{ color: group.color }}>{group.label}</h3>
                    <span className="dash-group-count num">
                      {items.length} {items.length === 1 ? 'tienda' : 'tiendas'}
                    </span>
                  </div>

                  <div className="dash-stores-grid">
                    {items.map(x => {
                      const r = x.last!;
                      const devs = (r.desvios || [])
                        .slice()
                        .sort((a, b) => (b.ideal - b.real) - (a.ideal - a.real))
                        .slice(0, 3);

                      const statusClass = group.key;

                      return (
                        <div key={x.tienda.id} className={`dash-store-card ${statusClass}`}>
                          <div className="dash-store-card-head">
                            <div>
                              <div className="dash-store-name">
                                {x.tienda.name}
                                {(x.tienda.tags || []).map(tag => (
                                  <span key={tag} className="tag-mini">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <div className="dash-store-sup">
                                <i className="dash-dot" style={{ background: supColorById(x.tienda.sup) }} />
                                {supNameById(x.tienda.sup)}
                              </div>
                            </div>

                            <div className={`dash-store-score num ${statusClass}`}>
                              <AnimatedCounter value={Number(r.total || 0)} decimals={2} />
                            </div>
                          </div>

                          <div className="dash-store-meta num">
                            <span>{fmtDate(r.fecha)}</span>
                            <span>·</span>
                            <span>{r.auditMode === 'experience' ? '✨ Experience' : 'Normal'}</span>
                            <span>·</span>
                            <span>{r.auditor || 'Sin auditor'}</span>
                            {(r as any).critico && (
                              <b style={{ color: 'var(--bad)', marginLeft: '4px' }}>· falla ítem 2.6</b>
                            )}
                            {!r.completa && (
                              <span className="tag-mini warn" style={{ marginLeft: '4px' }}>
                                Incompleta
                              </span>
                            )}
                            {x.auditCount > 1 && (
                              <span style={{ color: 'var(--fg-muted)', marginLeft: '4px' }}>
                                ({x.auditCount} auditorías)
                              </span>
                            )}
                          </div>

                          {devs.length > 0 && group.key !== 'ok' && (
                            <ul className="dash-store-devs">
                              {devs.map((d, dIdx) => (
                                <li key={dIdx}>
                                  <b>{d.n}</b> {d.texto.length > 68 ? `${d.texto.slice(0, 68)}…` : d.texto}{' '}
                                  <span className="num" style={{ color: 'var(--fg-muted)' }}>
                                    ({f2(d.real)}/{f2(d.ideal)})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {gIdx < auditedGroups.length - 1 && <div className="dash-group-divider" />}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Contenedor Unificado: Sin Auditar y Rendimiento por Supervisora */}
      {((dashFilter === 'all' || dashFilter === 'none') || supervisorStats.length > 0) && (
        <section ref={bottomContainerRef} className="dash-bottom-card card" aria-label="Sin auditar y rendimiento por supervisora">
          {/* Bloque: Sin Auditar */}
          {(dashFilter === 'all' || dashFilter === 'none') && (
            <div key={`none-${dashFilter}`} className="dash-group-section dash-filter-enter" style={{ marginBottom: 0 }}>
              <div className="dash-group-header">
                <h3 style={{ color: 'var(--fg-muted)' }}>SIN AUDITAR</h3>
                <span className="dash-group-count num">
                  {noneItems.length} {noneItems.length === 1 ? 'tienda' : 'tiendas'}
                </span>
              </div>

              {noneItems.length === 0 ? (
                <span className="dash-group-empty">ninguna</span>
              ) : (
                <div className="dash-none-grid">
                  {noneItems.map(x => (
                    <span key={x.tienda.id} className="dash-none-chip">
                      <i className="dash-dot" style={{ background: supColorById(x.tienda.sup) }} />
                      {x.tienda.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {(dashFilter === 'all' || dashFilter === 'none') && supervisorStats.length > 0 && (
            <div className="dash-inner-divider" />
          )}

          {/* Bloque: Rendimiento por Supervisora */}
          {supervisorStats.length > 0 && (
            <div className="dash-supervisor-section">
              <div className="dash-group-header">
                <h3 className="dash-sub-heading" style={{ color: 'var(--fg)' }}>
                  Rendimiento por Supervisora
                </h3>
              </div>

              <div className="tbl-wrap dash-table-wrap">
                <table className="dash-sup-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Supervisora</th>
                      <th>Tiendas</th>
                      <th>Auditadas</th>
                      <th>Críticas</th>
                      <th>Revisión</th>
                      <th>Aprobado</th>
                      <th>Sin auditar</th>
                      <th>Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supervisorStats.map(row => (
                      <tr key={row.sup.id}>
                        <td style={{ textAlign: 'left', fontWeight: 600 }}>
                          <i className="dash-dot" style={{ background: supColorById(row.sup.id) }} />
                          {row.sup.name}
                        </td>
                        <td className="num">{row.total}</td>
                        <td className="num">{row.audited}</td>
                        <td className={`num ${row.crit ? 'c-bad' : ''}`}>{row.crit}</td>
                        <td className={`num ${row.rev ? 'c-warn' : ''}`}>{row.rev}</td>
                        <td className={`num ${row.ok ? 'c-ok' : ''}`}>{row.ok}</td>
                        <td className="num" style={{ color: 'var(--fg-muted)' }}>{row.none}</td>
                        <td className="num" style={{ fontWeight: 700 }}>
                          {row.avg != null ? f2(row.avg) : '–'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

    </div>
  );
};
