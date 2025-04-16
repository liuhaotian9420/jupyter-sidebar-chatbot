"use strict";
(self["webpackChunkjupyter_simple_extension"] = self["webpackChunkjupyter_simple_extension"] || []).push([["lib_index_js"],{

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _jupyterlab_launcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/launcher */ "webpack/sharing/consume/default/@jupyterlab/launcher");
/* harmony import */ var _jupyterlab_launcher__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_launcher__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @lumino/widgets */ "webpack/sharing/consume/default/@lumino/widgets");
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__);




// Example icon string (base64-encoded SVG)
const iconSvgStr = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-left-text" viewBox="0 0 16 16">' +
    '<path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>' +
    '<path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>' +
    '</svg>';
// Create a custom icon
const extensionIcon = new _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_1__.LabIcon({
    name: 'simple:icon',
    svgstr: iconSvgStr
});
// Create a widget for the sidebar
class SimpleSidebarWidget extends _lumino_widgets__WEBPACK_IMPORTED_MODULE_2__.Widget {
    constructor() {
        super();
        this.id = 'simple-sidebar';
        this.title.label = 'Chat Interface';
        this.title.caption = 'Chat Interface';
        this.title.icon = extensionIcon;
        this.title.closable = true;
        // Create the main container
        const content = document.createElement('div');
        content.className = 'simple-sidebar-content';
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        content.style.height = '100%';
        // Create message container
        this.messageContainer = document.createElement('div');
        this.messageContainer.className = 'message-container';
        this.messageContainer.style.flexGrow = '1';
        this.messageContainer.style.overflowY = 'auto';
        this.messageContainer.style.padding = '10px';
        this.messageContainer.style.borderBottom = '1px solid #e0e0e0';
        // Create input container
        const inputContainer = document.createElement('div');
        inputContainer.style.display = 'flex';
        inputContainer.style.padding = '10px';
        inputContainer.style.gap = '5px';
        // Create input field
        this.inputField = document.createElement('input');
        this.inputField.type = 'text';
        this.inputField.placeholder = 'Type your message...';
        this.inputField.style.flexGrow = '1';
        this.inputField.style.padding = '5px';
        this.inputField.style.border = '1px solid #ccc';
        this.inputField.style.borderRadius = '3px';
        // Create send button
        const sendButton = document.createElement('button');
        sendButton.className = 'jp-Button';
        sendButton.textContent = 'Send';
        sendButton.style.padding = '5px 10px';
        // Add event listeners
        sendButton.addEventListener('click', () => this.handleSendMessage());
        this.inputField.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.handleSendMessage();
            }
        });
        // Assemble the components
        inputContainer.appendChild(this.inputField);
        inputContainer.appendChild(sendButton);
        content.appendChild(this.messageContainer);
        content.appendChild(inputContainer);
        this.node.appendChild(content);
    }
    handleSendMessage() {
        const message = this.inputField.value.trim();
        if (message) {
            this.addMessage(message, 'user');
            this.inputField.value = '';
            // Here you can add logic to handle the message and get a response
            // For now, we'll just echo the message
            setTimeout(() => {
                this.addMessage(`Echo: ${message}`, 'bot');
            }, 500);
        }
    }
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.style.marginBottom = '10px';
        messageDiv.style.padding = '8px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.maxWidth = '80%';
        messageDiv.style.wordWrap = 'break-word';
        if (sender === 'user') {
            messageDiv.style.backgroundColor = '#e3f2fd';
            messageDiv.style.marginLeft = 'auto';
        }
        else {
            messageDiv.style.backgroundColor = '#f5f5f5';
            messageDiv.style.marginRight = 'auto';
        }
        messageDiv.textContent = text;
        this.messageContainer.appendChild(messageDiv);
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
}
/**
 * Initialization data for the jupyter-simple-extension extension.
 */
const plugin = {
    id: 'jupyter-simple-extension:plugin',
    autoStart: true,
    requires: [_jupyterlab_launcher__WEBPACK_IMPORTED_MODULE_0__.ILauncher, _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_3__.ICommandPalette],
    activate: (app, launcher, palette) => {
        console.log('JupyterLab extension jupyter-simple-extension is activated!');
        // Create the sidebar widget
        const sidebarWidget = new SimpleSidebarWidget();
        // Add the sidebar widget to the left area on startup
        app.shell.add(sidebarWidget, 'left', { rank: 100 });
        // Add a command to toggle the sidebar
        app.commands.addCommand('simple-extension:toggle-sidebar', {
            label: 'Toggle Simple Sidebar',
            icon: extensionIcon,
            execute: () => {
                if (sidebarWidget.isAttached) {
                    sidebarWidget.parent = null;
                }
                else {
                    app.shell.add(sidebarWidget, 'left', { rank: 100 });
                }
            }
        });
        // Add the command to the command palette
        palette.addItem({
            command: 'simple-extension:toggle-sidebar',
            category: 'Extension'
        });
        // Add a launcher item
        launcher.add({
            command: 'simple-extension:toggle-sidebar',
            category: 'Other',
            rank: 1
        });
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (plugin);


/***/ })

}]);
//# sourceMappingURL=lib_index_js.59958de6cefeb24b6852.js.map