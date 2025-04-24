/**
 * Manages the state for the current session.
 * This class is referenced by other components and needs to exist to resolve imports.
 */
export class SessionState {
  private sessionId: string;
  private startTime: Date;
  private isActiveSession: boolean = true;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
  }
  
  /**
   * Generates a new unique session ID.
   * @returns A unique session identifier
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  
  /**
   * Gets the current session ID.
   * @returns The session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
  
  /**
   * Gets the session start time.
   * @returns Date object representing when the session started
   */
  getStartTime(): Date {
    return new Date(this.startTime);
  }
  
  /**
   * Gets the session duration in milliseconds.
   * @returns Duration in milliseconds
   */
  getSessionDuration(): number {
    return Date.now() - this.startTime.getTime();
  }
  
  /**
   * Checks if the session is active.
   * @returns True if session is active
   */
  isActive(): boolean {
    return this.isActiveSession;
  }
  
  /**
   * Marks the session as inactive.
   */
  endSession(): void {
    this.isActiveSession = false;
  }
} 