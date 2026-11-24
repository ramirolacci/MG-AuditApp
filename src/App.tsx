import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useAuditState } from './hooks/useAuditState';
import { useSharedStorage } from './hooks/useSharedStorage';
import { useWakeLock } from './hooks/useWakeLock';
import { Navbar, ActiveTab } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { getStoredSession, clearSession, UserProfile, canUserDeleteAudits } from './lib/auth';
import { ScoreBoard } from './components/ScoreBoard';
import { GeneralFields } from './components/GeneralFields';
import { SegmentCard } from './components/SegmentCard';
import { VerdictCard } from './components/VerdictCard';
import { DeviationsList } from './components/DeviationsList';
import { ActionToolbar } from './components/ActionToolbar';
import { HistorySection } from './components/HistorySection';
import { DashboardSection } from './components/DashboardSection';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { PhotoLightbox } from './components/PhotoLightbox';
import { AuditCharts } from './components/AuditCharts';
import { UnfinishedAuditModal } from './components/UnfinishedAuditModal';
import { DesktopPhasesBar } from './components/DesktopPhasesBar';
import { getSegments, getTotalItems } from './data/segments';
import { buildRecordToSave } from './utils/formatters';
import { AuditMode } from './types/audit';
import { Sparkles, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ToastState {
  msg: string;
  isErr: boolean;
  type?: 'experience' | 'normal' | 'success' | 'error' | 'info';
}

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredSession());
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const [auditMode, setAuditMode] = useState<AuditMode>(() => {
    try {
      const savedMode = localStorage.getItem('auditoria-mi-gusto-mode');
      if (savedMode === 'experience' || savedMode === 'normal') return savedMode;
    } catch (e) {}
    return 'normal';
  });

  const {
    state,
    summary,
    setField,
    setChoice,
    setPartialScore,
    adjustPartialScore,
    setObservation,
    markSegmentPendingAsOk,
    addPhoto,
    removePhoto,
    resetAudit
  } = useAuditState(auditMode);

  const activeSegments = getSegments(auditMode);
  const totalItemsCount = getTotalItems(auditMode);

  // Clean up legacy auto-filled auditor if no audit is in progress
  useEffect(() => {
    if (!state.fields.f_tienda.trim() && summary.done === 0 && state.fields.f_auditor) {
      setField('f_auditor', '');
    }
  }, []);

  const {
    records,
    loading: historyLoading,
    isClaudeEnv,
    canWrite,
    myId,
    hasDownloadsApi,
    saveAudit,
    deleteAudit,
    downloadFile,
    uploadAsset
  } = useSharedStorage();

  // Navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('audit');
  const [currentSegment, setCurrentSegment] = useState<number>(0);
  const [auditStep, setAuditStep] = useState<'setup' | 'evaluate'>(() => {
    return Boolean(state.fields.f_tienda && state.fields.f_auditor) ? 'evaluate' : 'setup';
  });
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showUnfinishedModal, setShowUnfinishedModal] = useState<boolean>(() => {
    // Show modal if an audit was in progress (has items done or store name set) when re-entering app
    const hasProgress = summary.done > 0 || Boolean(state.fields.f_tienda.trim());
    return hasProgress;
  });

  const tabContentRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  const isAuditStarted = summary.done > 0;
  const [currentAuditId, setCurrentAuditId] = useState<string | null>(null);

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleStartAudit = () => {
    if (!state.fields.f_tienda.trim() || !state.fields.f_auditor.trim() || !state.fields.f_fecha.trim()) {
      flashMessage('Por favor completá los campos obligatorios: Tienda, Auditor/a y Fecha', true);
      return;
    }
    setCurrentSegment(0);
    setAuditStep('evaluate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditSetup = () => {
    setAuditStep('setup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModeChange = (mode: AuditMode) => {
    if (mode === auditMode) return;
    setAuditMode(mode);
    setCurrentSegment(0);
    try {
      localStorage.setItem('auditoria-mi-gusto-mode', mode);
    } catch (e) {}
    flashMessage(
      mode === 'experience'
        ? 'Cambiado a auditoría Mi Gusto Experience (12 fases)'
        : 'Cambiado a auditoría Normal (9 fases)'
    );
  };

  const handleSaveAuditRecord = async (recordToSave: ReturnType<typeof buildRecordToSave>) => {
    const stableId = currentAuditId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `audit_${Date.now()}`);
    recordToSave._id = stableId;
    if (!currentAuditId) {
      setCurrentAuditId(stableId);
    }
    const res = await saveAudit(recordToSave);
    if (res.id) {
      setCurrentAuditId(res.id);
    }
    return res;
  };

  // Trigger 3-second evaluation spinner transition, auto-save to history, and prepare clean slate
  const handleJumpToSummaryWithLoading = async () => {
    if (!summary.isComplete) {
      const pendingTotal = totalItemsCount - summary.done;
      flashMessage(
        `No podés finalizar la auditoría: faltan responder ${pendingTotal} ítem${pendingTotal === 1 ? '' : 's'}.`,
        true
      );
      return;
    }

    setIsEvaluating(true);
    
    // Build and save record automatically to history with immediate stable ID
    try {
      const stableId = currentAuditId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `audit_${Date.now()}`);
      if (!currentAuditId) {
        setCurrentAuditId(stableId);
      }
      const record = buildRecordToSave(state, summary, myId, auditMode);
      record._id = stableId;
      const res = await saveAudit(record);
      if (res.id) {
        setCurrentAuditId(res.id);
      }
    } catch (err) {
      console.error('Error auto-saving evaluation:', err);
    }

    setTimeout(() => {
      setIsEvaluating(false);
      setActiveTab('summary');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 3000);
  };

  // Animate tab switch smoothly with GSAP
  useEffect(() => {
    if (tabContentRef.current) {
      gsap.fromTo(
        tabContentRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [activeTab]);

  // Always force Dark Mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  // Animate toast notification with GSAP
  useEffect(() => {
    if (toast && toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        { opacity: 0, y: 24, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'back.out(1.6)' }
      );
    }
  }, [toast]);

  // Activate wake lock when items are being evaluated
  useWakeLock(summary.done > 0);

  // Toast notification state & auto-dismiss timeout
  const flashMessage = (msg: string, isErr = false, type?: ToastState['type']) => {
    let resolvedType = type;
    if (!resolvedType) {
      if (isErr) resolvedType = 'error';
      else if (msg.toLowerCase().includes('experience')) resolvedType = 'experience';
      else if (msg.toLowerCase().includes('normal')) resolvedType = 'normal';
      else resolvedType = 'success';
    }
    setToast({ msg, isErr, type: resolvedType });
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, isErr ? 4000 : 2600);
  };

  const handleFullReset = () => {
    setCurrentAuditId(null);
    resetAudit();
    setAuditStep('setup');
    setCurrentSegment(0);
    setActiveTab('audit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSegment = (si: number) => {
    setAuditStep('evaluate');
    setCurrentSegment(si);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Locate first segment & item with pending question
  const getFirstPendingInfo = () => {
    for (let si = 0; si < activeSegments.length; si++) {
      const seg = activeSegments[si];
      for (let ii = 0; ii < seg.items.length; ii++) {
        const key = `${si}-${ii}`;
        if (!state.answers[key]) {
          return { segmentIndex: si, itemIndex: ii, segmentName: seg.name };
        }
      }
    }
    return null;
  };

  const handleGoToFirstPending = () => {
    const pending = getFirstPendingInfo();
    if (!pending) return;

    if (currentSegment !== pending.segmentIndex) {
      handleSelectSegment(pending.segmentIndex);
    }

    setTimeout(() => {
      const el = document.getElementById(`item-${pending.segmentIndex}-${pending.itemIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-pending-pulse');
        setTimeout(() => el.classList.remove('highlight-pending-pulse'), 2500);
      }
    }, currentSegment !== pending.segmentIndex ? 300 : 50);

    flashMessage(`Ítem pendiente en Fase ${pending.segmentIndex + 1}: ${pending.segmentName}`, true);
  };

  const handleCopyText = async (txt: string) => {
    // Si ya viene formateado como un mensaje de confirmación
    if (txt.startsWith('¡') || txt.includes('copiado')) {
      flashMessage(txt);
      return;
    }

    try {
      await navigator.clipboard.writeText(txt);
      flashMessage('Resumen copiado para WhatsApp');
    } catch (e) {
      flashMessage('No se pudo copiar automáticamente', true);
    }
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Top Navbar with Centered Links, Mode Switcher & Sticky Mobile Phases Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        deviationsCount={summary.devs.length}
        historyCount={records.length}
        storeName={state.fields.f_tienda}
        currentSegment={currentSegment}
        onSelectSegment={handleSelectSegment}
        summary={summary}
        onEditSetup={handleEditSetup}
        onLogoClick={handleFullReset}
        auditMode={auditMode}
        onModeChange={handleModeChange}
        auditStep={auditStep}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        currentUser={currentUser}
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <main className="wrap">
        {/* Read-only notification if applicable */}
        {isClaudeEnv && canWrite === false && (
          <div className="access-banner" id="accessBanner" role="status">
            <strong>Acceso de solo lectura</strong>
            <span>
              Podés completar la planilla y copiar el resumen, pero no guardar ni subir fotos a la nube.
            </span>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 1: AUDIT VIEW                                            */}
        {/* ============================================================ */}
        {activeTab === 'audit' && (
          <div ref={tabContentRef} className="audit-tab-content">
            {/* STANDALONE DESKTOP PHASES BAR (OUTSIDE NAVBAR, INCLUDES NIVEL 0) */}
            <DesktopPhasesBar
              auditMode={auditMode}
              summary={summary}
              currentSegment={currentSegment}
              auditStep={auditStep}
              onSelectSegment={handleSelectSegment}
              onEditSetup={handleEditSetup}
            />

            {/* STEP 1: PRE-AUDIT SETUP FORM (MODAL ON DESKTOP) */}
            {auditStep === 'setup' ? (
              <div 
                className="setup-modal-desktop-overlay"
                onClick={(e) => {
                  if (e.target === e.currentTarget && isAuditStarted) {
                    setAuditStep('evaluate');
                  }
                }}
              >
                <GeneralFields
                  fields={state.fields}
                  onFieldChange={setField}
                  onStartAudit={handleStartAudit}
                  isStarted={isAuditStarted}
                  onClose={isAuditStarted ? () => setAuditStep('evaluate') : undefined}
                />
              </div>
            ) : (
              /* STEP 2: EVALUATION MODE (NO GENERAL FIELDS PANEL VISIBLE) */
              <>
                <ScoreBoard
                  summary={summary}
                  currentSegment={currentSegment}
                  segments={activeSegments}
                  onSelectSegment={handleSelectSegment}
                  onJumpToSummary={handleJumpToSummaryWithLoading}
                />

                <div id="segments" className="segments-viewport">
                  <SegmentCard
                    key={`${auditMode}-${currentSegment}`}
                    segmentData={summary.rows[currentSegment]}
                    answers={state.answers}
                    photos={state.photos}
                    totalSegments={activeSegments.length}
                    isOpen={true}
                    isFocused={true}
                    isAuditComplete={summary.isComplete}
                    pendingTotalCount={totalItemsCount - summary.done}
                    onGoToFirstPending={handleGoToFirstPending}
                    onChoice={setChoice}
                    onPartialScore={setPartialScore}
                    onAdjustPartialScore={adjustPartialScore}
                    onObservation={setObservation}
                    onMarkPendingAsOk={markSegmentPendingAsOk}
                    onAddPhoto={addPhoto}
                    onRemovePhoto={removePhoto}
                    onViewPhoto={setLightboxSrc}
                    onFlashMessage={flashMessage}
                    uploadAsset={uploadAsset}
                    onNextSegment={() => {
                      if (currentSegment < activeSegments.length - 1) {
                        handleSelectSegment(currentSegment + 1);
                      }
                    }}
                    onPrevSegment={() => {
                      if (currentSegment > 0) {
                        handleSelectSegment(currentSegment - 1);
                      }
                    }}
                    onJumpToSummary={handleJumpToSummaryWithLoading}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: SUMMARY & DEVIATIONS VIEW                             */}
        {/* ============================================================ */}
        {activeTab === 'summary' && (
          <div ref={tabContentRef} className="summary-tab-content">
            <VerdictCard summary={summary} />

            {/* CHARTS & ANALYTICS SECTION */}
            <AuditCharts
              summary={summary}
              storeName={state.fields.f_tienda}
              auditorName={state.fields.f_auditor}
            />

            <DeviationsList
              deviations={summary.devs}
              photos={state.photos}
              onViewPhoto={setLightboxSrc}
              onSelectDeviation={itemNum => {
                const [sStr] = itemNum.split('.');
                const si = parseInt(sStr, 10) - 1;
                if (!isNaN(si) && si >= 0 && si < activeSegments.length) {
                  setCurrentSegment(si);
                  setActiveTab('audit');
                }
              }}
            />

            <ActionToolbar
              state={state}
              summary={summary}
              canWrite={canWrite}
              myId={myId}
              hasDownloadsApi={hasDownloadsApi}
              onSave={handleSaveAuditRecord}
              onReset={handleFullReset}
              onDownload={downloadFile}
              toast={toast}
              setToast={setToast}
              flashMessage={flashMessage}
              auditMode={auditMode}
              currentAuditId={currentAuditId}
              onGoToHistory={() => {
                setActiveTab('history');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              saveNote={
                isClaudeEnv && canWrite === false
                  ? 'Tenés acceso de solo lectura: podés copiar el informe pero no guardar cambios en el servidor.'
                  : undefined
              }
              activeTab={activeTab}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: HISTORY VIEW                                          */}
        {/* ============================================================ */}
        {activeTab === 'history' && (
          <div ref={tabContentRef} className="history-tab-content">
            <HistorySection
              records={records}
              loading={historyLoading}
              isAdmin={canUserDeleteAudits(currentUser)}
              onDeleteRecord={deleteAudit}
              onUpdateRecord={saveAudit}
              onCopyText={handleCopyText}
              onViewPhoto={setLightboxSrc}
              flashMessage={flashMessage}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div ref={tabContentRef} className="dashboard-tab-content">
            <DashboardSection
              records={records}
            />
          </div>
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="app-footer">
        <p>© Desarrollado por el Departamento de Sistemas de Mi Gusto | Todos los derechos reservados.</p>
      </footer>

      {/* Toast Notification Alert */}
      {toast && (
        <div 
          ref={toastRef} 
          className={`toast-notification toast-${toast.type || (toast.isErr ? 'error' : 'success')}`} 
          role="status"
        >
          <div className="toast-icon-bubble">
            {toast.type === 'experience' ? (
              <Sparkles size={16} className="toast-icon-sparkle" />
            ) : toast.type === 'normal' ? (
              <Layers size={16} className="toast-icon-layers" />
            ) : toast.isErr ? (
              <AlertCircle size={16} className="toast-icon-alert" />
            ) : (
              <CheckCircle2 size={16} className="toast-icon-check" />
            )}
          </div>

          <div className="toast-body">
            {toast.type === 'experience' ? (
              <>
                <div className="toast-title">Auditoría Experience</div>
                <div className="toast-subtitle">Modo 12 fases activado</div>
              </>
            ) : toast.type === 'normal' ? (
              <>
                <div className="toast-title">Auditoría Normal</div>
                <div className="toast-subtitle">Modo estándar (9 fases) activado</div>
              </>
            ) : (
              <div className="toast-title toast-single-line">{toast.msg}</div>
            )}
          </div>
        </div>
      )}

      {/* Photo Zoom Lightbox Modal */}
      <PhotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

      {/* 3-Second Fullscreen Evaluation Loading Screen */}
      {isEvaluating && (
        <div className="evaluating-fullscreen-backdrop" role="dialog" aria-modal="true">
          <div className="evaluating-card">
            <div className="evaluating-spinner-wrap">
              <div className="evaluating-ring" />
              <img src="logo.png" alt="Mi Gusto" className="evaluating-logo-center" />
            </div>
            <h3 className="evaluating-title">Evaluando sucursal...</h3>
            <p className="evaluating-subtitle">
              Analizando cumplimiento de {summary.done} ítems y procesando indicadores de calidad.
            </p>
          </div>
        </div>
      )}

      {/* Unfinished Audit Recovery Modal Prompt */}
      {showUnfinishedModal && (
        <UnfinishedAuditModal
          storeName={state.fields.f_tienda}
          auditorName={state.fields.f_auditor}
          doneCount={summary.done}
          totalCount={totalItemsCount}
          onContinue={() => {
            setShowUnfinishedModal(false);
            if (state.fields.f_tienda && state.fields.f_auditor) {
              setAuditStep('evaluate');
            } else {
              setAuditStep('setup');
            }
          }}
          onDiscard={() => {
            setShowUnfinishedModal(false);
            handleFullReset();
          }}
        />
      )}

    </div>
  );
}

export default App;
