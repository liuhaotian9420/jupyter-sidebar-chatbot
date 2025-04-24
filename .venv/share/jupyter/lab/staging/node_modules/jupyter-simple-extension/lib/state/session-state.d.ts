/**
 * Manages the state for the current session.
 * This class is referenced by other components and needs to exist to resolve imports.
 */
export declare class SessionState {
    private sessionId;
    private startTime;
    private isActiveSession;
    constructor();
    /**
     * Generates a new unique session ID.
     * @returns A unique session identifier
     */
    private generateSessionId;
    /**
     * Gets the current session ID.
     * @returns The session ID
     */
    getSessionId(): string;
    /**
     * Gets the session start time.
     * @returns Date object representing when the session started
     */
    getStartTime(): Date;
    /**
     * Gets the session duration in milliseconds.
     * @returns Duration in milliseconds
     */
    getSessionDuration(): number;
    /**
     * Checks if the session is active.
     * @returns True if session is active
     */
    isActive(): boolean;
    /**
     * Marks the session as inactive.
     */
    endSession(): void;
}
