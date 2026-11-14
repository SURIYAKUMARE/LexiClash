import { IntegrityViolationLogItem } from '../db/indexedDb';

export type ExamSecurityEventType =
  | 'FULLSCREEN_EXIT'
  | 'TAB_SWITCH'
  | 'WINDOW_BLUR'
  | 'NAVIGATION_ATTEMPT'
  | 'SHORTCUT_ATTEMPT';

export interface ExamSessionState {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  currentIndex: number;
  userSelections: Record<string, number>;
  flaggedQuestions: string[];
  timeLeftSeconds: number;
  totalTimeSeconds: number;
  violationsCount: number;
  violationsLog: IntegrityViolationLogItem[];
  startedAt: string;
  isCompleted: boolean;
}

export type SecurityEventListener = (event: IntegrityViolationLogItem, totalViolations: number) => void;
export type FullscreenChangeListener = (isFullscreen: boolean) => void;

const STORAGE_KEY = 'skillpath_secure_exam_session_v1';

export class ExamSecurityService {
  private static isMonitoring = false;
  private static violations: IntegrityViolationLogItem[] = [];
  private static lastViolationTime = 0;
  private static eventListeners: SecurityEventListener[] = [];
  private static fullscreenListeners: FullscreenChangeListener[] = [];

  /**
   * Request browser full-screen mode on a specific element or documentElement
   */
  public static async enterFullscreen(element?: HTMLElement): Promise<boolean> {
    const target = element || document.documentElement;
    try {
      if (document.fullscreenElement) {
        return true;
      }

      if (target.requestFullscreen) {
        await target.requestFullscreen();
        return true;
      } else if ((target as any).webkitRequestFullscreen) {
        await (target as any).webkitRequestFullscreen();
        return true;
      } else if ((target as any).msRequestFullscreen) {
        await (target as any).msRequestFullscreen();
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Fullscreen entry declined or blocked by browser permission policy:', err);
      return false;
    }
  }

  /**
   * Exit browser full-screen mode cleanly
   */
  public static async exitFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Error exiting full-screen:', err);
    }
  }

  /**
   * Check if the document is currently in full-screen mode
   */
  public static isFullscreen(): boolean {
    return Boolean(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }

  /**
   * Start proctoring and integrity listeners
   */
  public static startProctoring(initialViolations: IntegrityViolationLogItem[] = []): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.violations = [...initialViolations];

    // Notify global layout to suppress floating widgets (mentor, agent drawer)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('skillpath:exam-active', { detail: { active: true } }));
    }

    // Attach listeners
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    window.addEventListener('keydown', this.handleKeyDown, true);
  }

  /**
   * Stop proctoring and clean up all listeners
   */
  public static stopProctoring(): void {
    if (!this.isMonitoring) return;
    this.isMonitoring = false;

    // Notify global layout that exam is concluded
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('skillpath:exam-active', { detail: { active: false } }));
    }

    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('keydown', this.handleKeyDown, true);

    this.exitFullscreen();
  }

  public static onViolation(listener: SecurityEventListener): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== listener);
    };
  }

  public static onFullscreenChange(listener: FullscreenChangeListener): () => void {
    this.fullscreenListeners.push(listener);
    return () => {
      this.fullscreenListeners = this.fullscreenListeners.filter(l => l !== listener);
    };
  }

  private static notifyViolation(violation: IntegrityViolationLogItem) {
    this.violations.push(violation);
    this.eventListeners.forEach(listener => listener(violation, this.violations.length));
  }

  private static notifyFullscreen(isFullscreen: boolean) {
    this.fullscreenListeners.forEach(listener => listener(isFullscreen));
  }

  private static recordViolation(
    type: ExamSecurityEventType,
    description: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'HIGH'
  ) {
    // Debounce duplicate blur + visibility events within 800ms
    const now = Date.now();
    if (now - this.lastViolationTime < 800) {
      return;
    }
    this.lastViolationTime = now;

    const violation: IntegrityViolationLogItem = {
      id: `viol-${now}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type,
      description,
      severity
    };

    this.notifyViolation(violation);
  }

  private static handleFullscreenChange = () => {
    const inFullscreen = ExamSecurityService.isFullscreen();
    ExamSecurityService.notifyFullscreen(inFullscreen);

    if (!inFullscreen && ExamSecurityService.isMonitoring) {
      ExamSecurityService.recordViolation(
        'FULLSCREEN_EXIT',
        'Candidate exited browser full-screen examination mode.',
        'HIGH'
      );
    }
  };

  private static handleVisibilityChange = () => {
    if (document.hidden && ExamSecurityService.isMonitoring) {
      ExamSecurityService.recordViolation(
        'TAB_SWITCH',
        'Candidate navigated away to another browser tab or minimized window.',
        'HIGH'
      );
    }
  };

  private static handleWindowBlur = () => {
    if (ExamSecurityService.isMonitoring) {
      ExamSecurityService.recordViolation(
        'WINDOW_BLUR',
        'Examination window lost application focus (split screen or external app interaction).',
        'MEDIUM'
      );
    }
  };

  private static handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (ExamSecurityService.isMonitoring) {
      ExamSecurityService.recordViolation(
        'NAVIGATION_ATTEMPT',
        'Candidate attempted to reload or navigate away from the active examination session.',
        'HIGH'
      );
      e.preventDefault();
      e.returnValue = 'An active proctored examination is in progress. Leaving will record an academic integrity violation.';
      return e.returnValue;
    }
  };

  private static handleKeyDown = (e: KeyboardEvent) => {
    if (!ExamSecurityService.isMonitoring) return;

    // Block F11 to prevent browser standard fullscreen override
    if (e.key === 'F11') {
      e.preventDefault();
    }
    // Flag attempts to open devtools (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
    if (
      e.key === 'F12' ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
      ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U'))
    ) {
      e.preventDefault();
      ExamSecurityService.recordViolation(
        'SHORTCUT_ATTEMPT',
        `Restricted shortcut combination (${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}) intercepted.`,
        'HIGH'
      );
    }
  };

  /**
   * Session state persistence & crash recovery
   */
  public static saveSession(session: ExamSessionState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage quota or disabled
    }
  }

  public static loadSession(): ExamSessionState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
  }

  public static getViolations(): IntegrityViolationLogItem[] {
    return [...this.violations];
  }
}
