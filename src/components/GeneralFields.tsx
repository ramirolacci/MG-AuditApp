import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { AuditFields } from '../types/audit';
import { Store, User, Users, ShoppingBag, Briefcase, Play, X } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';

interface GeneralFieldsProps {
  fields: AuditFields;
  onFieldChange: (field: keyof AuditFields, value: string) => void;
  onStartAudit: () => void;
  isStarted: boolean;
  onClose?: () => void;
}

export const GeneralFields: React.FC<GeneralFieldsProps> = ({
  fields,
  onFieldChange,
  onStartAudit,
  isStarted,
  onClose
}) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.field-item, .start-audit-banner'),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
      );
    }
  }, [isStarted]);

  return (
    <section ref={containerRef} className="general-card-setup card" aria-label="Nivel 0: Datos de la Sucursal">
      <div className="setup-header-row">
        <div className="setup-title-group">
          <div className="setup-title-heading-row">
            <h2 className="setup-main-title">Sucursal</h2>
            <span className="setup-step-pill">Nivel 0</span>
          </div>
          <p className="setup-sub-text">Cargá los datos de la sucursal y del auditor para iniciar la auditoría.</p>
        </div>
        {onClose && (
          <button
            type="button"
            className="icon-btn-subtle"
            onClick={onClose}
            title="Cerrar y volver a la auditoría"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="fields-single-line">
        {/* 1. Tienda (Obligatorio) */}
        <div className="field-item">
          <label htmlFor="f_tienda">
            <Store size={14} className="field-icon" />
            <span>Tienda / Sucursal <span className="req-star">*</span></span>
          </label>
          <input
            id="f_tienda"
            type="text"
            autoComplete="off"
            value={fields.f_tienda}
            onChange={e => onFieldChange('f_tienda', e.target.value)}
            placeholder="Ej. Palermo"
          />
        </div>

        {/* 2. Auditor (Obligatorio) */}
        <div className="field-item">
          <label htmlFor="f_auditor">
            <User size={14} className="field-icon" />
            <span>Auditor/a <span className="req-star">*</span></span>
          </label>
          <input
            id="f_auditor"
            type="text"
            autoComplete="name"
            value={fields.f_auditor}
            onChange={e => onFieldChange('f_auditor', e.target.value)}
            placeholder="Tu nombre"
          />
        </div>

        {/* 3. Fecha con Custom DatePicker */}
        <div className="field-item">
          <label>
            <span>Fecha de auditoría <span className="req-star">*</span></span>
          </label>
          <CustomDatePicker
            value={fields.f_fecha}
            onChange={val => onFieldChange('f_fecha', val)}
          />
        </div>

        {/* 4. Personal a cargo */}
        <div className="field-item">
          <label htmlFor="f_cargo">
            <Briefcase size={14} className="field-icon" />
            <span>Persona a cargo</span>
          </label>
          <input
            id="f_cargo"
            type="text"
            autoComplete="off"
            value={fields.f_cargo}
            onChange={e => onFieldChange('f_cargo', e.target.value)}
            placeholder="Encargado/a de turno"
          />
        </div>

        {/* 5. Colaboradores */}
        <div className="field-item">
          <label htmlFor="f_colab">
            <Users size={14} className="field-icon" />
            <span>Cant. Colaboradores</span>
          </label>
          <input
            id="f_colab"
            type="number"
            inputMode="numeric"
            min="0"
            value={fields.f_colab}
            onChange={e => onFieldChange('f_colab', e.target.value)}
            placeholder="Ej. 4"
            className="no-spinners"
          />
        </div>

        {/* 6. Unidades vendidas */}
        <div className="field-item">
          <label htmlFor="f_unid">
            <ShoppingBag size={14} className="field-icon" />
            <span>Unidades vendidas</span>
          </label>
          <input
            id="f_unid"
            type="number"
            inputMode="numeric"
            min="0"
            value={fields.f_unid}
            onChange={e => onFieldChange('f_unid', e.target.value)}
            placeholder="Ej. 350"
            className="no-spinners"
          />
        </div>
      </div>

      <div className="setup-actions-footer">
        <button
          type="button"
          className="btn-start-audit-primary"
          onClick={onStartAudit}
        >
          <span>{isStarted ? 'Continuar Auditoría' : 'Iniciar Auditoría'}</span>
          <Play size={18} fill="currentColor" />
        </button>
      </div>
    </section>
  );
};
