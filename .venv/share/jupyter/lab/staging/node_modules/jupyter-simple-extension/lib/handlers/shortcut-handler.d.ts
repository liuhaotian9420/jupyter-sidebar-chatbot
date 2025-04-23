import { PopupMenuManager } from './popup-menu-manager';
import { InputHandler } from './input-handler';
export interface ShortcutHandlerCallbacks {
    showIndicator: (text: string) => void;
    appendToInput: (text: string) => void;
    showWidget: () => void;
    focusInput: () => void;
}
/**
 * Sets up global keyboard shortcuts for the extension.
 *
 * @param inputHandler Instance of InputHandler to interact with input state/methods.
 * @param popupMenuManager Instance of PopupMenuManager.
 * @param callbacks Object containing callback functions for UI interactions.
 */
export declare function setupShortcuts(inputHandler: InputHandler, // Pass InputHandler instance directly
popupMenuManager: PopupMenuManager, callbacks: ShortcutHandlerCallbacks): void;
/**
 * Removes the global keyboard shortcut listener.
 */
export declare function removeShortcuts(): void;
