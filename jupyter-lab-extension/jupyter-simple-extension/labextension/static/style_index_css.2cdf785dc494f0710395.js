"use strict";
(self["webpackChunkjupyter_simple_extension"] = self["webpackChunkjupyter_simple_extension"] || []).push([["style_index_css"],{

/***/ "./node_modules/css-loader/dist/cjs.js!./style/index.css":
/*!***************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./style/index.css ***!
  \***************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* 
 * Styles for the JupyterLab AI Assistant extension
 */

.jp-llm-ext-icon {
  background-size: 16px;
  margin-right: 8px;
}

.jp-llm-ext-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
}

.jp-llm-ext-title-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border-bottom: 1px solid var(--jp-border-color2);
  background-color: var(--jp-layout-color1);
  height: 50px;
}

.jp-llm-ext-title-input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--jp-border-color1);
  border-radius: 4px;
  background-color: var(--jp-layout-color1);
  color: var(--jp-content-font-color1);
}

.jp-llm-ext-title-input:focus {
  outline: none;
  border-color: var(--jp-brand-color1);
  box-shadow: 0 0 0 1px var(--jp-brand-color1);
}

.jp-llm-ext-container h2 {
  margin-top: 0;
  color: var(--jp-ui-font-color1);
}

.jp-llm-ext-container p {
  color: var(--jp-ui-font-color2);
  margin-bottom: 20px;
}

.jp-llm-ext-button {
  width: 100%;
  padding: 8px;
  background-color: var(--jp-brand-color1);
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
}

.jp-llm-ext-button:hover {
  background-color: var(--jp-brand-color0);
}

/* Markdown styling */
.markdown-content {
  font-family: var(--jp-ui-font-family);
  line-height: 1.5;
}

.markdown-content h1, 
.markdown-content h2, 
.markdown-content h3, 
.markdown-content h4, 
.markdown-content h5, 
.markdown-content h6 {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
  color: var(--jp-ui-font-color0);
}

.markdown-content h1 {
  font-size: 1.5em;
  border-bottom: 1px solid var(--jp-border-color2);
  padding-bottom: 0.3em;
}

.markdown-content h2 {
  font-size: 1.3em;
}

.markdown-content h3 {
  font-size: 1.1em;
}

.markdown-content p {
  margin: 0.5em 0;
}

.markdown-content ul, 
.markdown-content ol {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-content li {
  margin: 0.25em 0;
}

.markdown-content a {
  color: var(--jp-content-link-color);
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content blockquote {
  padding-left: 1em;
  margin-left: 0;
  border-left: 3px solid var(--jp-border-color2);
  color: var(--jp-ui-font-color2);
}

.markdown-content pre {
  background-color: var(--jp-cell-editor-background);
  padding: 0.75em;
  border-radius: 3px;
  overflow-x: auto;
}

.markdown-content code {
  font-family: var(--jp-code-font-family);
  background-color: var(--jp-cell-editor-background);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.markdown-content pre code {
  padding: 0;
  background-color: transparent;
}

.markdown-content img {
  max-width: 100%;
}

/* Message container styles */
.jp-llm-ext-message-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 70px;
  scroll-behavior: smooth;
  background-color: var(--jp-layout-color1);
}

/* User message styles */
.jp-llm-ext-user-message {
  align-self: flex-end;
  max-width: 85%;
  padding: 12px 16px;
  background-color: var(--jp-brand-color1);
  color: white;
  border-radius: 16px 16px 4px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease;
  font-size: 14px;
  line-height: 1.5;
}

/* Bot message styles */
.jp-llm-ext-bot-message {
  align-self: flex-start;
  max-width: 85%;
  padding: 12px 16px;
  background-color: var(--jp-layout-color2);
  color: var(--jp-ui-font-color1);
  border-radius: 16px 16px 16px 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease;
  font-size: 14px;
  line-height: 1.5;
}

/* Message styling */
.jp-llm-ext-user-message, .jp-llm-ext-bot-message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

/* Markdown content styling */
.markdown-content {
  overflow-wrap: break-word;
  word-break: break-word;
}

/* Code block styling */
.streaming-content {
  font-family: var(--jp-code-font-family);
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
  background-color: var(--jp-layout-color0);
  padding: 8px;
}

.markdown-content pre {
  background-color: var(--jp-cell-editor-background);
  border-radius: 4px;
  margin: 8px 0;
  padding: 10px;
  overflow-x: auto;
}

.markdown-content code {
  font-family: var(--jp-code-font-family);
  background-color: var(--jp-cell-editor-background);
  padding: 2px 4px;
  border-radius: 3px;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  display: block;
}

/* Table styling */
.markdown-content table {
  border-collapse: collapse;
  margin: 10px 0;
  width: 100%;
}

.markdown-content th {
  background-color: var(--jp-layout-color2);
  border: 1px solid var(--jp-border-color2);
  padding: 5px 10px;
  text-align: left;
}

.markdown-content td {
  border: 1px solid var(--jp-border-color2);
  padding: 5px 10px;
  text-align: left;
}

/* Error message */
.error-message {
  color: var(--jp-error-color1);
  padding: 5px;
  font-weight: bold;
}

/* Popup Menu Styles */
.jp-llm-ext-popup-menu-container {
  position: absolute !important;
  z-index: 100000 !important; /* Highest z-index to ensure visibility */
  background-color: var(--jp-layout-color1);
  border: 1px solid var(--jp-border-color2);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
  width: 250px !important;
  max-height: 400px !important;
  overflow-y: auto;
}

.jp-llm-ext-popup-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid var(--jp-border-color1);
}

.jp-llm-ext-popup-menu-item:last-child {
  border-bottom: none;
}

.jp-llm-ext-popup-menu-item:hover {
  background-color: var(--jp-layout-color2);
}

.jp-llm-ext-popup-menu-path {
  padding: 8px 16px;
  font-size: 12px;
  color: var(--jp-ui-font-color2);
  background-color: var(--jp-layout-color2);
  border-bottom: 1px solid var(--jp-border-color2);
}

/* Keyboard shortcut visual indicator */
.keyboard-shortcut-indicator {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--jp-brand-color1);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 10000;
}

.jp-llm-ext-keyboard-shortcut-indicator.visible {
  opacity: 1;
}

/* Message action buttons */
.jp-llm-ext-message-actions {
  position: absolute;
  top: 5px;
  right: 30px; /* Positioned after the markdown indicator */
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 5;
}

.jp-llm-ext-bot-message:hover .jp-llm-ext-message-actions {
  opacity: 1;
}

.jp-llm-ext-message-action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background-color: var(--jp-layout-color2);
  color: var(--jp-ui-font-color2);
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.jp-llm-ext-message-action-button:hover {
  background-color: var(--jp-layout-color3);
  color: var(--jp-brand-color1);
}

.jp-llm-ext-message-action-button svg {
  width: 14px;
  height: 14px;
}

/* Input container styles */
.jp-llm-ext-input-area {
  padding: 10px;
  border-top: 1px solid var(--jp-border-color1);
}

.jp-llm-ext-input-container {
  padding: 16px;
  padding-bottom: 70px;
  background-color: var(--jp-layout-color1);
  border-top: 1px solid var(--jp-border-color2);
}

/* Input field styles */
.jp-llm-ext-input-field {
  width: 100%;
  min-height: 80px; /* Increased min height */
  max-height: 250px;
  padding: 12px 16px;
  border: 1px solid var(--jp-border-color2);
  border-radius: 10px;
  background-color: var(--jp-layout-color1);
  color: var(--jp-ui-font-color1);
  font-size: 14px;
  resize: vertical;
  transition: all 0.2s ease;
  line-height: 1.5;
  font-family: var(--jp-ui-font-family);
}

.jp-llm-ext-input-field:focus {
  outline: none;
  border-color: var(--jp-brand-color1);
  box-shadow: 0 0 0 1px var(--jp-brand-color1);
}

/* Control container styles */
.jp-llm-ext-controls-container {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  margin-bottom: 8px;
}

/* Toggle container styles */
.jp-llm-ext-toggle-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* Markdown toggle checkbox */
#markdown-toggle {
  margin-right: 5px;
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: var(--jp-brand-color1);
}

/* Markdown toggle label */
#markdown-toggle + label {
  font-size: 13px;
  color: var(--jp-ui-font-color2);
  cursor: pointer;
}

#markdown-toggle + label:hover {
  color: var(--jp-brand-color1);
}

/* Action buttons container - Closer to toggle */
.jp-llm-ext-action-buttons-container {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-left: 8px; /* Reduced margin */
  flex-shrink: 0;
}

/* Control buttons in the action-buttons-container */
.jp-Button.jp-llm-ext-action-button {
  min-width: 28px;
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 14px;
  background-color: var(--jp-layout-color2);
  color: var(--jp-ui-font-color1);
  border: 1px solid var(--jp-border-color2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.jp-llm-ext-action-buttons-container .jp-Button.jp-llm-ext-action-button:hover {
  background-color: var(--jp-layout-color3);
  color: var(--jp-brand-color1);
  border-color: var(--jp-brand-color1);
}

/* Fix for the @ button to make popup visible */
.jp-llm-ext-action-buttons-container .jp-Button.jp-llm-ext-action-button[title="Insert context (@)"] {
  position: relative;
}

/* Style for New Chat and History buttons in top-actions */
.jp-llm-ext-top-actions-container .jp-Button.jp-llm-ext-action-button {
  padding: 8px 20px;
  height: 36px;
  min-width: 80px;
  width: auto;
  flex: 1;
  background-color: var(--jp-brand-color1);
  color: white;
  border: none;
  border-radius: 8px;
}

.jp-llm-ext-top-actions-container .jp-Button.jp-llm-ext-action-button:hover {
  background-color: var(--jp-brand-color0);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* Send button */
.jp-Button.jp-llm-ext-send-button {
  padding: 8px 20px;
  background-color: var(--jp-brand-color1);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 36px;
  min-width: 80px;
}

/* Input area styles */
.jp-llm-ext-input-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--jp-border-color2);
  border-radius: 12px;
  background-color: var(--jp-layout-color2);
}

/* Input field */
.jp-llm-ext-input-field {
  width: 100%;
  min-height: 60px;
  max-height: 200px;
  padding: 12px 16px;
  border: 1px solid var(--jp-border-color2);
  border-radius: 10px;
  background-color: var(--jp-layout-color1);
  color: var(--jp-ui-font-color1);
  font-size: 14px;
  resize: none;
  transition: all 0.2s ease;
  line-height: 1.5;
  font-family: var(--jp-ui-font-family);
}

/* Input actions container */
/* .jp-llm-ext-input-actions-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 8px;
} */

/* Title container styles */
.title-container {
  padding: 10px;
  border-bottom: 1px solid var(--jp-border-color2);
  margin-bottom: 5px;
}

/* Chat title input - Improved look */
.chat-title-input {
  flex: 1;
  padding: 10px 14px;
  border: none;
  border-bottom: 1px solid var(--jp-border-color2);
  border-radius: 0;
  background-color: var(--jp-layout-color1);
  color: var(--jp-ui-font-color0);
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.chat-title-input:hover, .chat-title-input:focus {
  border-bottom-color: var(--jp-brand-color1);
  background-color: var(--jp-layout-color2);
  outline: none;
  box-shadow: none;
}

/* Top actions container - Same style as Send button */
.jp-llm-ext-top-actions-container {
  padding: 0;
  margin: 0;
  border-bottom: none;
  height: auto;
}

/* All main buttons should look the same */
.jp-llm-ext-action-button,
.jp-llm-ext-send-button,
.jp-Button.jp-llm-ext-action-button {
  padding: 8px 20px;
  background-color: var(--jp-brand-color1);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 32px;
  flex: 1;
}

.jp-llm-ext-action-button:hover,
.jp-llm-ext-send-button:hover,
.jp-Button.jp-llm-ext-action-button:hover {
  background-color: var(--jp-brand-color0);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* History container */
.history-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
}

/* History item */
.jp-llm-ext-history-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 5px;
  cursor: pointer;
  background-color: var(--jp-layout-color1);
  border: 1px solid var(--jp-border-color2);
  transition: all 0.2s ease;
}

.jp-llm-ext-history-item:hover {
  background-color: var(--jp-layout-color2);
}

.jp-llm-ext-history-item.active {
  border-left: 3px solid var(--jp-brand-color1);
}

/* History title */
.jp-llm-ext-history-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--jp-ui-font-color0);
}

/* History preview */
.jp-llm-ext-history-preview {
  font-size: 0.9em;
  color: var(--jp-ui-font-color2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Empty history message */
.empty-history-message {
  text-align: center;
  padding: 20px;
  color: var(--jp-ui-font-color2);
  font-style: italic;
}

/* Add any additional css rules here */

/* Chat message containers */
.jp-llm-ext-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.jp-llm-ext-input-area {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-top: 1px solid var(--jp-border-color1);
}

/* Modern Chatbot Interface Styles */

/* Main sidebar container */
.jp-llm-ext-sidebar {
  background-color: var(--jp-layout-color1);
  height: 100%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--jp-border-color2);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Content wrapper */
.jp-llm-ext-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  gap: 0;
}

/* Top bar with title and actions */
.jp-llm-ext-title-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--jp-border-color2);
  background-color: var(--jp-layout-color1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.chat-title-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--jp-border-color2);
  border-radius: 8px;
  background-color: var(--jp-layout-color1);
  color: var(--jp-ui-font-color1);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.chat-title-input:hover, .chat-title-input:focus {
  border-color: var(--jp-brand-color1);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--jp-brand-color1-rgb), 0.1);
}

/* Input container */
.jp-llm-ext-input-container {
  padding: 16px;
  background-color: var(--jp-layout-color1);
  border-top: 1px solid var(--jp-border-color2);
  position: sticky;
  bottom: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.jp-llm-ext-input-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--jp-border-color2);
  border-radius: 12px;
  background-color: var(--jp-layout-color2);
}

.jp-llm-ext-input-field {
  width: 100%;
  min-height: 60px;
  max-height: 200px;
  padding: 12px 16px;
  border: 1px solid var(--jp-border-color2);
  border-radius: 10px;
  background-color: var(--jp-layout-color1);
  color: var(--jp-ui-font-color1);
  font-size: 14px;
  resize: none;
  transition: all 0.2s ease;
  line-height: 1.5;
  font-family: var(--jp-ui-font-family);
}

.jp-llm-ext-input-field:focus {
  border-color: var(--jp-brand-color1);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--jp-brand-color1-rgb), 0.1);
}

/* Controls container */
.jp-llm-ext-controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  margin-top: 8px;
}

.jp-llm-ext-toggles-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Markdown toggle */
.jp-llm-ext-markdown-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--jp-ui-font-color2);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
  background-color: transparent;
  border: none;
}

.jp-llm-ext-markdown-toggle:hover {
  background-color: rgba(var(--jp-brand-color1-rgb), 0.1);
  color: var(--jp-brand-color1);
}

.jp-llm-ext-markdown-toggle svg {
  width: 16px;
  height: 16px;
}

.jp-llm-ext-markdown-toggle.active {
  color: var(--jp-brand-color1);
  background-color: rgba(var(--jp-brand-color1-rgb), 0.1);
}

/* Send button */
.jp-llm-ext-send-button {
  padding: 8px 20px;
  background-color: var(--jp-brand-color1);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 32px;
  min-width: 80px;
}

.jp-llm-ext-send-button:hover {
  background-color: var(--jp-brand-color0);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.jp-llm-ext-send-button svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.jp-llm-ext-send-button:disabled {
  background-color: var(--jp-layout-color3);
  color: var(--jp-ui-font-color2);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* History container */
.jp-llm-ext-history-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--jp-layout-color1);
}

.jp-llm-ext-history-item {
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  background-color: var(--jp-layout-color2);
  border: 1px solid var(--jp-border-color2);
  transition: all 0.2s ease;
}

.jp-llm-ext-history-item:hover {
  background-color: var(--jp-layout-color3);
  border-color: var(--jp-brand-color1);
}

.jp-llm-ext-history-item.active {
  background-color: var(--jp-brand-color1);
  color: white;
  border-color: var(--jp-brand-color1);
}

.jp-llm-ext-history-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--jp-ui-font-color1);
}

.jp-llm-ext-history-preview {
  font-size: 13px;
  color: var(--jp-ui-font-color2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Keyboard shortcut indicator */
.jp-llm-ext-keyboard-shortcut-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--jp-brand-color1);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.jp-llm-ext-keyboard-shortcut-indicator.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Settings modal */
.jp-llm-ext-settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.jp-llm-ext-settings-content {
  background-color: var(--jp-layout-color1);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

.jp-llm-ext-settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.jp-llm-ext-settings-label {
  display: block;
  margin-bottom: 4px;
  color: var(--jp-ui-font-color1);
  font-size: 14px;
  font-weight: 500;
}

.jp-llm-ext-settings-input,
.jp-llm-ext-settings-select,
.jp-llm-ext-settings-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--jp-border-color2);
  border-radius: 8px;
  background-color: var(--jp-layout-color1);
  color: var(--jp-ui-font-color1);
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.jp-llm-ext-settings-input:focus,
.jp-llm-ext-settings-select:focus,
.jp-llm-ext-settings-textarea:focus {
  border-color: var(--jp-brand-color1);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--jp-brand-color1-rgb), 0.1);
}

.jp-llm-ext-settings-textarea {
  min-height: 100px;
  resize: vertical;
}

.jp-llm-ext-settings-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

.jp-llm-ext-settings-button {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.jp-llm-ext-settings-save-button {
  background-color: var(--jp-brand-color1);
  color: white;
  border: none;
}

.jp-llm-ext-settings-save-button:hover {
  background-color: var(--jp-brand-color0);
  transform: translateY(-1px);
}

.jp-llm-ext-settings-cancel-button {
  background-color: var(--jp-layout-color2);
  color: var(--jp-ui-font-color1);
  border: 1px solid var(--jp-border-color2);
}

.jp-llm-ext-settings-cancel-button:hover {
  background-color: var(--jp-layout-color3);
  transform: translateY(-1px);
}

/* Markdown indicator */
.markdown-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: var(--jp-brand-color2);
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0.8;
  z-index: 5;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Bottom actions container */
.jp-llm-ext-bottom-actions-container {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: var(--jp-layout-color1);
  position: sticky;
  bottom: 0;
  border-top: 1px solid var(--jp-border-color2);
  z-index: 100;
}

/* New Chat and History button styles (match Send button) */
.jp-Button.jp-llm-ext-action-button {
  padding: 8px 20px;
  background-color: var(--jp-brand-color1);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 32px;
}

.jp-Button.jp-llm-ext-action-button:hover {
  background-color: var(--jp-brand-color0);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* Fixed position toolbar at bottom */
.jp-llm-ext-fixed-bottom-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--jp-layout-color1);
  border-top: 1px solid var(--jp-border-color2);
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

/* Bottom fixed toolbar for all main buttons */
.jp-llm-ext-bottom-toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background-color: var(--jp-layout-color1);
  border-top: 1px solid var(--jp-border-color2);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 10000;
}

/* All main buttons in the bottom toolbar */
.jp-llm-ext-bottom-toolbar .jp-Button {
  padding: 8px 20px;
  background-color: var(--jp-brand-color1);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 36px;
  flex: 1;
  min-width: 80px;
}

.jp-llm-ext-bottom-toolbar .jp-Button:hover {
  background-color: var(--jp-brand-color0);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* Create spacing at bottom of message container for fixed toolbar */
.jp-llm-ext-message-container {
  padding-bottom: 70px !important;
}

/* Create spacing at bottom of input container for fixed toolbar */
.jp-llm-ext-input-container {
  padding-bottom: 70px !important;
}

/* Move the top actions container to the bottom */
.jp-llm-ext-top-actions-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  background-color: var(--jp-layout-color1);
  border-top: 1px solid var(--jp-border-color2);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
}

/* New Bottom Bar Styling */
.jp-llm-ext-bottom-bar-container {
  display: flex;
  align-items: flex-end; /* Align items to the bottom */
  padding: 8px 12px;
  border-top: 1px solid var(--jp-border-color2);
  background-color: var(--jp-layout-color1);
  gap: 8px; /* Space between input area and buttons */
}

/* Input Area Container within the Bottom Bar */
.jp-llm-ext-input-area-container {
  flex-grow: 1; /* Allow input area to take available space */
  display: flex;
  flex-direction: column; /* Stack controls above input field */
  /* Removed fixed height/borders previously here, handled by children/container */
}

/* Input field specific adjustments within the bottom bar */
.jp-llm-ext-input-area-container .jp-llm-ext-input-field {
  width: 100%; /* Take full width of its container */
  resize: none; /* Disable manual resize */
  border: 1px solid var(--jp-border-color1);
  border-radius: 3px;
  padding: 5px;
  margin-top: 4px; /* Space between controls and input */
  min-height: 30px; /* Minimum height for one line */
  max-height: 150px; /* Max height before scrolling */
  overflow-y: auto; /* Allow scrolling if content exceeds max-height */
  line-height: 1.4;
}

/* Controls container (Markdown, @ etc.) adjustment */
.jp-llm-ext-controls-container {
  display: flex;
  justify-content: space-between; /* Space out toggle and action buttons */
  align-items: center;
  width: 100%;
}

/* Send button container adjustment */
.jp-llm-ext-input-actions-container {
  margin-left: 8px; /* Space between input field and send button */
  display: flex;
  align-items: center; /* Vertically center send button if input grows */
}

/* Adjustments for buttons in the bottom bar */
.jp-llm-ext-bottom-bar-container > .jp-Button {
  flex-shrink: 0; /* Prevent buttons from shrinking */
  /* Align with the bottom of the input field, requires align-items: flex-end on parent */
  margin-bottom: 5px; /* Align baseline with input text */ 
}

/* Ensure action buttons inside controls container are spaced */
.jp-llm-ext-action-buttons-container {
  display: flex;
  gap: 4px;
}

/* Style adjustments for toggle label and checkbox */
.jp-llm-ext-toggle-container label {
  font-size: 12px;
  color: var(--jp-ui-font-color2);
  margin-left: 4px;
  cursor: pointer;
}

.jp-llm-ext-toggle-container input[type="checkbox"] {
  cursor: pointer;
  vertical-align: middle;
}`, "",{"version":3,"sources":["webpack://./style/index.css"],"names":[],"mappings":"AAAA;;EAEE;;AAEF;EACE,qBAAqB;EACrB,iBAAiB;AACnB;;AAEA;EACE,aAAa;EACb,sBAAsB;EACtB,YAAY;EACZ,aAAa;AACf;;AAEA;EACE,aAAa;EACb,mBAAmB;EACnB,QAAQ;EACR,eAAe;EACf,gDAAgD;EAChD,yCAAyC;EACzC,YAAY;AACd;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,yCAAyC;EACzC,kBAAkB;EAClB,yCAAyC;EACzC,oCAAoC;AACtC;;AAEA;EACE,aAAa;EACb,oCAAoC;EACpC,4CAA4C;AAC9C;;AAEA;EACE,aAAa;EACb,+BAA+B;AACjC;;AAEA;EACE,+BAA+B;EAC/B,mBAAmB;AACrB;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,wCAAwC;EACxC,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,eAAe;AACjB;;AAEA;EACE,wCAAwC;AAC1C;;AAEA,qBAAqB;AACrB;EACE,qCAAqC;EACrC,gBAAgB;AAClB;;AAEA;;;;;;EAME,eAAe;EACf,oBAAoB;EACpB,iBAAiB;EACjB,+BAA+B;AACjC;;AAEA;EACE,gBAAgB;EAChB,gDAAgD;EAChD,qBAAqB;AACvB;;AAEA;EACE,gBAAgB;AAClB;;AAEA;EACE,gBAAgB;AAClB;;AAEA;EACE,eAAe;AACjB;;AAEA;;EAEE,eAAe;EACf,mBAAmB;AACrB;;AAEA;EACE,gBAAgB;AAClB;;AAEA;EACE,mCAAmC;EACnC,qBAAqB;AACvB;;AAEA;EACE,0BAA0B;AAC5B;;AAEA;EACE,iBAAiB;EACjB,cAAc;EACd,8CAA8C;EAC9C,+BAA+B;AACjC;;AAEA;EACE,kDAAkD;EAClD,eAAe;EACf,kBAAkB;EAClB,gBAAgB;AAClB;;AAEA;EACE,uCAAuC;EACvC,kDAAkD;EAClD,oBAAoB;EACpB,kBAAkB;EAClB,gBAAgB;AAClB;;AAEA;EACE,UAAU;EACV,6BAA6B;AAC/B;;AAEA;EACE,eAAe;AACjB;;AAEA,6BAA6B;AAC7B;EACE,OAAO;EACP,gBAAgB;EAChB,aAAa;EACb,aAAa;EACb,sBAAsB;EACtB,SAAS;EACT,oBAAoB;EACpB,uBAAuB;EACvB,yCAAyC;AAC3C;;AAEA,wBAAwB;AACxB;EACE,oBAAoB;EACpB,cAAc;EACd,kBAAkB;EAClB,wCAAwC;EACxC,YAAY;EACZ,iCAAiC;EACjC,wCAAwC;EACxC,2BAA2B;EAC3B,eAAe;EACf,gBAAgB;AAClB;;AAEA,uBAAuB;AACvB;EACE,sBAAsB;EACtB,cAAc;EACd,kBAAkB;EAClB,yCAAyC;EACzC,+BAA+B;EAC/B,iCAAiC;EACjC,wCAAwC;EACxC,2BAA2B;EAC3B,eAAe;EACf,gBAAgB;AAClB;;AAEA,oBAAoB;AACpB;EACE,mBAAmB;EACnB,aAAa;EACb,kBAAkB;EAClB,kBAAkB;EAClB,gBAAgB;AAClB;;AAEA,6BAA6B;AAC7B;EACE,yBAAyB;EACzB,sBAAsB;AACxB;;AAEA,uBAAuB;AACvB;EACE,uCAAuC;EACvC,qBAAqB;EACrB,yBAAyB;EACzB,sBAAsB;EACtB,yCAAyC;EACzC,YAAY;AACd;;AAEA;EACE,kDAAkD;EAClD,kBAAkB;EAClB,aAAa;EACb,aAAa;EACb,gBAAgB;AAClB;;AAEA;EACE,uCAAuC;EACvC,kDAAkD;EAClD,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA;EACE,6BAA6B;EAC7B,UAAU;EACV,cAAc;AAChB;;AAEA,kBAAkB;AAClB;EACE,yBAAyB;EACzB,cAAc;EACd,WAAW;AACb;;AAEA;EACE,yCAAyC;EACzC,yCAAyC;EACzC,iBAAiB;EACjB,gBAAgB;AAClB;;AAEA;EACE,yCAAyC;EACzC,iBAAiB;EACjB,gBAAgB;AAClB;;AAEA,kBAAkB;AAClB;EACE,6BAA6B;EAC7B,YAAY;EACZ,iBAAiB;AACnB;;AAEA,sBAAsB;AACtB;EACE,6BAA6B;EAC7B,0BAA0B,EAAE,yCAAyC;EACrE,yCAAyC;EACzC,yCAAyC;EACzC,kBAAkB;EAClB,oDAAoD;EACpD,uBAAuB;EACvB,4BAA4B;EAC5B,gBAAgB;AAClB;;AAEA;EACE,iBAAiB;EACjB,eAAe;EACf,yBAAyB;EACzB,aAAa;EACb,sBAAsB;EACtB,QAAQ;EACR,gDAAgD;AAClD;;AAEA;EACE,mBAAmB;AACrB;;AAEA;EACE,yCAAyC;AAC3C;;AAEA;EACE,iBAAiB;EACjB,eAAe;EACf,+BAA+B;EAC/B,yCAAyC;EACzC,gDAAgD;AAClD;;AAEA,uCAAuC;AACvC;EACE,eAAe;EACf,QAAQ;EACR,SAAS;EACT,gCAAgC;EAChC,wCAAwC;EACxC,YAAY;EACZ,iBAAiB;EACjB,kBAAkB;EAClB,eAAe;EACf,UAAU;EACV,6BAA6B;EAC7B,oBAAoB;EACpB,cAAc;AAChB;;AAEA;EACE,UAAU;AACZ;;AAEA,2BAA2B;AAC3B;EACE,kBAAkB;EAClB,QAAQ;EACR,WAAW,EAAE,4CAA4C;EACzD,aAAa;EACb,QAAQ;EACR,UAAU;EACV,6BAA6B;EAC7B,UAAU;AACZ;;AAEA;EACE,UAAU;AACZ;;AAEA;EACE,aAAa;EACb,mBAAmB;EACnB,uBAAuB;EACvB,WAAW;EACX,YAAY;EACZ,UAAU;EACV,YAAY;EACZ,yCAAyC;EACzC,+BAA+B;EAC/B,kBAAkB;EAClB,yBAAyB;EACzB,eAAe;AACjB;;AAEA;EACE,yCAAyC;EACzC,6BAA6B;AAC/B;;AAEA;EACE,WAAW;EACX,YAAY;AACd;;AAEA,2BAA2B;AAC3B;EACE,aAAa;EACb,6CAA6C;AAC/C;;AAEA;EACE,aAAa;EACb,oBAAoB;EACpB,yCAAyC;EACzC,6CAA6C;AAC/C;;AAEA,uBAAuB;AACvB;EACE,WAAW;EACX,gBAAgB,EAAE,yBAAyB;EAC3C,iBAAiB;EACjB,kBAAkB;EAClB,yCAAyC;EACzC,mBAAmB;EACnB,yCAAyC;EACzC,+BAA+B;EAC/B,eAAe;EACf,gBAAgB;EAChB,yBAAyB;EACzB,gBAAgB;EAChB,qCAAqC;AACvC;;AAEA;EACE,aAAa;EACb,oCAAoC;EACpC,4CAA4C;AAC9C;;AAEA,6BAA6B;AAC7B;EACE,aAAa;EACb,mBAAmB;EACnB,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA,4BAA4B;AAC5B;EACE,aAAa;EACb,mBAAmB;EACnB,cAAc;AAChB;;AAEA,6BAA6B;AAC7B;EACE,iBAAiB;EACjB,eAAe;EACf,WAAW;EACX,YAAY;EACZ,oCAAoC;AACtC;;AAEA,0BAA0B;AAC1B;EACE,eAAe;EACf,+BAA+B;EAC/B,eAAe;AACjB;;AAEA;EACE,6BAA6B;AAC/B;;AAEA,gDAAgD;AAChD;EACE,aAAa;EACb,QAAQ;EACR,mBAAmB;EACnB,gBAAgB,EAAE,mBAAmB;EACrC,cAAc;AAChB;;AAEA,oDAAoD;AACpD;EACE,eAAe;EACf,WAAW;EACX,YAAY;EACZ,UAAU;EACV,oBAAoB;EACpB,mBAAmB;EACnB,uBAAuB;EACvB,kBAAkB;EAClB,eAAe;EACf,yCAAyC;EACzC,+BAA+B;EAC/B,yCAAyC;EACzC,eAAe;EACf,yBAAyB;AAC3B;;AAEA;EACE,yCAAyC;EACzC,6BAA6B;EAC7B,oCAAoC;AACtC;;AAEA,+CAA+C;AAC/C;EACE,kBAAkB;AACpB;;AAEA,0DAA0D;AAC1D;EACE,iBAAiB;EACjB,YAAY;EACZ,eAAe;EACf,WAAW;EACX,OAAO;EACP,wCAAwC;EACxC,YAAY;EACZ,YAAY;EACZ,kBAAkB;AACpB;;AAEA;EACE,wCAAwC;EACxC,2BAA2B;EAC3B,yCAAyC;AAC3C;;AAEA,gBAAgB;AAChB;EACE,iBAAiB;EACjB,wCAAwC;EACxC,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,eAAe;EACf,yBAAyB;EACzB,eAAe;EACf,gBAAgB;EAChB,aAAa;EACb,mBAAmB;EACnB,uBAAuB;EACvB,QAAQ;EACR,wCAAwC;EACxC,YAAY;EACZ,eAAe;AACjB;;AAEA,sBAAsB;AACtB;EACE,aAAa;EACb,sBAAsB;EACtB,QAAQ;EACR,aAAa;EACb,yCAAyC;EACzC,mBAAmB;EACnB,yCAAyC;AAC3C;;AAEA,gBAAgB;AAChB;EACE,WAAW;EACX,gBAAgB;EAChB,iBAAiB;EACjB,kBAAkB;EAClB,yCAAyC;EACzC,mBAAmB;EACnB,yCAAyC;EACzC,+BAA+B;EAC/B,eAAe;EACf,YAAY;EACZ,yBAAyB;EACzB,gBAAgB;EAChB,qCAAqC;AACvC;;AAEA,4BAA4B;AAC5B;;;;;GAKG;;AAEH,2BAA2B;AAC3B;EACE,aAAa;EACb,gDAAgD;EAChD,kBAAkB;AACpB;;AAEA,qCAAqC;AACrC;EACE,OAAO;EACP,kBAAkB;EAClB,YAAY;EACZ,gDAAgD;EAChD,gBAAgB;EAChB,yCAAyC;EACzC,+BAA+B;EAC/B,eAAe;EACf,gBAAgB;EAChB,yBAAyB;AAC3B;;AAEA;EACE,2CAA2C;EAC3C,yCAAyC;EACzC,aAAa;EACb,gBAAgB;AAClB;;AAEA,sDAAsD;AACtD;EACE,UAAU;EACV,SAAS;EACT,mBAAmB;EACnB,YAAY;AACd;;AAEA,0CAA0C;AAC1C;;;EAGE,iBAAiB;EACjB,wCAAwC;EACxC,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,eAAe;EACf,yBAAyB;EACzB,eAAe;EACf,gBAAgB;EAChB,aAAa;EACb,mBAAmB;EACnB,uBAAuB;EACvB,QAAQ;EACR,wCAAwC;EACxC,YAAY;EACZ,OAAO;AACT;;AAEA;;;EAGE,wCAAwC;EACxC,2BAA2B;EAC3B,yCAAyC;AAC3C;;AAEA,sBAAsB;AACtB;EACE,YAAY;EACZ,gBAAgB;EAChB,aAAa;AACf;;AAEA,iBAAiB;AACjB;EACE,iBAAiB;EACjB,kBAAkB;EAClB,kBAAkB;EAClB,eAAe;EACf,yCAAyC;EACzC,yCAAyC;EACzC,yBAAyB;AAC3B;;AAEA;EACE,yCAAyC;AAC3C;;AAEA;EACE,6CAA6C;AAC/C;;AAEA,kBAAkB;AAClB;EACE,iBAAiB;EACjB,kBAAkB;EAClB,+BAA+B;AACjC;;AAEA,oBAAoB;AACpB;EACE,gBAAgB;EAChB,+BAA+B;EAC/B,mBAAmB;EACnB,gBAAgB;EAChB,uBAAuB;AACzB;;AAEA,0BAA0B;AAC1B;EACE,kBAAkB;EAClB,aAAa;EACb,+BAA+B;EAC/B,kBAAkB;AACpB;;AAEA,sCAAsC;;AAEtC,4BAA4B;AAC5B;EACE,aAAa;EACb,sBAAsB;EACtB,YAAY;EACZ,gBAAgB;AAClB;;AAEA;EACE,aAAa;EACb,sBAAsB;EACtB,aAAa;EACb,6CAA6C;AAC/C;;AAEA,oCAAoC;;AAEpC,2BAA2B;AAC3B;EACE,yCAAyC;EACzC,YAAY;EACZ,aAAa;EACb,sBAAsB;EACtB,8CAA8C;EAC9C,wIAAwI;AAC1I;;AAEA,oBAAoB;AACpB;EACE,aAAa;EACb,sBAAsB;EACtB,YAAY;EACZ,UAAU;EACV,MAAM;AACR;;AAEA,mCAAmC;AACnC;EACE,aAAa;EACb,mBAAmB;EACnB,QAAQ;EACR,kBAAkB;EAClB,gDAAgD;EAChD,yCAAyC;EACzC,gBAAgB;EAChB,MAAM;EACN,WAAW;AACb;;AAEA;EACE,OAAO;EACP,iBAAiB;EACjB,yCAAyC;EACzC,kBAAkB;EAClB,yCAAyC;EACzC,+BAA+B;EAC/B,eAAe;EACf,gBAAgB;EAChB,yBAAyB;AAC3B;;AAEA;EACE,oCAAoC;EACpC,aAAa;EACb,2DAA2D;AAC7D;;AAEA,oBAAoB;AACpB;EACE,aAAa;EACb,yCAAyC;EACzC,6CAA6C;EAC7C,gBAAgB;EAChB,SAAS;EACT,2CAA2C;AAC7C;;AAEA;EACE,aAAa;EACb,sBAAsB;EACtB,QAAQ;EACR,aAAa;EACb,yCAAyC;EACzC,mBAAmB;EACnB,yCAAyC;AAC3C;;AAEA;EACE,WAAW;EACX,gBAAgB;EAChB,iBAAiB;EACjB,kBAAkB;EAClB,yCAAyC;EACzC,mBAAmB;EACnB,yCAAyC;EACzC,+BAA+B;EAC/B,eAAe;EACf,YAAY;EACZ,yBAAyB;EACzB,gBAAgB;EAChB,qCAAqC;AACvC;;AAEA;EACE,oCAAoC;EACpC,aAAa;EACb,2DAA2D;AAC7D;;AAEA,uBAAuB;AACvB;EACE,aAAa;EACb,8BAA8B;EAC9B,mBAAmB;EACnB,gBAAgB;EAChB,eAAe;AACjB;;AAEA;EACE,aAAa;EACb,mBAAmB;EACnB,SAAS;AACX;;AAEA,oBAAoB;AACpB;EACE,aAAa;EACb,mBAAmB;EACnB,QAAQ;EACR,eAAe;EACf,+BAA+B;EAC/B,eAAe;EACf,iBAAiB;EACjB,kBAAkB;EAClB,yBAAyB;EACzB,6BAA6B;EAC7B,YAAY;AACd;;AAEA;EACE,uDAAuD;EACvD,6BAA6B;AAC/B;;AAEA;EACE,WAAW;EACX,YAAY;AACd;;AAEA;EACE,6BAA6B;EAC7B,uDAAuD;AACzD;;AAEA,gBAAgB;AAChB;EACE,iBAAiB;EACjB,wCAAwC;EACxC,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,eAAe;EACf,yBAAyB;EACzB,eAAe;EACf,gBAAgB;EAChB,aAAa;EACb,mBAAmB;EACnB,uBAAuB;EACvB,QAAQ;EACR,wCAAwC;EACxC,YAAY;EACZ,eAAe;AACjB;;AAEA;EACE,wCAAwC;EACxC,2BAA2B;EAC3B,yCAAyC;AAC3C;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,cAAc;AAChB;;AAEA;EACE,yCAAyC;EACzC,+BAA+B;EAC/B,mBAAmB;EACnB,gBAAgB;EAChB,eAAe;AACjB;;AAEA,sBAAsB;AACtB;EACE,OAAO;EACP,gBAAgB;EAChB,aAAa;EACb,yCAAyC;AAC3C;;AAEA;EACE,kBAAkB;EAClB,kBAAkB;EAClB,kBAAkB;EAClB,eAAe;EACf,yCAAyC;EACzC,yCAAyC;EACzC,yBAAyB;AAC3B;;AAEA;EACE,yCAAyC;EACzC,oCAAoC;AACtC;;AAEA;EACE,wCAAwC;EACxC,YAAY;EACZ,oCAAoC;AACtC;;AAEA;EACE,gBAAgB;EAChB,kBAAkB;EAClB,+BAA+B;AACjC;;AAEA;EACE,eAAe;EACf,+BAA+B;EAC/B,mBAAmB;EACnB,gBAAgB;EAChB,uBAAuB;AACzB;;AAEA,eAAe;AACf;EACE,OAAO,UAAU,EAAE,2BAA2B,EAAE;EAChD,KAAK,UAAU,EAAE,wBAAwB,EAAE;AAC7C;;AAEA;EACE,OAAO,UAAU,EAAE,4BAA4B,EAAE;EACjD,KAAK,UAAU,EAAE,wBAAwB,EAAE;AAC7C;;AAEA,gCAAgC;AAChC;EACE,eAAe;EACf,YAAY;EACZ,WAAW;EACX,wCAAwC;EACxC,YAAY;EACZ,iBAAiB;EACjB,kBAAkB;EAClB,eAAe;EACf,gBAAgB;EAChB,UAAU;EACV,2BAA2B;EAC3B,yBAAyB;EACzB,oBAAoB;EACpB,yCAAyC;AAC3C;;AAEA;EACE,UAAU;EACV,wBAAwB;AAC1B;;AAEA,mBAAmB;AACnB;EACE,eAAe;EACf,MAAM;EACN,OAAO;EACP,QAAQ;EACR,SAAS;EACT,oCAAoC;EACpC,aAAa;EACb,mBAAmB;EACnB,uBAAuB;EACvB,cAAc;EACd,0BAA0B;AAC5B;;AAEA;EACE,yCAAyC;EACzC,mBAAmB;EACnB,aAAa;EACb,UAAU;EACV,gBAAgB;EAChB,gBAAgB;EAChB,gBAAgB;EAChB,yCAAyC;EACzC,4BAA4B;AAC9B;;AAEA;EACE,aAAa;EACb,sBAAsB;EACtB,SAAS;AACX;;AAEA;EACE,cAAc;EACd,kBAAkB;EAClB,+BAA+B;EAC/B,eAAe;EACf,gBAAgB;AAClB;;AAEA;;;EAGE,WAAW;EACX,aAAa;EACb,yCAAyC;EACzC,kBAAkB;EAClB,yCAAyC;EACzC,+BAA+B;EAC/B,eAAe;EACf,yBAAyB;EACzB,sBAAsB;AACxB;;AAEA;;;EAGE,oCAAoC;EACpC,aAAa;EACb,2DAA2D;AAC7D;;AAEA;EACE,iBAAiB;EACjB,gBAAgB;AAClB;;AAEA;EACE,aAAa;EACb,yBAAyB;EACzB,QAAQ;EACR,gBAAgB;AAClB;;AAEA;EACE,iBAAiB;EACjB,kBAAkB;EAClB,eAAe;EACf,gBAAgB;EAChB,eAAe;EACf,yBAAyB;AAC3B;;AAEA;EACE,wCAAwC;EACxC,YAAY;EACZ,YAAY;AACd;;AAEA;EACE,wCAAwC;EACxC,2BAA2B;AAC7B;;AAEA;EACE,yCAAyC;EACzC,+BAA+B;EAC/B,yCAAyC;AAC3C;;AAEA;EACE,yCAAyC;EACzC,2BAA2B;AAC7B;;AAEA,uBAAuB;AACvB;EACE,kBAAkB;EAClB,QAAQ;EACR,UAAU;EACV,wCAAwC;EACxC,YAAY;EACZ,eAAe;EACf,gBAAgB;EAChB,kBAAkB;EAClB,YAAY;EACZ,UAAU;AACZ;;AAEA;EACE,OAAO,UAAU,EAAE,2BAA2B,EAAE;EAChD,KAAK,UAAU,EAAE,wBAAwB,EAAE;AAC7C;;AAEA,6BAA6B;AAC7B;EACE,aAAa;EACb,SAAS;EACT,aAAa;EACb,yCAAyC;EACzC,gBAAgB;EAChB,SAAS;EACT,6CAA6C;EAC7C,YAAY;AACd;;AAEA,2DAA2D;AAC3D;EACE,iBAAiB;EACjB,wCAAwC;EACxC,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,eAAe;EACf,yBAAyB;EACzB,eAAe;EACf,gBAAgB;EAChB,aAAa;EACb,mBAAmB;EACnB,uBAAuB;EACvB,QAAQ;EACR,wCAAwC;EACxC,YAAY;AACd;;AAEA;EACE,wCAAwC;EACxC,2BAA2B;EAC3B,yCAAyC;AAC3C;;AAEA,qCAAqC;AACrC;EACE,eAAe;EACf,SAAS;EACT,OAAO;EACP,QAAQ;EACR,yCAAyC;EACzC,6CAA6C;EAC7C,kBAAkB;EAClB,aAAa;EACb,SAAS;EACT,aAAa;EACb,2CAA2C;AAC7C;;AAEA,8CAA8C;AAC9C;EACE,eAAe;EACf,OAAO;EACP,QAAQ;EACR,SAAS;EACT,aAAa;EACb,SAAS;EACT,kBAAkB;EAClB,yCAAyC;EACzC,6CAA6C;EAC7C,2CAA2C;EAC3C,cAAc;AAChB;;AAEA,2CAA2C;AAC3C;EACE,iBAAiB;EACjB,wCAAwC;EACxC,YAAY;EACZ,YAAY;EACZ,kBAAkB;EAClB,eAAe;EACf,yBAAyB;EACzB,eAAe;EACf,gBAAgB;EAChB,aAAa;EACb,mBAAmB;EACnB,uBAAuB;EACvB,QAAQ;EACR,wCAAwC;EACxC,YAAY;EACZ,OAAO;EACP,eAAe;AACjB;;AAEA;EACE,wCAAwC;EACxC,2BAA2B;EAC3B,yCAAyC;AAC3C;;AAEA,oEAAoE;AACpE;EACE,+BAA+B;AACjC;;AAEA,kEAAkE;AAClE;EACE,+BAA+B;AACjC;;AAEA,iDAAiD;AACjD;EACE,eAAe;EACf,SAAS;EACT,OAAO;EACP,QAAQ;EACR,cAAc;EACd,yCAAyC;EACzC,6CAA6C;EAC7C,2CAA2C;EAC3C,kBAAkB;AACpB;;AAEA,2BAA2B;AAC3B;EACE,aAAa;EACb,qBAAqB,EAAE,8BAA8B;EACrD,iBAAiB;EACjB,6CAA6C;EAC7C,yCAAyC;EACzC,QAAQ,EAAE,yCAAyC;AACrD;;AAEA,+CAA+C;AAC/C;EACE,YAAY,EAAE,6CAA6C;EAC3D,aAAa;EACb,sBAAsB,EAAE,qCAAqC;EAC7D,gFAAgF;AAClF;;AAEA,2DAA2D;AAC3D;EACE,WAAW,EAAE,qCAAqC;EAClD,YAAY,EAAE,0BAA0B;EACxC,yCAAyC;EACzC,kBAAkB;EAClB,YAAY;EACZ,eAAe,EAAE,qCAAqC;EACtD,gBAAgB,EAAE,gCAAgC;EAClD,iBAAiB,EAAE,gCAAgC;EACnD,gBAAgB,EAAE,kDAAkD;EACpE,gBAAgB;AAClB;;AAEA,qDAAqD;AACrD;EACE,aAAa;EACb,8BAA8B,EAAE,wCAAwC;EACxE,mBAAmB;EACnB,WAAW;AACb;;AAEA,qCAAqC;AACrC;EACE,gBAAgB,EAAE,8CAA8C;EAChE,aAAa;EACb,mBAAmB,EAAE,iDAAiD;AACxE;;AAEA,8CAA8C;AAC9C;EACE,cAAc,EAAE,mCAAmC;EACnD,uFAAuF;EACvF,kBAAkB,EAAE,mCAAmC;AACzD;;AAEA,+DAA+D;AAC/D;EACE,aAAa;EACb,QAAQ;AACV;;AAEA,oDAAoD;AACpD;EACE,eAAe;EACf,+BAA+B;EAC/B,gBAAgB;EAChB,eAAe;AACjB;;AAEA;EACE,eAAe;EACf,sBAAsB;AACxB","sourcesContent":["/* \n * Styles for the JupyterLab AI Assistant extension\n */\n\n.jp-llm-ext-icon {\n  background-size: 16px;\n  margin-right: 8px;\n}\n\n.jp-llm-ext-container {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  padding: 10px;\n}\n\n.jp-llm-ext-title-container {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 0 16px;\n  border-bottom: 1px solid var(--jp-border-color2);\n  background-color: var(--jp-layout-color1);\n  height: 50px;\n}\n\n.jp-llm-ext-title-input {\n  width: 100%;\n  padding: 8px;\n  border: 1px solid var(--jp-border-color1);\n  border-radius: 4px;\n  background-color: var(--jp-layout-color1);\n  color: var(--jp-content-font-color1);\n}\n\n.jp-llm-ext-title-input:focus {\n  outline: none;\n  border-color: var(--jp-brand-color1);\n  box-shadow: 0 0 0 1px var(--jp-brand-color1);\n}\n\n.jp-llm-ext-container h2 {\n  margin-top: 0;\n  color: var(--jp-ui-font-color1);\n}\n\n.jp-llm-ext-container p {\n  color: var(--jp-ui-font-color2);\n  margin-bottom: 20px;\n}\n\n.jp-llm-ext-button {\n  width: 100%;\n  padding: 8px;\n  background-color: var(--jp-brand-color1);\n  color: white;\n  border: none;\n  border-radius: 2px;\n  cursor: pointer;\n}\n\n.jp-llm-ext-button:hover {\n  background-color: var(--jp-brand-color0);\n}\n\n/* Markdown styling */\n.markdown-content {\n  font-family: var(--jp-ui-font-family);\n  line-height: 1.5;\n}\n\n.markdown-content h1, \n.markdown-content h2, \n.markdown-content h3, \n.markdown-content h4, \n.markdown-content h5, \n.markdown-content h6 {\n  margin-top: 1em;\n  margin-bottom: 0.5em;\n  font-weight: bold;\n  color: var(--jp-ui-font-color0);\n}\n\n.markdown-content h1 {\n  font-size: 1.5em;\n  border-bottom: 1px solid var(--jp-border-color2);\n  padding-bottom: 0.3em;\n}\n\n.markdown-content h2 {\n  font-size: 1.3em;\n}\n\n.markdown-content h3 {\n  font-size: 1.1em;\n}\n\n.markdown-content p {\n  margin: 0.5em 0;\n}\n\n.markdown-content ul, \n.markdown-content ol {\n  margin: 0.5em 0;\n  padding-left: 1.5em;\n}\n\n.markdown-content li {\n  margin: 0.25em 0;\n}\n\n.markdown-content a {\n  color: var(--jp-content-link-color);\n  text-decoration: none;\n}\n\n.markdown-content a:hover {\n  text-decoration: underline;\n}\n\n.markdown-content blockquote {\n  padding-left: 1em;\n  margin-left: 0;\n  border-left: 3px solid var(--jp-border-color2);\n  color: var(--jp-ui-font-color2);\n}\n\n.markdown-content pre {\n  background-color: var(--jp-cell-editor-background);\n  padding: 0.75em;\n  border-radius: 3px;\n  overflow-x: auto;\n}\n\n.markdown-content code {\n  font-family: var(--jp-code-font-family);\n  background-color: var(--jp-cell-editor-background);\n  padding: 0.2em 0.4em;\n  border-radius: 3px;\n  font-size: 0.9em;\n}\n\n.markdown-content pre code {\n  padding: 0;\n  background-color: transparent;\n}\n\n.markdown-content img {\n  max-width: 100%;\n}\n\n/* Message container styles */\n.jp-llm-ext-message-container {\n  flex: 1;\n  overflow-y: auto;\n  padding: 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  padding-bottom: 70px;\n  scroll-behavior: smooth;\n  background-color: var(--jp-layout-color1);\n}\n\n/* User message styles */\n.jp-llm-ext-user-message {\n  align-self: flex-end;\n  max-width: 85%;\n  padding: 12px 16px;\n  background-color: var(--jp-brand-color1);\n  color: white;\n  border-radius: 16px 16px 4px 16px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n  animation: fadeIn 0.3s ease;\n  font-size: 14px;\n  line-height: 1.5;\n}\n\n/* Bot message styles */\n.jp-llm-ext-bot-message {\n  align-self: flex-start;\n  max-width: 85%;\n  padding: 12px 16px;\n  background-color: var(--jp-layout-color2);\n  color: var(--jp-ui-font-color1);\n  border-radius: 16px 16px 16px 4px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n  animation: fadeIn 0.3s ease;\n  font-size: 14px;\n  line-height: 1.5;\n}\n\n/* Message styling */\n.jp-llm-ext-user-message, .jp-llm-ext-bot-message {\n  margin-bottom: 15px;\n  padding: 10px;\n  border-radius: 8px;\n  position: relative;\n  overflow: hidden;\n}\n\n/* Markdown content styling */\n.markdown-content {\n  overflow-wrap: break-word;\n  word-break: break-word;\n}\n\n/* Code block styling */\n.streaming-content {\n  font-family: var(--jp-code-font-family);\n  white-space: pre-wrap;\n  overflow-wrap: break-word;\n  word-break: break-word;\n  background-color: var(--jp-layout-color0);\n  padding: 8px;\n}\n\n.markdown-content pre {\n  background-color: var(--jp-cell-editor-background);\n  border-radius: 4px;\n  margin: 8px 0;\n  padding: 10px;\n  overflow-x: auto;\n}\n\n.markdown-content code {\n  font-family: var(--jp-code-font-family);\n  background-color: var(--jp-cell-editor-background);\n  padding: 2px 4px;\n  border-radius: 3px;\n}\n\n.markdown-content pre code {\n  background-color: transparent;\n  padding: 0;\n  display: block;\n}\n\n/* Table styling */\n.markdown-content table {\n  border-collapse: collapse;\n  margin: 10px 0;\n  width: 100%;\n}\n\n.markdown-content th {\n  background-color: var(--jp-layout-color2);\n  border: 1px solid var(--jp-border-color2);\n  padding: 5px 10px;\n  text-align: left;\n}\n\n.markdown-content td {\n  border: 1px solid var(--jp-border-color2);\n  padding: 5px 10px;\n  text-align: left;\n}\n\n/* Error message */\n.error-message {\n  color: var(--jp-error-color1);\n  padding: 5px;\n  font-weight: bold;\n}\n\n/* Popup Menu Styles */\n.jp-llm-ext-popup-menu-container {\n  position: absolute !important;\n  z-index: 100000 !important; /* Highest z-index to ensure visibility */\n  background-color: var(--jp-layout-color1);\n  border: 1px solid var(--jp-border-color2);\n  border-radius: 8px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;\n  width: 250px !important;\n  max-height: 400px !important;\n  overflow-y: auto;\n}\n\n.jp-llm-ext-popup-menu-item {\n  padding: 8px 16px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  border-bottom: 1px solid var(--jp-border-color1);\n}\n\n.jp-llm-ext-popup-menu-item:last-child {\n  border-bottom: none;\n}\n\n.jp-llm-ext-popup-menu-item:hover {\n  background-color: var(--jp-layout-color2);\n}\n\n.jp-llm-ext-popup-menu-path {\n  padding: 8px 16px;\n  font-size: 12px;\n  color: var(--jp-ui-font-color2);\n  background-color: var(--jp-layout-color2);\n  border-bottom: 1px solid var(--jp-border-color2);\n}\n\n/* Keyboard shortcut visual indicator */\n.keyboard-shortcut-indicator {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  background-color: var(--jp-brand-color1);\n  color: white;\n  padding: 8px 16px;\n  border-radius: 4px;\n  font-size: 14px;\n  opacity: 0;\n  transition: opacity 0.3s ease;\n  pointer-events: none;\n  z-index: 10000;\n}\n\n.jp-llm-ext-keyboard-shortcut-indicator.visible {\n  opacity: 1;\n}\n\n/* Message action buttons */\n.jp-llm-ext-message-actions {\n  position: absolute;\n  top: 5px;\n  right: 30px; /* Positioned after the markdown indicator */\n  display: flex;\n  gap: 8px;\n  opacity: 0;\n  transition: opacity 0.2s ease;\n  z-index: 5;\n}\n\n.jp-llm-ext-bot-message:hover .jp-llm-ext-message-actions {\n  opacity: 1;\n}\n\n.jp-llm-ext-message-action-button {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  padding: 0;\n  border: none;\n  background-color: var(--jp-layout-color2);\n  color: var(--jp-ui-font-color2);\n  border-radius: 4px;\n  transition: all 0.2s ease;\n  cursor: pointer;\n}\n\n.jp-llm-ext-message-action-button:hover {\n  background-color: var(--jp-layout-color3);\n  color: var(--jp-brand-color1);\n}\n\n.jp-llm-ext-message-action-button svg {\n  width: 14px;\n  height: 14px;\n}\n\n/* Input container styles */\n.jp-llm-ext-input-area {\n  padding: 10px;\n  border-top: 1px solid var(--jp-border-color1);\n}\n\n.jp-llm-ext-input-container {\n  padding: 16px;\n  padding-bottom: 70px;\n  background-color: var(--jp-layout-color1);\n  border-top: 1px solid var(--jp-border-color2);\n}\n\n/* Input field styles */\n.jp-llm-ext-input-field {\n  width: 100%;\n  min-height: 80px; /* Increased min height */\n  max-height: 250px;\n  padding: 12px 16px;\n  border: 1px solid var(--jp-border-color2);\n  border-radius: 10px;\n  background-color: var(--jp-layout-color1);\n  color: var(--jp-ui-font-color1);\n  font-size: 14px;\n  resize: vertical;\n  transition: all 0.2s ease;\n  line-height: 1.5;\n  font-family: var(--jp-ui-font-family);\n}\n\n.jp-llm-ext-input-field:focus {\n  outline: none;\n  border-color: var(--jp-brand-color1);\n  box-shadow: 0 0 0 1px var(--jp-brand-color1);\n}\n\n/* Control container styles */\n.jp-llm-ext-controls-container {\n  display: flex;\n  align-items: center;\n  padding: 4px 8px;\n  margin-bottom: 8px;\n}\n\n/* Toggle container styles */\n.jp-llm-ext-toggle-container {\n  display: flex;\n  align-items: center;\n  flex-shrink: 0;\n}\n\n/* Markdown toggle checkbox */\n#markdown-toggle {\n  margin-right: 5px;\n  cursor: pointer;\n  width: 16px;\n  height: 16px;\n  accent-color: var(--jp-brand-color1);\n}\n\n/* Markdown toggle label */\n#markdown-toggle + label {\n  font-size: 13px;\n  color: var(--jp-ui-font-color2);\n  cursor: pointer;\n}\n\n#markdown-toggle + label:hover {\n  color: var(--jp-brand-color1);\n}\n\n/* Action buttons container - Closer to toggle */\n.jp-llm-ext-action-buttons-container {\n  display: flex;\n  gap: 6px;\n  align-items: center;\n  margin-left: 8px; /* Reduced margin */\n  flex-shrink: 0;\n}\n\n/* Control buttons in the action-buttons-container */\n.jp-Button.jp-llm-ext-action-button {\n  min-width: 28px;\n  width: 28px;\n  height: 28px;\n  padding: 0;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 6px;\n  font-size: 14px;\n  background-color: var(--jp-layout-color2);\n  color: var(--jp-ui-font-color1);\n  border: 1px solid var(--jp-border-color2);\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.jp-llm-ext-action-buttons-container .jp-Button.jp-llm-ext-action-button:hover {\n  background-color: var(--jp-layout-color3);\n  color: var(--jp-brand-color1);\n  border-color: var(--jp-brand-color1);\n}\n\n/* Fix for the @ button to make popup visible */\n.jp-llm-ext-action-buttons-container .jp-Button.jp-llm-ext-action-button[title=\"Insert context (@)\"] {\n  position: relative;\n}\n\n/* Style for New Chat and History buttons in top-actions */\n.jp-llm-ext-top-actions-container .jp-Button.jp-llm-ext-action-button {\n  padding: 8px 20px;\n  height: 36px;\n  min-width: 80px;\n  width: auto;\n  flex: 1;\n  background-color: var(--jp-brand-color1);\n  color: white;\n  border: none;\n  border-radius: 8px;\n}\n\n.jp-llm-ext-top-actions-container .jp-Button.jp-llm-ext-action-button:hover {\n  background-color: var(--jp-brand-color0);\n  transform: translateY(-1px);\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);\n}\n\n/* Send button */\n.jp-Button.jp-llm-ext-send-button {\n  padding: 8px 20px;\n  background-color: var(--jp-brand-color1);\n  color: white;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  font-size: 14px;\n  font-weight: 500;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n  height: 36px;\n  min-width: 80px;\n}\n\n/* Input area styles */\n.jp-llm-ext-input-area {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 12px;\n  border: 1px solid var(--jp-border-color2);\n  border-radius: 12px;\n  background-color: var(--jp-layout-color2);\n}\n\n/* Input field */\n.jp-llm-ext-input-field {\n  width: 100%;\n  min-height: 60px;\n  max-height: 200px;\n  padding: 12px 16px;\n  border: 1px solid var(--jp-border-color2);\n  border-radius: 10px;\n  background-color: var(--jp-layout-color1);\n  color: var(--jp-ui-font-color1);\n  font-size: 14px;\n  resize: none;\n  transition: all 0.2s ease;\n  line-height: 1.5;\n  font-family: var(--jp-ui-font-family);\n}\n\n/* Input actions container */\n/* .jp-llm-ext-input-actions-container {\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  margin-top: 8px;\n} */\n\n/* Title container styles */\n.title-container {\n  padding: 10px;\n  border-bottom: 1px solid var(--jp-border-color2);\n  margin-bottom: 5px;\n}\n\n/* Chat title input - Improved look */\n.chat-title-input {\n  flex: 1;\n  padding: 10px 14px;\n  border: none;\n  border-bottom: 1px solid var(--jp-border-color2);\n  border-radius: 0;\n  background-color: var(--jp-layout-color1);\n  color: var(--jp-ui-font-color0);\n  font-size: 16px;\n  font-weight: 600;\n  transition: all 0.2s ease;\n}\n\n.chat-title-input:hover, .chat-title-input:focus {\n  border-bottom-color: var(--jp-brand-color1);\n  background-color: var(--jp-layout-color2);\n  outline: none;\n  box-shadow: none;\n}\n\n/* Top actions container - Same style as Send button */\n.jp-llm-ext-top-actions-container {\n  padding: 0;\n  margin: 0;\n  border-bottom: none;\n  height: auto;\n}\n\n/* All main buttons should look the same */\n.jp-llm-ext-action-button,\n.jp-llm-ext-send-button,\n.jp-Button.jp-llm-ext-action-button {\n  padding: 8px 20px;\n  background-color: var(--jp-brand-color1);\n  color: white;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  font-size: 14px;\n  font-weight: 500;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n  height: 32px;\n  flex: 1;\n}\n\n.jp-llm-ext-action-button:hover,\n.jp-llm-ext-send-button:hover,\n.jp-Button.jp-llm-ext-action-button:hover {\n  background-color: var(--jp-brand-color0);\n  transform: translateY(-1px);\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);\n}\n\n/* History container */\n.history-container {\n  flex-grow: 1;\n  overflow-y: auto;\n  padding: 10px;\n}\n\n/* History item */\n.jp-llm-ext-history-item {\n  padding: 8px 12px;\n  margin-bottom: 8px;\n  border-radius: 5px;\n  cursor: pointer;\n  background-color: var(--jp-layout-color1);\n  border: 1px solid var(--jp-border-color2);\n  transition: all 0.2s ease;\n}\n\n.jp-llm-ext-history-item:hover {\n  background-color: var(--jp-layout-color2);\n}\n\n.jp-llm-ext-history-item.active {\n  border-left: 3px solid var(--jp-brand-color1);\n}\n\n/* History title */\n.jp-llm-ext-history-title {\n  font-weight: bold;\n  margin-bottom: 5px;\n  color: var(--jp-ui-font-color0);\n}\n\n/* History preview */\n.jp-llm-ext-history-preview {\n  font-size: 0.9em;\n  color: var(--jp-ui-font-color2);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n/* Empty history message */\n.empty-history-message {\n  text-align: center;\n  padding: 20px;\n  color: var(--jp-ui-font-color2);\n  font-style: italic;\n}\n\n/* Add any additional css rules here */\n\n/* Chat message containers */\n.jp-llm-ext-container {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  overflow: hidden;\n}\n\n.jp-llm-ext-input-area {\n  display: flex;\n  flex-direction: column;\n  padding: 10px;\n  border-top: 1px solid var(--jp-border-color1);\n}\n\n/* Modern Chatbot Interface Styles */\n\n/* Main sidebar container */\n.jp-llm-ext-sidebar {\n  background-color: var(--jp-layout-color1);\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  border-left: 1px solid var(--jp-border-color2);\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;\n}\n\n/* Content wrapper */\n.jp-llm-ext-content-wrapper {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  padding: 0;\n  gap: 0;\n}\n\n/* Top bar with title and actions */\n.jp-llm-ext-title-container {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 12px 16px;\n  border-bottom: 1px solid var(--jp-border-color2);\n  background-color: var(--jp-layout-color1);\n  position: sticky;\n  top: 0;\n  z-index: 10;\n}\n\n.chat-title-input {\n  flex: 1;\n  padding: 8px 12px;\n  border: 1px solid var(--jp-border-color2);\n  border-radius: 8px;\n  background-color: var(--jp-layout-color1);\n  color: var(--jp-ui-font-color1);\n  font-size: 14px;\n  font-weight: 500;\n  transition: all 0.2s ease;\n}\n\n.chat-title-input:hover, .chat-title-input:focus {\n  border-color: var(--jp-brand-color1);\n  outline: none;\n  box-shadow: 0 0 0 2px rgba(var(--jp-brand-color1-rgb), 0.1);\n}\n\n/* Input container */\n.jp-llm-ext-input-container {\n  padding: 16px;\n  background-color: var(--jp-layout-color1);\n  border-top: 1px solid var(--jp-border-color2);\n  position: sticky;\n  bottom: 0;\n  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);\n}\n\n.jp-llm-ext-input-area {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 12px;\n  border: 1px solid var(--jp-border-color2);\n  border-radius: 12px;\n  background-color: var(--jp-layout-color2);\n}\n\n.jp-llm-ext-input-field {\n  width: 100%;\n  min-height: 60px;\n  max-height: 200px;\n  padding: 12px 16px;\n  border: 1px solid var(--jp-border-color2);\n  border-radius: 10px;\n  background-color: var(--jp-layout-color1);\n  color: var(--jp-ui-font-color1);\n  font-size: 14px;\n  resize: none;\n  transition: all 0.2s ease;\n  line-height: 1.5;\n  font-family: var(--jp-ui-font-family);\n}\n\n.jp-llm-ext-input-field:focus {\n  border-color: var(--jp-brand-color1);\n  outline: none;\n  box-shadow: 0 0 0 2px rgba(var(--jp-brand-color1-rgb), 0.1);\n}\n\n/* Controls container */\n.jp-llm-ext-controls-container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 4px 8px;\n  margin-top: 8px;\n}\n\n.jp-llm-ext-toggles-container {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n/* Markdown toggle */\n.jp-llm-ext-markdown-toggle {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 13px;\n  color: var(--jp-ui-font-color2);\n  cursor: pointer;\n  padding: 6px 10px;\n  border-radius: 6px;\n  transition: all 0.2s ease;\n  background-color: transparent;\n  border: none;\n}\n\n.jp-llm-ext-markdown-toggle:hover {\n  background-color: rgba(var(--jp-brand-color1-rgb), 0.1);\n  color: var(--jp-brand-color1);\n}\n\n.jp-llm-ext-markdown-toggle svg {\n  width: 16px;\n  height: 16px;\n}\n\n.jp-llm-ext-markdown-toggle.active {\n  color: var(--jp-brand-color1);\n  background-color: rgba(var(--jp-brand-color1-rgb), 0.1);\n}\n\n/* Send button */\n.jp-llm-ext-send-button {\n  padding: 8px 20px;\n  background-color: var(--jp-brand-color1);\n  color: white;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  font-size: 14px;\n  font-weight: 500;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n  height: 32px;\n  min-width: 80px;\n}\n\n.jp-llm-ext-send-button:hover {\n  background-color: var(--jp-brand-color0);\n  transform: translateY(-1px);\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);\n}\n\n.jp-llm-ext-send-button svg {\n  width: 16px;\n  height: 16px;\n  flex-shrink: 0;\n}\n\n.jp-llm-ext-send-button:disabled {\n  background-color: var(--jp-layout-color3);\n  color: var(--jp-ui-font-color2);\n  cursor: not-allowed;\n  box-shadow: none;\n  transform: none;\n}\n\n/* History container */\n.jp-llm-ext-history-container {\n  flex: 1;\n  overflow-y: auto;\n  padding: 16px;\n  background-color: var(--jp-layout-color1);\n}\n\n.jp-llm-ext-history-item {\n  padding: 12px 16px;\n  margin-bottom: 8px;\n  border-radius: 8px;\n  cursor: pointer;\n  background-color: var(--jp-layout-color2);\n  border: 1px solid var(--jp-border-color2);\n  transition: all 0.2s ease;\n}\n\n.jp-llm-ext-history-item:hover {\n  background-color: var(--jp-layout-color3);\n  border-color: var(--jp-brand-color1);\n}\n\n.jp-llm-ext-history-item.active {\n  background-color: var(--jp-brand-color1);\n  color: white;\n  border-color: var(--jp-brand-color1);\n}\n\n.jp-llm-ext-history-title {\n  font-weight: 500;\n  margin-bottom: 4px;\n  color: var(--jp-ui-font-color1);\n}\n\n.jp-llm-ext-history-preview {\n  font-size: 13px;\n  color: var(--jp-ui-font-color2);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n/* Animations */\n@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(10px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n@keyframes slideIn {\n  from { opacity: 0; transform: translateY(-10px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n/* Keyboard shortcut indicator */\n.jp-llm-ext-keyboard-shortcut-indicator {\n  position: fixed;\n  bottom: 20px;\n  right: 20px;\n  background-color: var(--jp-brand-color1);\n  color: white;\n  padding: 8px 16px;\n  border-radius: 8px;\n  font-size: 13px;\n  font-weight: 500;\n  opacity: 0;\n  transform: translateY(20px);\n  transition: all 0.3s ease;\n  pointer-events: none;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n}\n\n.jp-llm-ext-keyboard-shortcut-indicator.visible {\n  opacity: 1;\n  transform: translateY(0);\n}\n\n/* Settings modal */\n.jp-llm-ext-settings-modal {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: rgba(0, 0, 0, 0.5);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 10000;\n  backdrop-filter: blur(4px);\n}\n\n.jp-llm-ext-settings-content {\n  background-color: var(--jp-layout-color1);\n  border-radius: 12px;\n  padding: 24px;\n  width: 90%;\n  max-width: 500px;\n  max-height: 90vh;\n  overflow-y: auto;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);\n  animation: slideIn 0.3s ease;\n}\n\n.jp-llm-ext-settings-form {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n\n.jp-llm-ext-settings-label {\n  display: block;\n  margin-bottom: 4px;\n  color: var(--jp-ui-font-color1);\n  font-size: 14px;\n  font-weight: 500;\n}\n\n.jp-llm-ext-settings-input,\n.jp-llm-ext-settings-select,\n.jp-llm-ext-settings-textarea {\n  width: 100%;\n  padding: 12px;\n  border: 1px solid var(--jp-border-color2);\n  border-radius: 8px;\n  background-color: var(--jp-layout-color1);\n  color: var(--jp-ui-font-color1);\n  font-size: 14px;\n  transition: all 0.2s ease;\n  box-sizing: border-box;\n}\n\n.jp-llm-ext-settings-input:focus,\n.jp-llm-ext-settings-select:focus,\n.jp-llm-ext-settings-textarea:focus {\n  border-color: var(--jp-brand-color1);\n  outline: none;\n  box-shadow: 0 0 0 2px rgba(var(--jp-brand-color1-rgb), 0.1);\n}\n\n.jp-llm-ext-settings-textarea {\n  min-height: 100px;\n  resize: vertical;\n}\n\n.jp-llm-ext-settings-buttons {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 24px;\n}\n\n.jp-llm-ext-settings-button {\n  padding: 8px 16px;\n  border-radius: 8px;\n  font-size: 14px;\n  font-weight: 500;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.jp-llm-ext-settings-save-button {\n  background-color: var(--jp-brand-color1);\n  color: white;\n  border: none;\n}\n\n.jp-llm-ext-settings-save-button:hover {\n  background-color: var(--jp-brand-color0);\n  transform: translateY(-1px);\n}\n\n.jp-llm-ext-settings-cancel-button {\n  background-color: var(--jp-layout-color2);\n  color: var(--jp-ui-font-color1);\n  border: 1px solid var(--jp-border-color2);\n}\n\n.jp-llm-ext-settings-cancel-button:hover {\n  background-color: var(--jp-layout-color3);\n  transform: translateY(-1px);\n}\n\n/* Markdown indicator */\n.markdown-indicator {\n  position: absolute;\n  top: 5px;\n  right: 5px;\n  background-color: var(--jp-brand-color2);\n  color: white;\n  font-size: 10px;\n  padding: 2px 4px;\n  border-radius: 4px;\n  opacity: 0.8;\n  z-index: 5;\n}\n\n@keyframes slideUp {\n  from { opacity: 0; transform: translateY(10px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n/* Bottom actions container */\n.jp-llm-ext-bottom-actions-container {\n  display: flex;\n  gap: 12px;\n  padding: 16px;\n  background-color: var(--jp-layout-color1);\n  position: sticky;\n  bottom: 0;\n  border-top: 1px solid var(--jp-border-color2);\n  z-index: 100;\n}\n\n/* New Chat and History button styles (match Send button) */\n.jp-Button.jp-llm-ext-action-button {\n  padding: 8px 20px;\n  background-color: var(--jp-brand-color1);\n  color: white;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  font-size: 14px;\n  font-weight: 500;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n  height: 32px;\n}\n\n.jp-Button.jp-llm-ext-action-button:hover {\n  background-color: var(--jp-brand-color0);\n  transform: translateY(-1px);\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);\n}\n\n/* Fixed position toolbar at bottom */\n.jp-llm-ext-fixed-bottom-toolbar {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  background-color: var(--jp-layout-color1);\n  border-top: 1px solid var(--jp-border-color2);\n  padding: 12px 16px;\n  display: flex;\n  gap: 12px;\n  z-index: 1000;\n  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);\n}\n\n/* Bottom fixed toolbar for all main buttons */\n.jp-llm-ext-bottom-toolbar {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  display: flex;\n  gap: 12px;\n  padding: 12px 16px;\n  background-color: var(--jp-layout-color1);\n  border-top: 1px solid var(--jp-border-color2);\n  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);\n  z-index: 10000;\n}\n\n/* All main buttons in the bottom toolbar */\n.jp-llm-ext-bottom-toolbar .jp-Button {\n  padding: 8px 20px;\n  background-color: var(--jp-brand-color1);\n  color: white;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  font-size: 14px;\n  font-weight: 500;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n  height: 36px;\n  flex: 1;\n  min-width: 80px;\n}\n\n.jp-llm-ext-bottom-toolbar .jp-Button:hover {\n  background-color: var(--jp-brand-color0);\n  transform: translateY(-1px);\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);\n}\n\n/* Create spacing at bottom of message container for fixed toolbar */\n.jp-llm-ext-message-container {\n  padding-bottom: 70px !important;\n}\n\n/* Create spacing at bottom of input container for fixed toolbar */\n.jp-llm-ext-input-container {\n  padding-bottom: 70px !important;\n}\n\n/* Move the top actions container to the bottom */\n.jp-llm-ext-top-actions-container {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  z-index: 10000;\n  background-color: var(--jp-layout-color1);\n  border-top: 1px solid var(--jp-border-color2);\n  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);\n  padding: 12px 16px;\n}\n\n/* New Bottom Bar Styling */\n.jp-llm-ext-bottom-bar-container {\n  display: flex;\n  align-items: flex-end; /* Align items to the bottom */\n  padding: 8px 12px;\n  border-top: 1px solid var(--jp-border-color2);\n  background-color: var(--jp-layout-color1);\n  gap: 8px; /* Space between input area and buttons */\n}\n\n/* Input Area Container within the Bottom Bar */\n.jp-llm-ext-input-area-container {\n  flex-grow: 1; /* Allow input area to take available space */\n  display: flex;\n  flex-direction: column; /* Stack controls above input field */\n  /* Removed fixed height/borders previously here, handled by children/container */\n}\n\n/* Input field specific adjustments within the bottom bar */\n.jp-llm-ext-input-area-container .jp-llm-ext-input-field {\n  width: 100%; /* Take full width of its container */\n  resize: none; /* Disable manual resize */\n  border: 1px solid var(--jp-border-color1);\n  border-radius: 3px;\n  padding: 5px;\n  margin-top: 4px; /* Space between controls and input */\n  min-height: 30px; /* Minimum height for one line */\n  max-height: 150px; /* Max height before scrolling */\n  overflow-y: auto; /* Allow scrolling if content exceeds max-height */\n  line-height: 1.4;\n}\n\n/* Controls container (Markdown, @ etc.) adjustment */\n.jp-llm-ext-controls-container {\n  display: flex;\n  justify-content: space-between; /* Space out toggle and action buttons */\n  align-items: center;\n  width: 100%;\n}\n\n/* Send button container adjustment */\n.jp-llm-ext-input-actions-container {\n  margin-left: 8px; /* Space between input field and send button */\n  display: flex;\n  align-items: center; /* Vertically center send button if input grows */\n}\n\n/* Adjustments for buttons in the bottom bar */\n.jp-llm-ext-bottom-bar-container > .jp-Button {\n  flex-shrink: 0; /* Prevent buttons from shrinking */\n  /* Align with the bottom of the input field, requires align-items: flex-end on parent */\n  margin-bottom: 5px; /* Align baseline with input text */ \n}\n\n/* Ensure action buttons inside controls container are spaced */\n.jp-llm-ext-action-buttons-container {\n  display: flex;\n  gap: 4px;\n}\n\n/* Style adjustments for toggle label and checkbox */\n.jp-llm-ext-toggle-container label {\n  font-size: 12px;\n  color: var(--jp-ui-font-color2);\n  margin-left: 4px;\n  cursor: pointer;\n}\n\n.jp-llm-ext-toggle-container input[type=\"checkbox\"] {\n  cursor: pointer;\n  vertical-align: middle;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ "./style/index.css":
/*!*************************!*\
  !*** ./style/index.css ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./index.css */ "./node_modules/css-loader/dist/cjs.js!./style/index.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ })

}]);
//# sourceMappingURL=style_index_css.2cdf785dc494f0710395.js.map