import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { authenticateAsync, UserProfile } from '../lib/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await authenticateAsync(email, password);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Error al verificar credenciales.');
    }
  };

  return (
    <div className="login-screen-wrapper">
      {/* Background glow orbs */}
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      {/* Main Login Card Container */}
      <div className="login-card-container">
        <div className="login-card">
          {/* Brand header */}
          <div className="login-card-header">
            <div className="login-logo-wrap">
              <img
                src="logo-script.png"
                alt="Mi Gusto"
                className="login-logo-img"
              />
            </div>
            <div className="login-badge-row">
              <span className="login-badge">
                <ShieldCheck size={13} />
                <span>Portal de Auditorías</span>
              </span>
            </div>
            <h2 className="login-title">Bienvenido</h2>
            <p className="login-subtitle">
              Ingresá con tu cuenta corporativa de Mi Gusto para acceder al sistema.
            </p>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="login-error-banner" role="alert">
              <AlertCircle size={16} className="login-error-icon" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field-group">
              <label className="login-label" htmlFor="login-email">
                Correo Institucional <span className="req-star">*</span>
              </label>
              <div className="login-input-wrap">
                <Mail size={16} className="login-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="usuario@migusto.com.ar"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                />
              </div>
            </div>

            <div className="login-field-group">
              <label className="login-label" htmlFor="login-password">
                Contraseña <span className="req-star">*</span>
              </label>
              <div className="login-input-wrap">
                <Lock size={16} className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input login-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-eye-btn"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="login-submit-btn"
            >
              <span>{isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="login-footer-info">
            <p>Tu sesión se mantendrá guardada en este equipo.</p>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="app-footer login-footer">
        <p>© Desarrollado por el Departamento de Sistemas de Mi Gusto | Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};
