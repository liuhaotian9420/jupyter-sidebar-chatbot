"use strict";
(self["webpackChunk_jupyterlab_application_top"] = self["webpackChunk_jupyterlab_application_top"] || []).push([["build_index_out_js-data_image_png_base64_iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAsElE-e366eb"],{

/***/ "./build/index.out.js":
/*!****************************!*\
  !*** ./build/index.out.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   main: () => (/* binding */ main)
/* harmony export */ });
/* harmony import */ var _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/coreutils */ "webpack/sharing/consume/default/@jupyterlab/coreutils/@jupyterlab/coreutils");
/* harmony import */ var _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _lumino_coreutils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @lumino/coreutils */ "webpack/sharing/consume/default/@lumino/coreutils/@lumino/coreutils");
/* harmony import */ var _lumino_coreutils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_lumino_coreutils__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _style_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./style.js */ "./build/style.js");
// This file is auto-generated from the corresponding file in /dev_mode
/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */






async function createModule(scope, module) {
  try {
    const factory = await window._JUPYTERLAB[scope].get(module);
    const instance = factory();
    instance.__scope__ = scope;
    return instance;
  } catch(e) {
    console.warn(`Failed to create module: package: ${scope}; module: ${module}`);
    throw e;
  }
}

/**
 * The main entry point for the application.
 */
async function main() {

   // Handle a browser test.
   // Set up error handling prior to loading extensions.
   var browserTest = _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__.PageConfig.getOption('browserTest');
   if (browserTest.toLowerCase() === 'true') {
     var el = document.createElement('div');
     el.id = 'browserTest';
     document.body.appendChild(el);
     el.textContent = '[]';
     el.style.display = 'none';
     var errors = [];
     var reported = false;
     var timeout = 25000;

     var report = function() {
       if (reported) {
         return;
       }
       reported = true;
       el.className = 'completed';
     }

     window.onerror = function(msg, url, line, col, error) {
       errors.push(String(error));
       el.textContent = JSON.stringify(errors)
     };
     console.error = function(message) {
       errors.push(String(message));
       el.textContent = JSON.stringify(errors)
     };
  }

  var pluginRegistry = new _lumino_coreutils__WEBPACK_IMPORTED_MODULE_1__.PluginRegistry();
  var JupyterLab = (__webpack_require__(/*! @jupyterlab/application */ "webpack/sharing/consume/default/@jupyterlab/application/@jupyterlab/application").JupyterLab);
  var disabled = [];
  var deferred = [];
  var ignorePlugins = [];
  var register = [];


  const federatedExtensionPromises = [];
  const federatedMimeExtensionPromises = [];
  const federatedStylePromises = [];

  // Start initializing the federated extensions
  const extensions = JSON.parse(
    _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__.PageConfig.getOption('federated_extensions')
  );

  // Keep a mapping of renamed plugin ids to ensure user configs don't break.
  // The mapping is defined in the main index.js for JupyterLab, since it may not be relevant for
  // other lab-based applications (they may not use the same set of plugins).
  const renamedPluginIds = {
    '@jupyterlab/application:mimedocument': '@jupyterlab/application-extension:mimedocument',
    '@jupyterlab/help-extension:licenses': '@jupyterlab/apputils-extension:licenses-plugin',
    '@jupyterlab/lsp:ILSPCodeExtractorsManager': '@jupyterlab/lsp-extension:code-extractor-manager',
    '@jupyterlab/translation:translator': '@jupyterlab/translation-extension:translator',
    '@jupyterlab/workspaces:commands': '@jupyterlab/workspaces-extension:commands'
  };

  // Transparently handle the case of renamed plugins, so current configs don't break.
  // And emit a warning in the dev tools console to notify about the rename so
  // users can update their config.
  const disabledExtensions = _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__.PageConfig.Extension.disabled.map(id => {
    if (renamedPluginIds[id]) {
      console.warn(`Plugin ${id} has been renamed to ${renamedPluginIds[id]}. Consider updating your config to use the new name.`);
      return renamedPluginIds[id];
    }
    return id;
  });

  const deferredExtensions = _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__.PageConfig.Extension.deferred.map(id => {
    if (renamedPluginIds[id]) {
      console.warn(`Plugin id ${id} has been renamed to ${renamedPluginIds[id]}. Consider updating your config to use the new name.`);
      return renamedPluginIds[id];
    }
    return id;
  });

  // This is basically a copy of PageConfig.Extension.isDisabled to
  // take into account the case of renamed plugins.
  const isPluginDisabled = (id) => {
    const separatorIndex = id.indexOf(':');
    let extName = '';
    if (separatorIndex !== -1) {
      extName = id.slice(0, separatorIndex);
    }
    return disabledExtensions.some(val => val === id || (extName && val === extName));
  }

  // This is basically a copy of PageConfig.Extension.isDeferred to
  // take into account the case of renamed plugins.
  const isPluginDeferred = (id) => {
    const separatorIndex = id.indexOf(':');
    let extName = '';
    if (separatorIndex !== -1) {
      extName = id.slice(0, separatorIndex);
    }
    return deferredExtensions.some(val => val === id || (extName && val === extName));
  }

  const queuedFederated = [];

  extensions.forEach(data => {
    if (data.extension) {
      queuedFederated.push(data.name);
      federatedExtensionPromises.push(createModule(data.name, data.extension));
    }
    if (data.mimeExtension) {
      queuedFederated.push(data.name);
      federatedMimeExtensionPromises.push(createModule(data.name, data.mimeExtension));
    }

    if (data.style && !isPluginDisabled(data.name)) {
      federatedStylePromises.push(createModule(data.name, data.style));
    }
  });

  const allPlugins = [];

  /**
   * Get the plugins from an extension.
   */
  function getPlugins(extension) {
    // Handle commonjs or es2015 modules
    let exports;
    if (extension.hasOwnProperty('__esModule')) {
      exports = extension.default;
    } else {
      // CommonJS exports.
      exports = extension;
    }

    return Array.isArray(exports) ? exports : [exports];
  }

  /**
   * Iterate over active plugins in an extension.
   *
   * #### Notes
   * This also populates the disabled, deferred, and ignored arrays.
   */
  function* activePlugins(extension) {
    const plugins = getPlugins(extension);
    for (let plugin of plugins) {
      const isDisabled = isPluginDisabled(plugin.id);
      allPlugins.push({
        id: plugin.id,
        description: plugin.description,
        requires: plugin.requires ?? [],
        optional: plugin.optional ?? [],
        provides: plugin.provides ?? null,
        autoStart: plugin.autoStart,
        enabled: !isDisabled,
        extension: extension.__scope__
      });
      if (isDisabled) {
        disabled.push(plugin.id);
        continue;
      }
      if (isPluginDeferred(plugin.id)) {
        deferred.push(plugin.id);
        ignorePlugins.push(plugin.id);
      }
      yield plugin;
    }
  }

  // Handle the registered mime extensions.
  const mimeExtensions = [];
  if (!queuedFederated.includes('@jupyterlab/javascript-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/javascript-extension */ "webpack/sharing/consume/default/@jupyterlab/javascript-extension/@jupyterlab/javascript-extension");
      ext.__scope__ = '@jupyterlab/javascript-extension';
      for (let plugin of activePlugins(ext)) {
        mimeExtensions.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/json-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/json-extension */ "webpack/sharing/consume/default/@jupyterlab/json-extension/@jupyterlab/json-extension");
      ext.__scope__ = '@jupyterlab/json-extension';
      for (let plugin of activePlugins(ext)) {
        mimeExtensions.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/mermaid-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/mermaid-extension/lib/mime.js */ "./node_modules/@jupyterlab/mermaid-extension/lib/mime.js");
      ext.__scope__ = '@jupyterlab/mermaid-extension';
      for (let plugin of activePlugins(ext)) {
        mimeExtensions.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/pdf-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/pdf-extension */ "webpack/sharing/consume/default/@jupyterlab/pdf-extension/@jupyterlab/pdf-extension");
      ext.__scope__ = '@jupyterlab/pdf-extension';
      for (let plugin of activePlugins(ext)) {
        mimeExtensions.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/vega5-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/vega5-extension */ "webpack/sharing/consume/default/@jupyterlab/vega5-extension/@jupyterlab/vega5-extension");
      ext.__scope__ = '@jupyterlab/vega5-extension';
      for (let plugin of activePlugins(ext)) {
        mimeExtensions.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Add the federated mime extensions.
  const federatedMimeExtensions = await Promise.allSettled(federatedMimeExtensionPromises);
  federatedMimeExtensions.forEach(p => {
    if (p.status === "fulfilled") {
      for (let plugin of activePlugins(p.value)) {
        mimeExtensions.push(plugin);
      }
    } else {
      console.error(p.reason);
    }
  });

  // Handled the registered standard extensions.
  if (!queuedFederated.includes('@jupyterlab/application-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/application-extension */ "webpack/sharing/consume/default/@jupyterlab/application-extension/@jupyterlab/application-extension");
      ext.__scope__ = '@jupyterlab/application-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/apputils-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/apputils-extension */ "webpack/sharing/consume/default/@jupyterlab/apputils-extension/@jupyterlab/apputils-extension");
      ext.__scope__ = '@jupyterlab/apputils-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/cell-toolbar-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/cell-toolbar-extension */ "webpack/sharing/consume/default/@jupyterlab/cell-toolbar-extension/@jupyterlab/cell-toolbar-extension");
      ext.__scope__ = '@jupyterlab/cell-toolbar-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/celltags-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/celltags-extension */ "webpack/sharing/consume/default/@jupyterlab/celltags-extension/@jupyterlab/celltags-extension");
      ext.__scope__ = '@jupyterlab/celltags-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/codemirror-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/codemirror-extension */ "webpack/sharing/consume/default/@jupyterlab/codemirror-extension/@jupyterlab/codemirror-extension");
      ext.__scope__ = '@jupyterlab/codemirror-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/completer-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/completer-extension */ "webpack/sharing/consume/default/@jupyterlab/completer-extension/@jupyterlab/completer-extension");
      ext.__scope__ = '@jupyterlab/completer-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/console-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/console-extension */ "webpack/sharing/consume/default/@jupyterlab/console-extension/@jupyterlab/console-extension");
      ext.__scope__ = '@jupyterlab/console-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/csvviewer-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/csvviewer-extension */ "webpack/sharing/consume/default/@jupyterlab/csvviewer-extension/@jupyterlab/csvviewer-extension");
      ext.__scope__ = '@jupyterlab/csvviewer-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/debugger-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/debugger-extension */ "webpack/sharing/consume/default/@jupyterlab/debugger-extension/@jupyterlab/debugger-extension");
      ext.__scope__ = '@jupyterlab/debugger-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/docmanager-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/docmanager-extension */ "webpack/sharing/consume/default/@jupyterlab/docmanager-extension/@jupyterlab/docmanager-extension");
      ext.__scope__ = '@jupyterlab/docmanager-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/documentsearch-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/documentsearch-extension */ "webpack/sharing/consume/default/@jupyterlab/documentsearch-extension/@jupyterlab/documentsearch-extension");
      ext.__scope__ = '@jupyterlab/documentsearch-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/extensionmanager-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/extensionmanager-extension */ "webpack/sharing/consume/default/@jupyterlab/extensionmanager-extension/@jupyterlab/extensionmanager-extension");
      ext.__scope__ = '@jupyterlab/extensionmanager-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/filebrowser-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/filebrowser-extension */ "webpack/sharing/consume/default/@jupyterlab/filebrowser-extension/@jupyterlab/filebrowser-extension");
      ext.__scope__ = '@jupyterlab/filebrowser-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/fileeditor-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/fileeditor-extension */ "webpack/sharing/consume/default/@jupyterlab/fileeditor-extension/@jupyterlab/fileeditor-extension");
      ext.__scope__ = '@jupyterlab/fileeditor-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/help-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/help-extension */ "webpack/sharing/consume/default/@jupyterlab/help-extension/@jupyterlab/help-extension");
      ext.__scope__ = '@jupyterlab/help-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/htmlviewer-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/htmlviewer-extension */ "webpack/sharing/consume/default/@jupyterlab/htmlviewer-extension/@jupyterlab/htmlviewer-extension");
      ext.__scope__ = '@jupyterlab/htmlviewer-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/hub-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/hub-extension */ "webpack/sharing/consume/default/@jupyterlab/hub-extension/@jupyterlab/hub-extension");
      ext.__scope__ = '@jupyterlab/hub-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/imageviewer-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/imageviewer-extension */ "webpack/sharing/consume/default/@jupyterlab/imageviewer-extension/@jupyterlab/imageviewer-extension");
      ext.__scope__ = '@jupyterlab/imageviewer-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/inspector-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/inspector-extension */ "webpack/sharing/consume/default/@jupyterlab/inspector-extension/@jupyterlab/inspector-extension");
      ext.__scope__ = '@jupyterlab/inspector-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/launcher-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/launcher-extension */ "webpack/sharing/consume/default/@jupyterlab/launcher-extension/@jupyterlab/launcher-extension");
      ext.__scope__ = '@jupyterlab/launcher-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/logconsole-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/logconsole-extension */ "webpack/sharing/consume/default/@jupyterlab/logconsole-extension/@jupyterlab/logconsole-extension");
      ext.__scope__ = '@jupyterlab/logconsole-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/lsp-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/lsp-extension */ "webpack/sharing/consume/default/@jupyterlab/lsp-extension/@jupyterlab/lsp-extension");
      ext.__scope__ = '@jupyterlab/lsp-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/mainmenu-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/mainmenu-extension */ "webpack/sharing/consume/default/@jupyterlab/mainmenu-extension/@jupyterlab/mainmenu-extension");
      ext.__scope__ = '@jupyterlab/mainmenu-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/markdownviewer-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/markdownviewer-extension */ "webpack/sharing/consume/default/@jupyterlab/markdownviewer-extension/@jupyterlab/markdownviewer-extension");
      ext.__scope__ = '@jupyterlab/markdownviewer-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/markedparser-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/markedparser-extension */ "webpack/sharing/consume/default/@jupyterlab/markedparser-extension/@jupyterlab/markedparser-extension");
      ext.__scope__ = '@jupyterlab/markedparser-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/mathjax-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/mathjax-extension */ "webpack/sharing/consume/default/@jupyterlab/mathjax-extension/@jupyterlab/mathjax-extension");
      ext.__scope__ = '@jupyterlab/mathjax-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/mermaid-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/mermaid-extension */ "webpack/sharing/consume/default/@jupyterlab/mermaid-extension/@jupyterlab/mermaid-extension");
      ext.__scope__ = '@jupyterlab/mermaid-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/metadataform-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/metadataform-extension */ "webpack/sharing/consume/default/@jupyterlab/metadataform-extension/@jupyterlab/metadataform-extension");
      ext.__scope__ = '@jupyterlab/metadataform-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/notebook-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/notebook-extension */ "webpack/sharing/consume/default/@jupyterlab/notebook-extension/@jupyterlab/notebook-extension");
      ext.__scope__ = '@jupyterlab/notebook-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/pluginmanager-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/pluginmanager-extension */ "webpack/sharing/consume/default/@jupyterlab/pluginmanager-extension/@jupyterlab/pluginmanager-extension");
      ext.__scope__ = '@jupyterlab/pluginmanager-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/rendermime-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/rendermime-extension */ "webpack/sharing/consume/default/@jupyterlab/rendermime-extension/@jupyterlab/rendermime-extension");
      ext.__scope__ = '@jupyterlab/rendermime-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/running-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/running-extension */ "webpack/sharing/consume/default/@jupyterlab/running-extension/@jupyterlab/running-extension");
      ext.__scope__ = '@jupyterlab/running-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/services-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/services-extension */ "webpack/sharing/consume/default/@jupyterlab/services-extension/@jupyterlab/services-extension");
      ext.__scope__ = '@jupyterlab/services-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/settingeditor-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/settingeditor-extension */ "webpack/sharing/consume/default/@jupyterlab/settingeditor-extension/@jupyterlab/settingeditor-extension");
      ext.__scope__ = '@jupyterlab/settingeditor-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/shortcuts-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/shortcuts-extension */ "webpack/sharing/consume/default/@jupyterlab/shortcuts-extension/@jupyterlab/shortcuts-extension");
      ext.__scope__ = '@jupyterlab/shortcuts-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/statusbar-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/statusbar-extension */ "webpack/sharing/consume/default/@jupyterlab/statusbar-extension/@jupyterlab/statusbar-extension");
      ext.__scope__ = '@jupyterlab/statusbar-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/terminal-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/terminal-extension */ "webpack/sharing/consume/default/@jupyterlab/terminal-extension/@jupyterlab/terminal-extension");
      ext.__scope__ = '@jupyterlab/terminal-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/theme-dark-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/theme-dark-extension */ "webpack/sharing/consume/default/@jupyterlab/theme-dark-extension/@jupyterlab/theme-dark-extension");
      ext.__scope__ = '@jupyterlab/theme-dark-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/theme-dark-high-contrast-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/theme-dark-high-contrast-extension */ "webpack/sharing/consume/default/@jupyterlab/theme-dark-high-contrast-extension/@jupyterlab/theme-dark-high-contrast-extension");
      ext.__scope__ = '@jupyterlab/theme-dark-high-contrast-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/theme-light-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/theme-light-extension */ "webpack/sharing/consume/default/@jupyterlab/theme-light-extension/@jupyterlab/theme-light-extension");
      ext.__scope__ = '@jupyterlab/theme-light-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/toc-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/toc-extension */ "webpack/sharing/consume/default/@jupyterlab/toc-extension/@jupyterlab/toc-extension");
      ext.__scope__ = '@jupyterlab/toc-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/tooltip-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/tooltip-extension */ "webpack/sharing/consume/default/@jupyterlab/tooltip-extension/@jupyterlab/tooltip-extension");
      ext.__scope__ = '@jupyterlab/tooltip-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/translation-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/translation-extension */ "webpack/sharing/consume/default/@jupyterlab/translation-extension/@jupyterlab/translation-extension");
      ext.__scope__ = '@jupyterlab/translation-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/ui-components-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/ui-components-extension */ "webpack/sharing/consume/default/@jupyterlab/ui-components-extension/@jupyterlab/ui-components-extension");
      ext.__scope__ = '@jupyterlab/ui-components-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('@jupyterlab/workspaces-extension')) {
    try {
      let ext = __webpack_require__(/*! @jupyterlab/workspaces-extension */ "webpack/sharing/consume/default/@jupyterlab/workspaces-extension/@jupyterlab/workspaces-extension");
      ext.__scope__ = '@jupyterlab/workspaces-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!queuedFederated.includes('jupyter-simple-extension')) {
    try {
      let ext = __webpack_require__(/*! jupyter-simple-extension */ "webpack/sharing/consume/default/jupyter-simple-extension/jupyter-simple-extension");
      ext.__scope__ = 'jupyter-simple-extension';
      for (let plugin of activePlugins(ext)) {
        register.push(plugin);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Add the federated extensions.
  const federatedExtensions = await Promise.allSettled(federatedExtensionPromises);
  federatedExtensions.forEach(p => {
    if (p.status === "fulfilled") {
      for (let plugin of activePlugins(p.value)) {
        register.push(plugin);
      }
    } else {
      console.error(p.reason);
    }
  });

  // Load all federated component styles and log errors for any that do not
  (await Promise.allSettled(federatedStylePromises)).filter(({status}) => status === "rejected").forEach(({reason}) => {
    console.error(reason);
  });

  // 2. Register the plugins
  pluginRegistry.registerPlugins(register);

  // 3. Get and resolve the service manager and connection status plugins
  const IConnectionStatus = (__webpack_require__(/*! @jupyterlab/services */ "webpack/sharing/consume/default/@jupyterlab/services/@jupyterlab/services").IConnectionStatus);
  const IServiceManager = (__webpack_require__(/*! @jupyterlab/services */ "webpack/sharing/consume/default/@jupyterlab/services/@jupyterlab/services").IServiceManager);
  const connectionStatus = await pluginRegistry.resolveOptionalService(IConnectionStatus);
  const serviceManager = await pluginRegistry.resolveRequiredService(IServiceManager);

  const lab = new JupyterLab({
    pluginRegistry,
    serviceManager,
    mimeExtensions,
    connectionStatus,
    disabled: {
      matches: disabled,
      patterns: disabledExtensions
        .map(function (val) { return val.raw; })
    },
    deferred: {
      matches: deferred,
      patterns: deferredExtensions
        .map(function (val) { return val.raw; })
    },
    availablePlugins: allPlugins
  });

  // 4. Start the application, which will activate the other plugins
  lab.start({ ignorePlugins, bubblingKeydown: true });

  // Expose global app instance when in dev mode or when toggled explicitly.
  var exposeAppInBrowser = (_jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__.PageConfig.getOption('exposeAppInBrowser') || '').toLowerCase() === 'true';
  var devMode = (_jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__.PageConfig.getOption('devMode') || '').toLowerCase() === 'true';

  if (exposeAppInBrowser || devMode) {
    window.jupyterapp = lab;
  }

  // Handle a browser test.
  if (browserTest.toLowerCase() === 'true') {
    lab.restored
      .then(function() { report(errors); })
      .catch(function(reason) { report([`RestoreError: ${reason.message}`]); });

    // Handle failures to restore after the timeout has elapsed.
    window.setTimeout(function() { report(errors); }, timeout);
  }
}


/***/ }),

/***/ "./build/style.js":
/*!************************!*\
  !*** ./build/style.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _jupyterlab_application_extension_style_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/application-extension/style/index.js */ "./node_modules/@jupyterlab/application-extension/style/index.js");
/* harmony import */ var _jupyterlab_apputils_extension_style_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/apputils-extension/style/index.js */ "./node_modules/@jupyterlab/apputils-extension/style/index.js");
/* harmony import */ var _jupyterlab_cell_toolbar_extension_style_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jupyterlab/cell-toolbar-extension/style/index.js */ "./node_modules/@jupyterlab/cell-toolbar-extension/style/index.js");
/* harmony import */ var _jupyterlab_celltags_extension_style_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jupyterlab/celltags-extension/style/index.js */ "./node_modules/@jupyterlab/celltags-extension/style/index.js");
/* harmony import */ var _jupyterlab_codemirror_extension_style_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @jupyterlab/codemirror-extension/style/index.js */ "./node_modules/@jupyterlab/codemirror-extension/style/index.js");
/* harmony import */ var _jupyterlab_completer_extension_style_index_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @jupyterlab/completer-extension/style/index.js */ "./node_modules/@jupyterlab/completer-extension/style/index.js");
/* harmony import */ var _jupyterlab_console_extension_style_index_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @jupyterlab/console-extension/style/index.js */ "./node_modules/@jupyterlab/console-extension/style/index.js");
/* harmony import */ var _jupyterlab_csvviewer_extension_style_index_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @jupyterlab/csvviewer-extension/style/index.js */ "./node_modules/@jupyterlab/csvviewer-extension/style/index.js");
/* harmony import */ var _jupyterlab_debugger_extension_style_index_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @jupyterlab/debugger-extension/style/index.js */ "./node_modules/@jupyterlab/debugger-extension/style/index.js");
/* harmony import */ var _jupyterlab_docmanager_extension_style_index_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @jupyterlab/docmanager-extension/style/index.js */ "./node_modules/@jupyterlab/docmanager-extension/style/index.js");
/* harmony import */ var _jupyterlab_documentsearch_extension_style_index_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @jupyterlab/documentsearch-extension/style/index.js */ "./node_modules/@jupyterlab/documentsearch-extension/style/index.js");
/* harmony import */ var _jupyterlab_extensionmanager_extension_style_index_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @jupyterlab/extensionmanager-extension/style/index.js */ "./node_modules/@jupyterlab/extensionmanager-extension/style/index.js");
/* harmony import */ var _jupyterlab_filebrowser_extension_style_index_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @jupyterlab/filebrowser-extension/style/index.js */ "./node_modules/@jupyterlab/filebrowser-extension/style/index.js");
/* harmony import */ var _jupyterlab_fileeditor_extension_style_index_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @jupyterlab/fileeditor-extension/style/index.js */ "./node_modules/@jupyterlab/fileeditor-extension/style/index.js");
/* harmony import */ var _jupyterlab_help_extension_style_index_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @jupyterlab/help-extension/style/index.js */ "./node_modules/@jupyterlab/help-extension/style/index.js");
/* harmony import */ var _jupyterlab_htmlviewer_extension_style_index_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @jupyterlab/htmlviewer-extension/style/index.js */ "./node_modules/@jupyterlab/htmlviewer-extension/style/index.js");
/* harmony import */ var _jupyterlab_hub_extension_style_index_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @jupyterlab/hub-extension/style/index.js */ "./node_modules/@jupyterlab/hub-extension/style/index.js");
/* harmony import */ var _jupyterlab_imageviewer_extension_style_index_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @jupyterlab/imageviewer-extension/style/index.js */ "./node_modules/@jupyterlab/imageviewer-extension/style/index.js");
/* harmony import */ var _jupyterlab_inspector_extension_style_index_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @jupyterlab/inspector-extension/style/index.js */ "./node_modules/@jupyterlab/inspector-extension/style/index.js");
/* harmony import */ var _jupyterlab_javascript_extension_style_index_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @jupyterlab/javascript-extension/style/index.js */ "./node_modules/@jupyterlab/javascript-extension/style/index.js");
/* harmony import */ var _jupyterlab_json_extension_style_index_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @jupyterlab/json-extension/style/index.js */ "./node_modules/@jupyterlab/json-extension/style/index.js");
/* harmony import */ var _jupyterlab_launcher_extension_style_index_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @jupyterlab/launcher-extension/style/index.js */ "./node_modules/@jupyterlab/launcher-extension/style/index.js");
/* harmony import */ var _jupyterlab_logconsole_extension_style_index_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @jupyterlab/logconsole-extension/style/index.js */ "./node_modules/@jupyterlab/logconsole-extension/style/index.js");
/* harmony import */ var _jupyterlab_lsp_extension_style_index_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @jupyterlab/lsp-extension/style/index.js */ "./node_modules/@jupyterlab/lsp-extension/style/index.js");
/* harmony import */ var _jupyterlab_mainmenu_extension_style_index_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @jupyterlab/mainmenu-extension/style/index.js */ "./node_modules/@jupyterlab/mainmenu-extension/style/index.js");
/* harmony import */ var _jupyterlab_markdownviewer_extension_style_index_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @jupyterlab/markdownviewer-extension/style/index.js */ "./node_modules/@jupyterlab/markdownviewer-extension/style/index.js");
/* harmony import */ var _jupyterlab_markedparser_extension_style_index_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @jupyterlab/markedparser-extension/style/index.js */ "./node_modules/@jupyterlab/markedparser-extension/style/index.js");
/* harmony import */ var _jupyterlab_mathjax_extension_style_index_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! @jupyterlab/mathjax-extension/style/index.js */ "./node_modules/@jupyterlab/mathjax-extension/style/index.js");
/* harmony import */ var _jupyterlab_mermaid_extension_style_index_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! @jupyterlab/mermaid-extension/style/index.js */ "./node_modules/@jupyterlab/mermaid-extension/style/index.js");
/* harmony import */ var _jupyterlab_metadataform_extension_style_index_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! @jupyterlab/metadataform-extension/style/index.js */ "./node_modules/@jupyterlab/metadataform-extension/style/index.js");
/* harmony import */ var _jupyterlab_notebook_extension_style_index_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! @jupyterlab/notebook-extension/style/index.js */ "./node_modules/@jupyterlab/notebook-extension/style/index.js");
/* harmony import */ var _jupyterlab_pdf_extension_style_index_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! @jupyterlab/pdf-extension/style/index.js */ "./node_modules/@jupyterlab/pdf-extension/style/index.js");
/* harmony import */ var _jupyterlab_pluginmanager_extension_style_index_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! @jupyterlab/pluginmanager-extension/style/index.js */ "./node_modules/@jupyterlab/pluginmanager-extension/style/index.js");
/* harmony import */ var _jupyterlab_rendermime_extension_style_index_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! @jupyterlab/rendermime-extension/style/index.js */ "./node_modules/@jupyterlab/rendermime-extension/style/index.js");
/* harmony import */ var _jupyterlab_running_extension_style_index_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! @jupyterlab/running-extension/style/index.js */ "./node_modules/@jupyterlab/running-extension/style/index.js");
/* harmony import */ var _jupyterlab_settingeditor_extension_style_index_js__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! @jupyterlab/settingeditor-extension/style/index.js */ "./node_modules/@jupyterlab/settingeditor-extension/style/index.js");
/* harmony import */ var _jupyterlab_shortcuts_extension_style_index_js__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! @jupyterlab/shortcuts-extension/style/index.js */ "./node_modules/@jupyterlab/shortcuts-extension/style/index.js");
/* harmony import */ var _jupyterlab_statusbar_extension_style_index_js__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! @jupyterlab/statusbar-extension/style/index.js */ "./node_modules/@jupyterlab/statusbar-extension/style/index.js");
/* harmony import */ var _jupyterlab_terminal_extension_style_index_js__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! @jupyterlab/terminal-extension/style/index.js */ "./node_modules/@jupyterlab/terminal-extension/style/index.js");
/* harmony import */ var _jupyterlab_toc_extension_style_index_js__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! @jupyterlab/toc-extension/style/index.js */ "./node_modules/@jupyterlab/toc-extension/style/index.js");
/* harmony import */ var _jupyterlab_tooltip_extension_style_index_js__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! @jupyterlab/tooltip-extension/style/index.js */ "./node_modules/@jupyterlab/tooltip-extension/style/index.js");
/* harmony import */ var _jupyterlab_translation_extension_style_index_js__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! @jupyterlab/translation-extension/style/index.js */ "./node_modules/@jupyterlab/translation-extension/style/index.js");
/* harmony import */ var _jupyterlab_ui_components_extension_style_index_js__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! @jupyterlab/ui-components-extension/style/index.js */ "./node_modules/@jupyterlab/ui-components-extension/style/index.js");
/* harmony import */ var _jupyterlab_vega5_extension_style_index_js__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! @jupyterlab/vega5-extension/style/index.js */ "./node_modules/@jupyterlab/vega5-extension/style/index.js");
/* harmony import */ var _jupyterlab_workspaces_extension_style_index_js__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! @jupyterlab/workspaces-extension/style/index.js */ "./node_modules/@jupyterlab/workspaces-extension/style/index.js");
/* harmony import */ var jupyter_simple_extension_style_index_css__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! jupyter-simple-extension/style/index.css */ "./node_modules/jupyter-simple-extension/style/index.css");
/* This is a generated file of CSS imports */
/* It was generated by @jupyterlab/builder in Build.ensureAssets() */

















































/***/ }),

/***/ "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAsElEQVQIHQGlAFr/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7+r3zKmT0/+pk9P/7+r3zAAAAAAAAAAABAAAAAAAAAAA6OPzM+/q9wAAAAAA6OPzMwAAAAAAAAAAAgAAAAAAAAAAGR8NiRQaCgAZIA0AGR8NiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQyoYJ/SY80UAAAAASUVORK5CYII=":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAsElEQVQIHQGlAFr/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7+r3zKmT0/+pk9P/7+r3zAAAAAAAAAAABAAAAAAAAAAA6OPzM+/q9wAAAAAA6OPzMwAAAAAAAAAAAgAAAAAAAAAAGR8NiRQaCgAZIA0AGR8NiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQyoYJ/SY80UAAAAASUVORK5CYII= ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAsElEQVQIHQGlAFr/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7+r3zKmT0/+pk9P/7+r3zAAAAAAAAAAABAAAAAAAAAAA6OPzM+/q9wAAAAAA6OPzMwAAAAAAAAAAAgAAAAAAAAAAGR8NiRQaCgAZIA0AGR8NiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQyoYJ/SY80UAAAAASUVORK5CYII=";

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRfaW5kZXhfb3V0X2pzLWRhdGFfaW1hZ2VfcG5nX2Jhc2U2NF9pVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQWdBQUFBRkNBWUFBQUI0a2ExVkFBQUFzRWxFLWUzNjZlYi5lMTRmM2FmMWZkNzQ2MjJiZmE3Yi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVtRDtBQUNBOztBQUUvQjs7QUFFcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLHNEQUFzRCxRQUFRLFVBQVUsT0FBTztBQUMvRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ087O0FBRVA7QUFDQTtBQUNBLHFCQUFxQiw2REFBVTtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDJCQUEyQiw2REFBYztBQUN6QyxtQkFBbUIsa0pBQTZDO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUksNkRBQVU7QUFDZDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsNkRBQVU7QUFDdkM7QUFDQSw2QkFBNkIsSUFBSSxzQkFBc0IscUJBQXFCO0FBQzVFO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUgsNkJBQTZCLDZEQUFVO0FBQ3ZDO0FBQ0EsZ0NBQWdDLElBQUksc0JBQXNCLHFCQUFxQjtBQUMvRTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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Q0k7QUFDSjtBQUNFO0FBQ0Q7QUFDRjtBQUNFO0FBQ0Q7QUFDRTtBQUNJO0FBQ0U7QUFDTDtBQUNEO0FBQ047QUFDTTtBQUNQO0FBQ1E7QUFDRjtBQUNDO0FBQ047QUFDSTtBQUNFO0FBQ1A7QUFDSztBQUNNO0FBQ0Y7QUFDTDtBQUNBO0FBQ0s7QUFDSjtBQUNMO0FBQ1U7QUFDSDtBQUNIO0FBQ007QUFDSjtBQUNBO0FBQ0Q7QUFDTDtBQUNJO0FBQ0k7QUFDRTtBQUNSO0FBQ0s7QUFDUCIsInNvdXJjZXMiOlsid2VicGFjazovL0BqdXB5dGVybGFiL2FwcGxpY2F0aW9uLXRvcC8uL2J1aWxkL2luZGV4Lm91dC5qcyIsIndlYnBhY2s6Ly9AanVweXRlcmxhYi9hcHBsaWNhdGlvbi10b3AvLi9idWlsZC9zdHlsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgZnJvbSB0aGUgY29ycmVzcG9uZGluZyBmaWxlIGluIC9kZXZfbW9kZVxuLypcbiAqIENvcHlyaWdodCAoYykgSnVweXRlciBEZXZlbG9wbWVudCBUZWFtLlxuICogRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNb2RpZmllZCBCU0QgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgeyBQYWdlQ29uZmlnIH0gZnJvbSAnQGp1cHl0ZXJsYWIvY29yZXV0aWxzJztcbmltcG9ydCB7IFBsdWdpblJlZ2lzdHJ5IH0gZnJvbSAnQGx1bWluby9jb3JldXRpbHMnO1xuXG5pbXBvcnQgJy4vc3R5bGUuanMnO1xuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVNb2R1bGUoc2NvcGUsIG1vZHVsZSkge1xuICB0cnkge1xuICAgIGNvbnN0IGZhY3RvcnkgPSBhd2FpdCB3aW5kb3cuX0pVUFlURVJMQUJbc2NvcGVdLmdldChtb2R1bGUpO1xuICAgIGNvbnN0IGluc3RhbmNlID0gZmFjdG9yeSgpO1xuICAgIGluc3RhbmNlLl9fc2NvcGVfXyA9IHNjb3BlO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS53YXJuKGBGYWlsZWQgdG8gY3JlYXRlIG1vZHVsZTogcGFja2FnZTogJHtzY29wZX07IG1vZHVsZTogJHttb2R1bGV9YCk7XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBtYWluIGVudHJ5IHBvaW50IGZvciB0aGUgYXBwbGljYXRpb24uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYWluKCkge1xuXG4gICAvLyBIYW5kbGUgYSBicm93c2VyIHRlc3QuXG4gICAvLyBTZXQgdXAgZXJyb3IgaGFuZGxpbmcgcHJpb3IgdG8gbG9hZGluZyBleHRlbnNpb25zLlxuICAgdmFyIGJyb3dzZXJUZXN0ID0gUGFnZUNvbmZpZy5nZXRPcHRpb24oJ2Jyb3dzZXJUZXN0Jyk7XG4gICBpZiAoYnJvd3NlclRlc3QudG9Mb3dlckNhc2UoKSA9PT0gJ3RydWUnKSB7XG4gICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICBlbC5pZCA9ICdicm93c2VyVGVzdCc7XG4gICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICBlbC50ZXh0Q29udGVudCA9ICdbXSc7XG4gICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgIHZhciBlcnJvcnMgPSBbXTtcbiAgICAgdmFyIHJlcG9ydGVkID0gZmFsc2U7XG4gICAgIHZhciB0aW1lb3V0ID0gMjUwMDA7XG5cbiAgICAgdmFyIHJlcG9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgIGlmIChyZXBvcnRlZCkge1xuICAgICAgICAgcmV0dXJuO1xuICAgICAgIH1cbiAgICAgICByZXBvcnRlZCA9IHRydWU7XG4gICAgICAgZWwuY2xhc3NOYW1lID0gJ2NvbXBsZXRlZCc7XG4gICAgIH1cblxuICAgICB3aW5kb3cub25lcnJvciA9IGZ1bmN0aW9uKG1zZywgdXJsLCBsaW5lLCBjb2wsIGVycm9yKSB7XG4gICAgICAgZXJyb3JzLnB1c2goU3RyaW5nKGVycm9yKSk7XG4gICAgICAgZWwudGV4dENvbnRlbnQgPSBKU09OLnN0cmluZ2lmeShlcnJvcnMpXG4gICAgIH07XG4gICAgIGNvbnNvbGUuZXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgZXJyb3JzLnB1c2goU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICAgICBlbC50ZXh0Q29udGVudCA9IEpTT04uc3RyaW5naWZ5KGVycm9ycylcbiAgICAgfTtcbiAgfVxuXG4gIHZhciBwbHVnaW5SZWdpc3RyeSA9IG5ldyBQbHVnaW5SZWdpc3RyeSgpO1xuICB2YXIgSnVweXRlckxhYiA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL2FwcGxpY2F0aW9uJykuSnVweXRlckxhYjtcbiAgdmFyIGRpc2FibGVkID0gW107XG4gIHZhciBkZWZlcnJlZCA9IFtdO1xuICB2YXIgaWdub3JlUGx1Z2lucyA9IFtdO1xuICB2YXIgcmVnaXN0ZXIgPSBbXTtcblxuXG4gIGNvbnN0IGZlZGVyYXRlZEV4dGVuc2lvblByb21pc2VzID0gW107XG4gIGNvbnN0IGZlZGVyYXRlZE1pbWVFeHRlbnNpb25Qcm9taXNlcyA9IFtdO1xuICBjb25zdCBmZWRlcmF0ZWRTdHlsZVByb21pc2VzID0gW107XG5cbiAgLy8gU3RhcnQgaW5pdGlhbGl6aW5nIHRoZSBmZWRlcmF0ZWQgZXh0ZW5zaW9uc1xuICBjb25zdCBleHRlbnNpb25zID0gSlNPTi5wYXJzZShcbiAgICBQYWdlQ29uZmlnLmdldE9wdGlvbignZmVkZXJhdGVkX2V4dGVuc2lvbnMnKVxuICApO1xuXG4gIC8vIEtlZXAgYSBtYXBwaW5nIG9mIHJlbmFtZWQgcGx1Z2luIGlkcyB0byBlbnN1cmUgdXNlciBjb25maWdzIGRvbid0IGJyZWFrLlxuICAvLyBUaGUgbWFwcGluZyBpcyBkZWZpbmVkIGluIHRoZSBtYWluIGluZGV4LmpzIGZvciBKdXB5dGVyTGFiLCBzaW5jZSBpdCBtYXkgbm90IGJlIHJlbGV2YW50IGZvclxuICAvLyBvdGhlciBsYWItYmFzZWQgYXBwbGljYXRpb25zICh0aGV5IG1heSBub3QgdXNlIHRoZSBzYW1lIHNldCBvZiBwbHVnaW5zKS5cbiAgY29uc3QgcmVuYW1lZFBsdWdpbklkcyA9IHtcbiAgICAnQGp1cHl0ZXJsYWIvYXBwbGljYXRpb246bWltZWRvY3VtZW50JzogJ0BqdXB5dGVybGFiL2FwcGxpY2F0aW9uLWV4dGVuc2lvbjptaW1lZG9jdW1lbnQnLFxuICAgICdAanVweXRlcmxhYi9oZWxwLWV4dGVuc2lvbjpsaWNlbnNlcyc6ICdAanVweXRlcmxhYi9hcHB1dGlscy1leHRlbnNpb246bGljZW5zZXMtcGx1Z2luJyxcbiAgICAnQGp1cHl0ZXJsYWIvbHNwOklMU1BDb2RlRXh0cmFjdG9yc01hbmFnZXInOiAnQGp1cHl0ZXJsYWIvbHNwLWV4dGVuc2lvbjpjb2RlLWV4dHJhY3Rvci1tYW5hZ2VyJyxcbiAgICAnQGp1cHl0ZXJsYWIvdHJhbnNsYXRpb246dHJhbnNsYXRvcic6ICdAanVweXRlcmxhYi90cmFuc2xhdGlvbi1leHRlbnNpb246dHJhbnNsYXRvcicsXG4gICAgJ0BqdXB5dGVybGFiL3dvcmtzcGFjZXM6Y29tbWFuZHMnOiAnQGp1cHl0ZXJsYWIvd29ya3NwYWNlcy1leHRlbnNpb246Y29tbWFuZHMnXG4gIH07XG5cbiAgLy8gVHJhbnNwYXJlbnRseSBoYW5kbGUgdGhlIGNhc2Ugb2YgcmVuYW1lZCBwbHVnaW5zLCBzbyBjdXJyZW50IGNvbmZpZ3MgZG9uJ3QgYnJlYWsuXG4gIC8vIEFuZCBlbWl0IGEgd2FybmluZyBpbiB0aGUgZGV2IHRvb2xzIGNvbnNvbGUgdG8gbm90aWZ5IGFib3V0IHRoZSByZW5hbWUgc29cbiAgLy8gdXNlcnMgY2FuIHVwZGF0ZSB0aGVpciBjb25maWcuXG4gIGNvbnN0IGRpc2FibGVkRXh0ZW5zaW9ucyA9IFBhZ2VDb25maWcuRXh0ZW5zaW9uLmRpc2FibGVkLm1hcChpZCA9PiB7XG4gICAgaWYgKHJlbmFtZWRQbHVnaW5JZHNbaWRdKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFBsdWdpbiAke2lkfSBoYXMgYmVlbiByZW5hbWVkIHRvICR7cmVuYW1lZFBsdWdpbklkc1tpZF19LiBDb25zaWRlciB1cGRhdGluZyB5b3VyIGNvbmZpZyB0byB1c2UgdGhlIG5ldyBuYW1lLmApO1xuICAgICAgcmV0dXJuIHJlbmFtZWRQbHVnaW5JZHNbaWRdO1xuICAgIH1cbiAgICByZXR1cm4gaWQ7XG4gIH0pO1xuXG4gIGNvbnN0IGRlZmVycmVkRXh0ZW5zaW9ucyA9IFBhZ2VDb25maWcuRXh0ZW5zaW9uLmRlZmVycmVkLm1hcChpZCA9PiB7XG4gICAgaWYgKHJlbmFtZWRQbHVnaW5JZHNbaWRdKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFBsdWdpbiBpZCAke2lkfSBoYXMgYmVlbiByZW5hbWVkIHRvICR7cmVuYW1lZFBsdWdpbklkc1tpZF19LiBDb25zaWRlciB1cGRhdGluZyB5b3VyIGNvbmZpZyB0byB1c2UgdGhlIG5ldyBuYW1lLmApO1xuICAgICAgcmV0dXJuIHJlbmFtZWRQbHVnaW5JZHNbaWRdO1xuICAgIH1cbiAgICByZXR1cm4gaWQ7XG4gIH0pO1xuXG4gIC8vIFRoaXMgaXMgYmFzaWNhbGx5IGEgY29weSBvZiBQYWdlQ29uZmlnLkV4dGVuc2lvbi5pc0Rpc2FibGVkIHRvXG4gIC8vIHRha2UgaW50byBhY2NvdW50IHRoZSBjYXNlIG9mIHJlbmFtZWQgcGx1Z2lucy5cbiAgY29uc3QgaXNQbHVnaW5EaXNhYmxlZCA9IChpZCkgPT4ge1xuICAgIGNvbnN0IHNlcGFyYXRvckluZGV4ID0gaWQuaW5kZXhPZignOicpO1xuICAgIGxldCBleHROYW1lID0gJyc7XG4gICAgaWYgKHNlcGFyYXRvckluZGV4ICE9PSAtMSkge1xuICAgICAgZXh0TmFtZSA9IGlkLnNsaWNlKDAsIHNlcGFyYXRvckluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIGRpc2FibGVkRXh0ZW5zaW9ucy5zb21lKHZhbCA9PiB2YWwgPT09IGlkIHx8IChleHROYW1lICYmIHZhbCA9PT0gZXh0TmFtZSkpO1xuICB9XG5cbiAgLy8gVGhpcyBpcyBiYXNpY2FsbHkgYSBjb3B5IG9mIFBhZ2VDb25maWcuRXh0ZW5zaW9uLmlzRGVmZXJyZWQgdG9cbiAgLy8gdGFrZSBpbnRvIGFjY291bnQgdGhlIGNhc2Ugb2YgcmVuYW1lZCBwbHVnaW5zLlxuICBjb25zdCBpc1BsdWdpbkRlZmVycmVkID0gKGlkKSA9PiB7XG4gICAgY29uc3Qgc2VwYXJhdG9ySW5kZXggPSBpZC5pbmRleE9mKCc6Jyk7XG4gICAgbGV0IGV4dE5hbWUgPSAnJztcbiAgICBpZiAoc2VwYXJhdG9ySW5kZXggIT09IC0xKSB7XG4gICAgICBleHROYW1lID0gaWQuc2xpY2UoMCwgc2VwYXJhdG9ySW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWRFeHRlbnNpb25zLnNvbWUodmFsID0+IHZhbCA9PT0gaWQgfHwgKGV4dE5hbWUgJiYgdmFsID09PSBleHROYW1lKSk7XG4gIH1cblxuICBjb25zdCBxdWV1ZWRGZWRlcmF0ZWQgPSBbXTtcblxuICBleHRlbnNpb25zLmZvckVhY2goZGF0YSA9PiB7XG4gICAgaWYgKGRhdGEuZXh0ZW5zaW9uKSB7XG4gICAgICBxdWV1ZWRGZWRlcmF0ZWQucHVzaChkYXRhLm5hbWUpO1xuICAgICAgZmVkZXJhdGVkRXh0ZW5zaW9uUHJvbWlzZXMucHVzaChjcmVhdGVNb2R1bGUoZGF0YS5uYW1lLCBkYXRhLmV4dGVuc2lvbikpO1xuICAgIH1cbiAgICBpZiAoZGF0YS5taW1lRXh0ZW5zaW9uKSB7XG4gICAgICBxdWV1ZWRGZWRlcmF0ZWQucHVzaChkYXRhLm5hbWUpO1xuICAgICAgZmVkZXJhdGVkTWltZUV4dGVuc2lvblByb21pc2VzLnB1c2goY3JlYXRlTW9kdWxlKGRhdGEubmFtZSwgZGF0YS5taW1lRXh0ZW5zaW9uKSk7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEuc3R5bGUgJiYgIWlzUGx1Z2luRGlzYWJsZWQoZGF0YS5uYW1lKSkge1xuICAgICAgZmVkZXJhdGVkU3R5bGVQcm9taXNlcy5wdXNoKGNyZWF0ZU1vZHVsZShkYXRhLm5hbWUsIGRhdGEuc3R5bGUpKTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IGFsbFBsdWdpbnMgPSBbXTtcblxuICAvKipcbiAgICogR2V0IHRoZSBwbHVnaW5zIGZyb20gYW4gZXh0ZW5zaW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0UGx1Z2lucyhleHRlbnNpb24pIHtcbiAgICAvLyBIYW5kbGUgY29tbW9uanMgb3IgZXMyMDE1IG1vZHVsZXNcbiAgICBsZXQgZXhwb3J0cztcbiAgICBpZiAoZXh0ZW5zaW9uLmhhc093blByb3BlcnR5KCdfX2VzTW9kdWxlJykpIHtcbiAgICAgIGV4cG9ydHMgPSBleHRlbnNpb24uZGVmYXVsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ29tbW9uSlMgZXhwb3J0cy5cbiAgICAgIGV4cG9ydHMgPSBleHRlbnNpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoZXhwb3J0cykgPyBleHBvcnRzIDogW2V4cG9ydHNdO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBhY3RpdmUgcGx1Z2lucyBpbiBhbiBleHRlbnNpb24uXG4gICAqXG4gICAqICMjIyMgTm90ZXNcbiAgICogVGhpcyBhbHNvIHBvcHVsYXRlcyB0aGUgZGlzYWJsZWQsIGRlZmVycmVkLCBhbmQgaWdub3JlZCBhcnJheXMuXG4gICAqL1xuICBmdW5jdGlvbiogYWN0aXZlUGx1Z2lucyhleHRlbnNpb24pIHtcbiAgICBjb25zdCBwbHVnaW5zID0gZ2V0UGx1Z2lucyhleHRlbnNpb24pO1xuICAgIGZvciAobGV0IHBsdWdpbiBvZiBwbHVnaW5zKSB7XG4gICAgICBjb25zdCBpc0Rpc2FibGVkID0gaXNQbHVnaW5EaXNhYmxlZChwbHVnaW4uaWQpO1xuICAgICAgYWxsUGx1Z2lucy5wdXNoKHtcbiAgICAgICAgaWQ6IHBsdWdpbi5pZCxcbiAgICAgICAgZGVzY3JpcHRpb246IHBsdWdpbi5kZXNjcmlwdGlvbixcbiAgICAgICAgcmVxdWlyZXM6IHBsdWdpbi5yZXF1aXJlcyA/PyBbXSxcbiAgICAgICAgb3B0aW9uYWw6IHBsdWdpbi5vcHRpb25hbCA/PyBbXSxcbiAgICAgICAgcHJvdmlkZXM6IHBsdWdpbi5wcm92aWRlcyA/PyBudWxsLFxuICAgICAgICBhdXRvU3RhcnQ6IHBsdWdpbi5hdXRvU3RhcnQsXG4gICAgICAgIGVuYWJsZWQ6ICFpc0Rpc2FibGVkLFxuICAgICAgICBleHRlbnNpb246IGV4dGVuc2lvbi5fX3Njb3BlX19cbiAgICAgIH0pO1xuICAgICAgaWYgKGlzRGlzYWJsZWQpIHtcbiAgICAgICAgZGlzYWJsZWQucHVzaChwbHVnaW4uaWQpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1BsdWdpbkRlZmVycmVkKHBsdWdpbi5pZCkpIHtcbiAgICAgICAgZGVmZXJyZWQucHVzaChwbHVnaW4uaWQpO1xuICAgICAgICBpZ25vcmVQbHVnaW5zLnB1c2gocGx1Z2luLmlkKTtcbiAgICAgIH1cbiAgICAgIHlpZWxkIHBsdWdpbjtcbiAgICB9XG4gIH1cblxuICAvLyBIYW5kbGUgdGhlIHJlZ2lzdGVyZWQgbWltZSBleHRlbnNpb25zLlxuICBjb25zdCBtaW1lRXh0ZW5zaW9ucyA9IFtdO1xuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvamF2YXNjcmlwdC1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvamF2YXNjcmlwdC1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvamF2YXNjcmlwdC1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICBtaW1lRXh0ZW5zaW9ucy5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL2pzb24tZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL2pzb24tZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL2pzb24tZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgbWltZUV4dGVuc2lvbnMucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi9tZXJtYWlkLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi9tZXJtYWlkLWV4dGVuc2lvbi9saWIvbWltZS5qcycpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi9tZXJtYWlkLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIG1pbWVFeHRlbnNpb25zLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvcGRmLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi9wZGYtZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL3BkZi1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICBtaW1lRXh0ZW5zaW9ucy5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL3ZlZ2E1LWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi92ZWdhNS1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvdmVnYTUtZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgbWltZUV4dGVuc2lvbnMucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkIHRoZSBmZWRlcmF0ZWQgbWltZSBleHRlbnNpb25zLlxuICBjb25zdCBmZWRlcmF0ZWRNaW1lRXh0ZW5zaW9ucyA9IGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChmZWRlcmF0ZWRNaW1lRXh0ZW5zaW9uUHJvbWlzZXMpO1xuICBmZWRlcmF0ZWRNaW1lRXh0ZW5zaW9ucy5mb3JFYWNoKHAgPT4ge1xuICAgIGlmIChwLnN0YXR1cyA9PT0gXCJmdWxmaWxsZWRcIikge1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMocC52YWx1ZSkpIHtcbiAgICAgICAgbWltZUV4dGVuc2lvbnMucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKHAucmVhc29uKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEhhbmRsZWQgdGhlIHJlZ2lzdGVyZWQgc3RhbmRhcmQgZXh0ZW5zaW9ucy5cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL2FwcGxpY2F0aW9uLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi9hcHBsaWNhdGlvbi1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvYXBwbGljYXRpb24tZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi9hcHB1dGlscy1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvYXBwdXRpbHMtZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL2FwcHV0aWxzLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvY2VsbC10b29sYmFyLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi9jZWxsLXRvb2xiYXItZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL2NlbGwtdG9vbGJhci1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL2NlbGx0YWdzLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi9jZWxsdGFncy1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvY2VsbHRhZ3MtZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi9jb2RlbWlycm9yLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi9jb2RlbWlycm9yLWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi9jb2RlbWlycm9yLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvY29tcGxldGVyLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi9jb21wbGV0ZXItZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL2NvbXBsZXRlci1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL2NvbnNvbGUtZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL2NvbnNvbGUtZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL2NvbnNvbGUtZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi9jc3Z2aWV3ZXItZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL2NzdnZpZXdlci1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvY3N2dmlld2VyLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvZGVidWdnZXItZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL2RlYnVnZ2VyLWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi9kZWJ1Z2dlci1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL2RvY21hbmFnZXItZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL2RvY21hbmFnZXItZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL2RvY21hbmFnZXItZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi9kb2N1bWVudHNlYXJjaC1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvZG9jdW1lbnRzZWFyY2gtZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL2RvY3VtZW50c2VhcmNoLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvZXh0ZW5zaW9ubWFuYWdlci1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvZXh0ZW5zaW9ubWFuYWdlci1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvZXh0ZW5zaW9ubWFuYWdlci1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL2ZpbGVicm93c2VyLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi9maWxlYnJvd3Nlci1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvZmlsZWJyb3dzZXItZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi9maWxlZWRpdG9yLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi9maWxlZWRpdG9yLWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi9maWxlZWRpdG9yLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvaGVscC1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvaGVscC1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvaGVscC1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL2h0bWx2aWV3ZXItZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL2h0bWx2aWV3ZXItZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL2h0bWx2aWV3ZXItZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi9odWItZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL2h1Yi1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvaHViLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvaW1hZ2V2aWV3ZXItZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL2ltYWdldmlld2VyLWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi9pbWFnZXZpZXdlci1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL2luc3BlY3Rvci1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvaW5zcGVjdG9yLWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi9pbnNwZWN0b3ItZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi9sYXVuY2hlci1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvbGF1bmNoZXItZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL2xhdW5jaGVyLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvbG9nY29uc29sZS1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvbG9nY29uc29sZS1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvbG9nY29uc29sZS1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL2xzcC1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvbHNwLWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi9sc3AtZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi9tYWlubWVudS1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvbWFpbm1lbnUtZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL21haW5tZW51LWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvbWFya2Rvd252aWV3ZXItZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL21hcmtkb3dudmlld2VyLWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi9tYXJrZG93bnZpZXdlci1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL21hcmtlZHBhcnNlci1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvbWFya2VkcGFyc2VyLWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi9tYXJrZWRwYXJzZXItZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi9tYXRoamF4LWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi9tYXRoamF4LWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi9tYXRoamF4LWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvbWVybWFpZC1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvbWVybWFpZC1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvbWVybWFpZC1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL21ldGFkYXRhZm9ybS1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvbWV0YWRhdGFmb3JtLWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi9tZXRhZGF0YWZvcm0tZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi9ub3RlYm9vay1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvbm90ZWJvb2stZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL25vdGVib29rLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvcGx1Z2lubWFuYWdlci1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvcGx1Z2lubWFuYWdlci1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvcGx1Z2lubWFuYWdlci1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL3JlbmRlcm1pbWUtZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL3JlbmRlcm1pbWUtZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL3JlbmRlcm1pbWUtZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi9ydW5uaW5nLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi9ydW5uaW5nLWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi9ydW5uaW5nLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvc2VydmljZXMtZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL3NlcnZpY2VzLWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi9zZXJ2aWNlcy1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL3NldHRpbmdlZGl0b3ItZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL3NldHRpbmdlZGl0b3ItZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL3NldHRpbmdlZGl0b3ItZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi9zaG9ydGN1dHMtZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL3Nob3J0Y3V0cy1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvc2hvcnRjdXRzLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvc3RhdHVzYmFyLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi9zdGF0dXNiYXItZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL3N0YXR1c2Jhci1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL3Rlcm1pbmFsLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi90ZXJtaW5hbC1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvdGVybWluYWwtZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi90aGVtZS1kYXJrLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi90aGVtZS1kYXJrLWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi90aGVtZS1kYXJrLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvdGhlbWUtZGFyay1oaWdoLWNvbnRyYXN0LWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi90aGVtZS1kYXJrLWhpZ2gtY29udHJhc3QtZXh0ZW5zaW9uJyk7XG4gICAgICBleHQuX19zY29wZV9fID0gJ0BqdXB5dGVybGFiL3RoZW1lLWRhcmstaGlnaC1jb250cmFzdC1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL3RoZW1lLWxpZ2h0LWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi90aGVtZS1saWdodC1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvdGhlbWUtbGlnaHQtZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi90b2MtZXh0ZW5zaW9uJykpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGV4dCA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL3RvYy1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvdG9jLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvdG9vbHRpcC1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvdG9vbHRpcC1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvdG9vbHRpcC1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ0BqdXB5dGVybGFiL3RyYW5zbGF0aW9uLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi90cmFuc2xhdGlvbi1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvdHJhbnNsYXRpb24tZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG4gIGlmICghcXVldWVkRmVkZXJhdGVkLmluY2x1ZGVzKCdAanVweXRlcmxhYi91aS1jb21wb25lbnRzLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdAanVweXRlcmxhYi91aS1jb21wb25lbnRzLWV4dGVuc2lvbicpO1xuICAgICAgZXh0Ll9fc2NvcGVfXyA9ICdAanVweXRlcmxhYi91aS1jb21wb25lbnRzLWV4dGVuc2lvbic7XG4gICAgICBmb3IgKGxldCBwbHVnaW4gb2YgYWN0aXZlUGx1Z2lucyhleHQpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXF1ZXVlZEZlZGVyYXRlZC5pbmNsdWRlcygnQGp1cHl0ZXJsYWIvd29ya3NwYWNlcy1leHRlbnNpb24nKSkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgZXh0ID0gcmVxdWlyZSgnQGp1cHl0ZXJsYWIvd29ya3NwYWNlcy1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnQGp1cHl0ZXJsYWIvd29ya3NwYWNlcy1leHRlbnNpb24nO1xuICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIGFjdGl2ZVBsdWdpbnMoZXh0KSkge1xuICAgICAgICByZWdpc3Rlci5wdXNoKHBsdWdpbik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFxdWV1ZWRGZWRlcmF0ZWQuaW5jbHVkZXMoJ2p1cHl0ZXItc2ltcGxlLWV4dGVuc2lvbicpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBleHQgPSByZXF1aXJlKCdqdXB5dGVyLXNpbXBsZS1leHRlbnNpb24nKTtcbiAgICAgIGV4dC5fX3Njb3BlX18gPSAnanVweXRlci1zaW1wbGUtZXh0ZW5zaW9uJztcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKGV4dCkpIHtcbiAgICAgICAgcmVnaXN0ZXIucHVzaChwbHVnaW4pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkIHRoZSBmZWRlcmF0ZWQgZXh0ZW5zaW9ucy5cbiAgY29uc3QgZmVkZXJhdGVkRXh0ZW5zaW9ucyA9IGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChmZWRlcmF0ZWRFeHRlbnNpb25Qcm9taXNlcyk7XG4gIGZlZGVyYXRlZEV4dGVuc2lvbnMuZm9yRWFjaChwID0+IHtcbiAgICBpZiAocC5zdGF0dXMgPT09IFwiZnVsZmlsbGVkXCIpIHtcbiAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBhY3RpdmVQbHVnaW5zKHAudmFsdWUpKSB7XG4gICAgICAgIHJlZ2lzdGVyLnB1c2gocGx1Z2luKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihwLnJlYXNvbik7XG4gICAgfVxuICB9KTtcblxuICAvLyBMb2FkIGFsbCBmZWRlcmF0ZWQgY29tcG9uZW50IHN0eWxlcyBhbmQgbG9nIGVycm9ycyBmb3IgYW55IHRoYXQgZG8gbm90XG4gIChhd2FpdCBQcm9taXNlLmFsbFNldHRsZWQoZmVkZXJhdGVkU3R5bGVQcm9taXNlcykpLmZpbHRlcigoe3N0YXR1c30pID0+IHN0YXR1cyA9PT0gXCJyZWplY3RlZFwiKS5mb3JFYWNoKCh7cmVhc29ufSkgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbiAgfSk7XG5cbiAgLy8gMi4gUmVnaXN0ZXIgdGhlIHBsdWdpbnNcbiAgcGx1Z2luUmVnaXN0cnkucmVnaXN0ZXJQbHVnaW5zKHJlZ2lzdGVyKTtcblxuICAvLyAzLiBHZXQgYW5kIHJlc29sdmUgdGhlIHNlcnZpY2UgbWFuYWdlciBhbmQgY29ubmVjdGlvbiBzdGF0dXMgcGx1Z2luc1xuICBjb25zdCBJQ29ubmVjdGlvblN0YXR1cyA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL3NlcnZpY2VzJykuSUNvbm5lY3Rpb25TdGF0dXM7XG4gIGNvbnN0IElTZXJ2aWNlTWFuYWdlciA9IHJlcXVpcmUoJ0BqdXB5dGVybGFiL3NlcnZpY2VzJykuSVNlcnZpY2VNYW5hZ2VyO1xuICBjb25zdCBjb25uZWN0aW9uU3RhdHVzID0gYXdhaXQgcGx1Z2luUmVnaXN0cnkucmVzb2x2ZU9wdGlvbmFsU2VydmljZShJQ29ubmVjdGlvblN0YXR1cyk7XG4gIGNvbnN0IHNlcnZpY2VNYW5hZ2VyID0gYXdhaXQgcGx1Z2luUmVnaXN0cnkucmVzb2x2ZVJlcXVpcmVkU2VydmljZShJU2VydmljZU1hbmFnZXIpO1xuXG4gIGNvbnN0IGxhYiA9IG5ldyBKdXB5dGVyTGFiKHtcbiAgICBwbHVnaW5SZWdpc3RyeSxcbiAgICBzZXJ2aWNlTWFuYWdlcixcbiAgICBtaW1lRXh0ZW5zaW9ucyxcbiAgICBjb25uZWN0aW9uU3RhdHVzLFxuICAgIGRpc2FibGVkOiB7XG4gICAgICBtYXRjaGVzOiBkaXNhYmxlZCxcbiAgICAgIHBhdHRlcm5zOiBkaXNhYmxlZEV4dGVuc2lvbnNcbiAgICAgICAgLm1hcChmdW5jdGlvbiAodmFsKSB7IHJldHVybiB2YWwucmF3OyB9KVxuICAgIH0sXG4gICAgZGVmZXJyZWQ6IHtcbiAgICAgIG1hdGNoZXM6IGRlZmVycmVkLFxuICAgICAgcGF0dGVybnM6IGRlZmVycmVkRXh0ZW5zaW9uc1xuICAgICAgICAubWFwKGZ1bmN0aW9uICh2YWwpIHsgcmV0dXJuIHZhbC5yYXc7IH0pXG4gICAgfSxcbiAgICBhdmFpbGFibGVQbHVnaW5zOiBhbGxQbHVnaW5zXG4gIH0pO1xuXG4gIC8vIDQuIFN0YXJ0IHRoZSBhcHBsaWNhdGlvbiwgd2hpY2ggd2lsbCBhY3RpdmF0ZSB0aGUgb3RoZXIgcGx1Z2luc1xuICBsYWIuc3RhcnQoeyBpZ25vcmVQbHVnaW5zLCBidWJibGluZ0tleWRvd246IHRydWUgfSk7XG5cbiAgLy8gRXhwb3NlIGdsb2JhbCBhcHAgaW5zdGFuY2Ugd2hlbiBpbiBkZXYgbW9kZSBvciB3aGVuIHRvZ2dsZWQgZXhwbGljaXRseS5cbiAgdmFyIGV4cG9zZUFwcEluQnJvd3NlciA9IChQYWdlQ29uZmlnLmdldE9wdGlvbignZXhwb3NlQXBwSW5Ccm93c2VyJykgfHwgJycpLnRvTG93ZXJDYXNlKCkgPT09ICd0cnVlJztcbiAgdmFyIGRldk1vZGUgPSAoUGFnZUNvbmZpZy5nZXRPcHRpb24oJ2Rldk1vZGUnKSB8fCAnJykudG9Mb3dlckNhc2UoKSA9PT0gJ3RydWUnO1xuXG4gIGlmIChleHBvc2VBcHBJbkJyb3dzZXIgfHwgZGV2TW9kZSkge1xuICAgIHdpbmRvdy5qdXB5dGVyYXBwID0gbGFiO1xuICB9XG5cbiAgLy8gSGFuZGxlIGEgYnJvd3NlciB0ZXN0LlxuICBpZiAoYnJvd3NlclRlc3QudG9Mb3dlckNhc2UoKSA9PT0gJ3RydWUnKSB7XG4gICAgbGFiLnJlc3RvcmVkXG4gICAgICAudGhlbihmdW5jdGlvbigpIHsgcmVwb3J0KGVycm9ycyk7IH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24ocmVhc29uKSB7IHJlcG9ydChbYFJlc3RvcmVFcnJvcjogJHtyZWFzb24ubWVzc2FnZX1gXSk7IH0pO1xuXG4gICAgLy8gSGFuZGxlIGZhaWx1cmVzIHRvIHJlc3RvcmUgYWZ0ZXIgdGhlIHRpbWVvdXQgaGFzIGVsYXBzZWQuXG4gICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHJlcG9ydChlcnJvcnMpOyB9LCB0aW1lb3V0KTtcbiAgfVxufVxuIiwiLyogVGhpcyBpcyBhIGdlbmVyYXRlZCBmaWxlIG9mIENTUyBpbXBvcnRzICovXG4vKiBJdCB3YXMgZ2VuZXJhdGVkIGJ5IEBqdXB5dGVybGFiL2J1aWxkZXIgaW4gQnVpbGQuZW5zdXJlQXNzZXRzKCkgKi9cblxuaW1wb3J0ICdAanVweXRlcmxhYi9hcHBsaWNhdGlvbi1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9hcHB1dGlscy1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9jZWxsLXRvb2xiYXItZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvY2VsbHRhZ3MtZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvY29kZW1pcnJvci1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9jb21wbGV0ZXItZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvY29uc29sZS1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9jc3Z2aWV3ZXItZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvZGVidWdnZXItZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvZG9jbWFuYWdlci1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9kb2N1bWVudHNlYXJjaC1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9leHRlbnNpb25tYW5hZ2VyLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL2ZpbGVicm93c2VyLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL2ZpbGVlZGl0b3ItZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvaGVscC1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9odG1sdmlld2VyLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL2h1Yi1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9pbWFnZXZpZXdlci1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9pbnNwZWN0b3ItZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvamF2YXNjcmlwdC1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9qc29uLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL2xhdW5jaGVyLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL2xvZ2NvbnNvbGUtZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvbHNwLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL21haW5tZW51LWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL21hcmtkb3dudmlld2VyLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL21hcmtlZHBhcnNlci1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9tYXRoamF4LWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL21lcm1haWQtZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvbWV0YWRhdGFmb3JtLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL25vdGVib29rLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL3BkZi1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9wbHVnaW5tYW5hZ2VyLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL3JlbmRlcm1pbWUtZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvcnVubmluZy1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9zZXR0aW5nZWRpdG9yLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL3Nob3J0Y3V0cy1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi9zdGF0dXNiYXItZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvdGVybWluYWwtZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvdG9jLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ0BqdXB5dGVybGFiL3Rvb2x0aXAtZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvdHJhbnNsYXRpb24tZXh0ZW5zaW9uL3N0eWxlL2luZGV4LmpzJztcbmltcG9ydCAnQGp1cHl0ZXJsYWIvdWktY29tcG9uZW50cy1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi92ZWdhNS1leHRlbnNpb24vc3R5bGUvaW5kZXguanMnO1xuaW1wb3J0ICdAanVweXRlcmxhYi93b3Jrc3BhY2VzLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5qcyc7XG5pbXBvcnQgJ2p1cHl0ZXItc2ltcGxlLWV4dGVuc2lvbi9zdHlsZS9pbmRleC5jc3MnO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9