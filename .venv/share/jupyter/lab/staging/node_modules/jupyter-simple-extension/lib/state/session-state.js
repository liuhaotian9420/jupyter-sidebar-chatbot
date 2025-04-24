"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionState = void 0;
/**
 * Manages the state for the current session.
 * This class is referenced by other components and needs to exist to resolve imports.
 */
class SessionState {
    constructor() {
        this.isActiveSession = true;
        this.sessionId = this.generateSessionId();
        this.startTime = new Date();
    }
    /**
     * Generates a new unique session ID.
     * @returns A unique session identifier
     */
    generateSessionId() {
        return `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    /**
     * Gets the current session ID.
     * @returns The session ID
     */
    getSessionId() {
        return this.sessionId;
    }
    /**
     * Gets the session start time.
     * @returns Date object representing when the session started
     */
    getStartTime() {
        return new Date(this.startTime);
    }
    /**
     * Gets the session duration in milliseconds.
     * @returns Duration in milliseconds
     */
    getSessionDuration() {
        return Date.now() - this.startTime.getTime();
    }
    /**
     * Checks if the session is active.
     * @returns True if session is active
     */
    isActive() {
        return this.isActiveSession;
    }
    /**
     * Marks the session as inactive.
     */
    endSession() {
        this.isActiveSession = false;
    }
}
exports.SessionState = SessionState;
