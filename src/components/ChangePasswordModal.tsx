import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Lock, Eye, EyeOff, Check, AlertCircle, X } from 'lucide-react';
import { updateUserPassword, UserProfile } from '../lib/auth';

interface ChangePasswordModalProps {
  currentUser: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  currentUser,
  isOpen,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Smooth entrance animation
  useEffect(() => {
    if (isOpen && cardRef.current && backdropRef.current) {
      setIsClosing(false);
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.22, ease: 'power2.out' }
      );
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.94, y: 14 },
        { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  // Smooth exit animation
  const handleClose = () => {
    if (isClosing || isLoading) return;
    setIsClosing(true);

    if (backdropRef.current && cardRef.current) {
      gsap.to(cardRef.current, {
        opacity: 0,
        scale: 0.94,
        y: 10,
        duration: 0.2,
        ease: 'power2.in'
      });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          setIsClosing(false);
          onClose();
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setErrorMsg('');
          setSuccessMsg('');
        }
      });
    } else {
      setIsClosing(false);
      onClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, isClosing]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Las nuevas contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await updateUserPassword(
        currentUser.email,
        currentPassword,
        newPassword
      );

      setIsLoading(false);

      if (res.success) {
        setSuccessMsg('¡Contraseña actualizada con éxito!');
        setTimeout(() => {
          handleClose();
        }, 1100);
      } else {
        setErrorMsg(res.error || 'No se pudo actualizar la contraseña.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Ocurrió un error inesperado al guardar la contraseña.');
    }
  };

  return (
    <div 
      ref={backdropRef}
      className="change-pwd-backdrop" 
      role="dialog" 
      aria-modal="true"
      onClick={(e) => {
        if (e.target === backdropRef.current && !isLoading && !isClosing) {
          handleClose();
        }
      }}
    >
      <div className="change-pwd-card" ref={cardRef}>
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading || isClosing}
          className="change-pwd-close-btn"
          aria-label="Cerrar modal"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="change-pwd-header">
          <div className="change-pwd-icon-wrap">
            <Lock size={22} />
          </div>
          <div className="change-pwd-header-text">
            <h3 className="change-pwd-title">Cambiar contraseña</h3>
            <div className="change-pwd-subtitle">
              <span className="change-pwd-user-name">{currentUser.name}</span>
              <span className="change-pwd-user-sep">•</span>
              <span className="change-pwd-user-email">{currentUser.email}</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="change-pwd-alert error">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="change-pwd-alert success">
            <Check size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="change-pwd-form">
          {/* Current Password */}
          <div className="change-pwd-field">
            <label className="change-pwd-label">
              Contraseña actual <span className="req-star">*</span>
            </label>
            <div className="change-pwd-input-wrap">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresá tu contraseña actual"
                className="change-pwd-input"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="change-pwd-eye-btn"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="change-pwd-field">
            <label className="change-pwd-label">
              Nueva contraseña <span className="req-star">*</span>
            </label>
            <div className="change-pwd-input-wrap">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="change-pwd-input"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="change-pwd-eye-btn"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="change-pwd-field">
            <label className="change-pwd-label">
              Confirmar nueva contraseña <span className="req-star">*</span>
            </label>
            <div className="change-pwd-input-wrap">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí la nueva contraseña"
                className="change-pwd-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="change-pwd-eye-btn"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Buttons: Submit first, Cancel second */}
          <div className="change-pwd-actions">
            <button
              type="submit"
              disabled={isLoading || isClosing}
              className="change-pwd-btn-submit"
            >
              {isLoading ? (
                <>
                  <span className="spinner-sm"></span>
                  <span>Guardando...</span>
                </>
              ) : (
                'Actualizar contraseña'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading || isClosing}
              className="change-pwd-btn-cancel"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
