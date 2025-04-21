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
  margin-bottom: 10px;
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
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
}

/* User message styles */
.jp-llm-ext-user-message {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 5px;
  max-width: 80%;
  word-wrap: break-word;
  background-color: #e3f2fd;
  margin-left: auto;
}

/* Bot message styles */
.jp-llm-ext-bot-message {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 5px;
  max-width: 80%;
  word-wrap: break-word;
  background-color: #f5f5f5;
  margin-right: auto;
}

/* Markdown indicator styles */
.markdown-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 10px;
  background-color: var(--jp-brand-color1);
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
  opacity: 0.7;
  z-index: 10;
}

/* Input container styles */
.jp-llm-ext-input-area {
  padding: 10px;
  border-top: 1px solid var(--jp-border-color1);
}

.jp-llm-ext-input-container {
  display: flex;
  flex-direction: column;
}

/* Input field styles */
.jp-llm-ext-input-field {
  min-height: 120px; /* 3x taller than default */
  max-height: 300px; /* Maximum height before scrolling */
  resize: vertical;
  padding: 8px;
  border: 1px solid var(--jp-border-color1);
  border-radius: 4px;
  font-family: var(--jp-code-font-family);
  font-size: var(--jp-code-font-size);
  line-height: 1.5;
  background-color: var(--jp-layout-color1);
  color: var(--jp-content-font-color1);
}

.jp-llm-ext-input-field:focus {
  outline: none;
  border-color: var(--jp-brand-color1);
  box-shadow: 0 0 0 1px var(--jp-brand-color1);
}

/* Control container styles */
.jp-llm-ext-controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

/* Toggle container styles */
.jp-llm-ext-toggles-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Action buttons container */
.jp-llm-ext-actions-container {
  display: flex;
  gap: 4px;
}

/* Action button styles */
.jp-llm-ext-button {
  width: auto;
  min-width: 28px;
  margin: 0;
  padding: 2px 8px;
}

/* Input actions container */
.jp-llm-ext-input-actions-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
}

/* Send button styles */
.jp-llm-ext-send-button {
  padding: 5px 10px;
}

/* Title container styles */
.title-container {
  padding: 10px;
  border-bottom: 1px solid var(--jp-border-color2);
  margin-bottom: 5px;
}

/* Chat title input */
.chat-title-input {
  width: 100%;
  padding: 5px;
  font-weight: bold;
  border: 1px solid transparent;
  border-radius: 3px;
  background-color: transparent;
  color: var(--jp-ui-font-color0);
}

.chat-title-input:hover, .chat-title-input:focus {
  border-color: var(--jp-border-color1);
  background-color: var(--jp-layout-color1);
  outline: none;
}

/* Top actions container */
.top-actions-container {
  display: flex;
  padding: 5px 10px;
  gap: 10px;
  border-bottom: 1px solid var(--jp-border-color2);
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

.jp-llm-ext-message-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.jp-llm-ext-input-area {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-top: 1px solid var(--jp-border-color1);
}

/* Message styling */
.jp-llm-ext-user-message, .jp-llm-ext-bot-message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.jp-llm-ext-user-message {
  background-color: var(--jp-layout-color2);
  color: var(--jp-content-font-color1);
  align-self: flex-end;
}

.jp-llm-ext-bot-message {
  background-color: var(--jp-layout-color1);
  border: 1px solid var(--jp-border-color2);
  color: var(--jp-content-font-color1);
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
  position: absolute;
  background-color: var(--jp-layout-color1);
  border: 1px solid var(--jp-border-color2);
  box-shadow: var(--jp-elevation-z4);
  z-index: 10001;
  padding: 4px;
  min-width: 250px;
  max-height: 400px;
  overflow-y: auto;
}

.jp-llm-ext-popup-menu-item {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--jp-border-color1);
}

.jp-llm-ext-popup-menu-item:last-child {
  border-bottom: none;
}

.jp-llm-ext-popup-menu-item:hover {
  background: var(--jp-layout-color2);
}

.jp-llm-ext-popup-menu-path {
  padding: 4px 12px;
  font-size: 0.9em;
  color: var(--jp-ui-font-color2);
  background-color: var(--jp-layout-color2);
  border-bottom: 1px solid var(--jp-border-color2);
  margin-bottom: 4px;
  font-style: italic;
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
  right: 45px; /* Positioned right after the MD indicator */
  display: flex;
  gap: 4px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.jp-llm-ext-message-actions:hover {
  opacity: 1;
}

.jp-llm-ext-bot-message {
  position: relative;
  background-color: var(--jp-layout-color1);
  border: 1px solid var(--jp-border-color2);
  color: var(--jp-content-font-color1);
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  min-height: 50px;
}

.jp-llm-ext-message-action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 3px;
  background-color: var(--jp-layout-color2);
  color: var(--jp-ui-font-color1);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.jp-llm-ext-message-action-button:hover {
  background-color: var(--jp-layout-color3);
  color: var(--jp-brand-color1);
}`, "",{"version":3,"sources":["webpack://./style/index.css"],"names":[],"mappings":"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","sourcesContent":["/* \n * Styles for the JupyterLab AI Assistant extension\n */\n\n.jp-llm-ext-icon {\n  background-size: 16px;\n  margin-right: 8px;\n}\n\n.jp-llm-ext-container {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  padding: 10px;\n}\n\n.jp-llm-ext-title-container {\n  margin-bottom: 10px;\n}\n\n.jp-llm-ext-title-input {\n  width: 100%;\n  padding: 8px;\n  border: 1px solid var(--jp-border-color1);\n  border-radius: 4px;\n  background-color: var(--jp-layout-color1);\n  color: var(--jp-content-font-color1);\n}\n\n.jp-llm-ext-title-input:focus {\n  outline: none;\n  border-color: var(--jp-brand-color1);\n  box-shadow: 0 0 0 1px var(--jp-brand-color1);\n}\n\n.jp-llm-ext-container h2 {\n  margin-top: 0;\n  color: var(--jp-ui-font-color1);\n}\n\n.jp-llm-ext-container p {\n  color: var(--jp-ui-font-color2);\n  margin-bottom: 20px;\n}\n\n.jp-llm-ext-button {\n  width: 100%;\n  padding: 8px;\n  background-color: var(--jp-brand-color1);\n  color: white;\n  border: none;\n  border-radius: 2px;\n  cursor: pointer;\n}\n\n.jp-llm-ext-button:hover {\n  background-color: var(--jp-brand-color0);\n}\n\n/* Markdown styling */\n.markdown-content {\n  font-family: var(--jp-ui-font-family);\n  line-height: 1.5;\n}\n\n.markdown-content h1, \n.markdown-content h2, \n.markdown-content h3, \n.markdown-content h4, \n.markdown-content h5, \n.markdown-content h6 {\n  margin-top: 1em;\n  margin-bottom: 0.5em;\n  font-weight: bold;\n  color: var(--jp-ui-font-color0);\n}\n\n.markdown-content h1 {\n  font-size: 1.5em;\n  border-bottom: 1px solid var(--jp-border-color2);\n  padding-bottom: 0.3em;\n}\n\n.markdown-content h2 {\n  font-size: 1.3em;\n}\n\n.markdown-content h3 {\n  font-size: 1.1em;\n}\n\n.markdown-content p {\n  margin: 0.5em 0;\n}\n\n.markdown-content ul, \n.markdown-content ol {\n  margin: 0.5em 0;\n  padding-left: 1.5em;\n}\n\n.markdown-content li {\n  margin: 0.25em 0;\n}\n\n.markdown-content a {\n  color: var(--jp-content-link-color);\n  text-decoration: none;\n}\n\n.markdown-content a:hover {\n  text-decoration: underline;\n}\n\n.markdown-content blockquote {\n  padding-left: 1em;\n  margin-left: 0;\n  border-left: 3px solid var(--jp-border-color2);\n  color: var(--jp-ui-font-color2);\n}\n\n.markdown-content pre {\n  background-color: var(--jp-cell-editor-background);\n  padding: 0.75em;\n  border-radius: 3px;\n  overflow-x: auto;\n}\n\n.markdown-content code {\n  font-family: var(--jp-code-font-family);\n  background-color: var(--jp-cell-editor-background);\n  padding: 0.2em 0.4em;\n  border-radius: 3px;\n  font-size: 0.9em;\n}\n\n.markdown-content pre code {\n  padding: 0;\n  background-color: transparent;\n}\n\n.markdown-content img {\n  max-width: 100%;\n}\n\n/* Message container styles */\n.jp-llm-ext-message-container {\n  flex-grow: 1;\n  overflow-y: auto;\n  padding: 10px;\n  border-bottom: 1px solid #e0e0e0;\n}\n\n/* User message styles */\n.jp-llm-ext-user-message {\n  margin-bottom: 10px;\n  padding: 8px;\n  border-radius: 5px;\n  max-width: 80%;\n  word-wrap: break-word;\n  background-color: #e3f2fd;\n  margin-left: auto;\n}\n\n/* Bot message styles */\n.jp-llm-ext-bot-message {\n  margin-bottom: 10px;\n  padding: 8px;\n  border-radius: 5px;\n  max-width: 80%;\n  word-wrap: break-word;\n  background-color: #f5f5f5;\n  margin-right: auto;\n}\n\n/* Markdown indicator styles */\n.markdown-indicator {\n  position: absolute;\n  top: 5px;\n  right: 5px;\n  font-size: 10px;\n  background-color: var(--jp-brand-color1);\n  color: white;\n  padding: 2px 5px;\n  border-radius: 3px;\n  opacity: 0.7;\n  z-index: 10;\n}\n\n/* Input container styles */\n.jp-llm-ext-input-area {\n  padding: 10px;\n  border-top: 1px solid var(--jp-border-color1);\n}\n\n.jp-llm-ext-input-container {\n  display: flex;\n  flex-direction: column;\n}\n\n/* Input field styles */\n.jp-llm-ext-input-field {\n  min-height: 120px; /* 3x taller than default */\n  max-height: 300px; /* Maximum height before scrolling */\n  resize: vertical;\n  padding: 8px;\n  border: 1px solid var(--jp-border-color1);\n  border-radius: 4px;\n  font-family: var(--jp-code-font-family);\n  font-size: var(--jp-code-font-size);\n  line-height: 1.5;\n  background-color: var(--jp-layout-color1);\n  color: var(--jp-content-font-color1);\n}\n\n.jp-llm-ext-input-field:focus {\n  outline: none;\n  border-color: var(--jp-brand-color1);\n  box-shadow: 0 0 0 1px var(--jp-brand-color1);\n}\n\n/* Control container styles */\n.jp-llm-ext-controls-container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 5px;\n}\n\n/* Toggle container styles */\n.jp-llm-ext-toggles-container {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n\n/* Action buttons container */\n.jp-llm-ext-actions-container {\n  display: flex;\n  gap: 4px;\n}\n\n/* Action button styles */\n.jp-llm-ext-button {\n  width: auto;\n  min-width: 28px;\n  margin: 0;\n  padding: 2px 8px;\n}\n\n/* Input actions container */\n.jp-llm-ext-input-actions-container {\n  display: flex;\n  justify-content: flex-end;\n  margin-top: 5px;\n}\n\n/* Send button styles */\n.jp-llm-ext-send-button {\n  padding: 5px 10px;\n}\n\n/* Title container styles */\n.title-container {\n  padding: 10px;\n  border-bottom: 1px solid var(--jp-border-color2);\n  margin-bottom: 5px;\n}\n\n/* Chat title input */\n.chat-title-input {\n  width: 100%;\n  padding: 5px;\n  font-weight: bold;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  background-color: transparent;\n  color: var(--jp-ui-font-color0);\n}\n\n.chat-title-input:hover, .chat-title-input:focus {\n  border-color: var(--jp-border-color1);\n  background-color: var(--jp-layout-color1);\n  outline: none;\n}\n\n/* Top actions container */\n.top-actions-container {\n  display: flex;\n  padding: 5px 10px;\n  gap: 10px;\n  border-bottom: 1px solid var(--jp-border-color2);\n}\n\n/* History container */\n.history-container {\n  flex-grow: 1;\n  overflow-y: auto;\n  padding: 10px;\n}\n\n/* History item */\n.jp-llm-ext-history-item {\n  padding: 8px 12px;\n  margin-bottom: 8px;\n  border-radius: 5px;\n  cursor: pointer;\n  background-color: var(--jp-layout-color1);\n  border: 1px solid var(--jp-border-color2);\n  transition: all 0.2s ease;\n}\n\n.jp-llm-ext-history-item:hover {\n  background-color: var(--jp-layout-color2);\n}\n\n.jp-llm-ext-history-item.active {\n  border-left: 3px solid var(--jp-brand-color1);\n}\n\n/* History title */\n.jp-llm-ext-history-title {\n  font-weight: bold;\n  margin-bottom: 5px;\n  color: var(--jp-ui-font-color0);\n}\n\n/* History preview */\n.jp-llm-ext-history-preview {\n  font-size: 0.9em;\n  color: var(--jp-ui-font-color2);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n/* Empty history message */\n.empty-history-message {\n  text-align: center;\n  padding: 20px;\n  color: var(--jp-ui-font-color2);\n  font-style: italic;\n}\n\n/* Add any additional css rules here */\n\n/* Chat message containers */\n.jp-llm-ext-container {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  overflow: hidden;\n}\n\n.jp-llm-ext-message-container {\n  flex: 1;\n  overflow-y: auto;\n  padding: 10px;\n}\n\n.jp-llm-ext-input-area {\n  display: flex;\n  flex-direction: column;\n  padding: 10px;\n  border-top: 1px solid var(--jp-border-color1);\n}\n\n/* Message styling */\n.jp-llm-ext-user-message, .jp-llm-ext-bot-message {\n  margin-bottom: 15px;\n  padding: 10px;\n  border-radius: 8px;\n  position: relative;\n  overflow: hidden;\n}\n\n.jp-llm-ext-user-message {\n  background-color: var(--jp-layout-color2);\n  color: var(--jp-content-font-color1);\n  align-self: flex-end;\n}\n\n.jp-llm-ext-bot-message {\n  background-color: var(--jp-layout-color1);\n  border: 1px solid var(--jp-border-color2);\n  color: var(--jp-content-font-color1);\n}\n\n/* Markdown content styling */\n.markdown-content {\n  overflow-wrap: break-word;\n  word-break: break-word;\n}\n\n/* Code block styling */\n.streaming-content {\n  font-family: var(--jp-code-font-family);\n  white-space: pre-wrap;\n  overflow-wrap: break-word;\n  word-break: break-word;\n  background-color: var(--jp-layout-color0);\n  padding: 8px;\n}\n\n.markdown-content pre {\n  background-color: var(--jp-cell-editor-background);\n  border-radius: 4px;\n  margin: 8px 0;\n  padding: 10px;\n  overflow-x: auto;\n}\n\n.markdown-content code {\n  font-family: var(--jp-code-font-family);\n  background-color: var(--jp-cell-editor-background);\n  padding: 2px 4px;\n  border-radius: 3px;\n}\n\n.markdown-content pre code {\n  background-color: transparent;\n  padding: 0;\n  display: block;\n}\n\n/* Table styling */\n.markdown-content table {\n  border-collapse: collapse;\n  margin: 10px 0;\n  width: 100%;\n}\n\n.markdown-content th {\n  background-color: var(--jp-layout-color2);\n  border: 1px solid var(--jp-border-color2);\n  padding: 5px 10px;\n  text-align: left;\n}\n\n.markdown-content td {\n  border: 1px solid var(--jp-border-color2);\n  padding: 5px 10px;\n  text-align: left;\n}\n\n/* Error message */\n.error-message {\n  color: var(--jp-error-color1);\n  padding: 5px;\n  font-weight: bold;\n}\n\n/* Popup Menu Styles */\n.jp-llm-ext-popup-menu-container {\n  position: absolute;\n  background-color: var(--jp-layout-color1);\n  border: 1px solid var(--jp-border-color2);\n  box-shadow: var(--jp-elevation-z4);\n  z-index: 10001;\n  padding: 4px;\n  min-width: 250px;\n  max-height: 400px;\n  overflow-y: auto;\n}\n\n.jp-llm-ext-popup-menu-item {\n  display: flex;\n  flex-direction: column;\n  padding: 8px 12px;\n  cursor: pointer;\n  border-bottom: 1px solid var(--jp-border-color1);\n}\n\n.jp-llm-ext-popup-menu-item:last-child {\n  border-bottom: none;\n}\n\n.jp-llm-ext-popup-menu-item:hover {\n  background: var(--jp-layout-color2);\n}\n\n.jp-llm-ext-popup-menu-path {\n  padding: 4px 12px;\n  font-size: 0.9em;\n  color: var(--jp-ui-font-color2);\n  background-color: var(--jp-layout-color2);\n  border-bottom: 1px solid var(--jp-border-color2);\n  margin-bottom: 4px;\n  font-style: italic;\n}\n\n/* Keyboard shortcut visual indicator */\n.keyboard-shortcut-indicator {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  background-color: var(--jp-brand-color1);\n  color: white;\n  padding: 8px 16px;\n  border-radius: 4px;\n  font-size: 14px;\n  opacity: 0;\n  transition: opacity 0.3s ease;\n  pointer-events: none;\n  z-index: 10000;\n}\n\n.jp-llm-ext-keyboard-shortcut-indicator.visible {\n  opacity: 1;\n}\n\n/* Message action buttons */\n.jp-llm-ext-message-actions {\n  position: absolute;\n  top: 5px;\n  right: 45px; /* Positioned right after the MD indicator */\n  display: flex;\n  gap: 4px;\n  opacity: 0.7;\n  transition: opacity 0.2s ease;\n  z-index: 10;\n}\n\n.jp-llm-ext-message-actions:hover {\n  opacity: 1;\n}\n\n.jp-llm-ext-bot-message {\n  position: relative;\n  background-color: var(--jp-layout-color1);\n  border: 1px solid var(--jp-border-color2);\n  color: var(--jp-content-font-color1);\n  padding: 15px;\n  margin-bottom: 15px;\n  border-radius: 8px;\n  min-height: 50px;\n}\n\n.jp-llm-ext-message-action-button {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  padding: 0;\n  border: none;\n  border-radius: 3px;\n  background-color: var(--jp-layout-color2);\n  color: var(--jp-ui-font-color1);\n  font-size: 14px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.jp-llm-ext-message-action-button:hover {\n  background-color: var(--jp-layout-color3);\n  color: var(--jp-brand-color1);\n}"],"sourceRoot":""}]);
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
//# sourceMappingURL=style_index_css.2217246fb1a70ae62f3e.js.map