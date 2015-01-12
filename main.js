/*jslint vars: true */
/*global define, $, brackets, window, console */

define(function (require, exports, module) {
  'use strict';
  
  // Brackets modules
  var CodeHintManager = brackets.getModule('editor/CodeHintManager'),
      ExtensionUtils  = brackets.getModule('utils/ExtensionUtils');
  
  // Extension modules
  var RSenseHintProvider = require('modules/RSenseHintProvider').RSenseHintProvider;
  
  /**
   * Registers a hint provider for the extension.
   */
  var rsenseHintProvider = new RSenseHintProvider();
  CodeHintManager.registerHintProvider(rsenseHintProvider, ['ruby'], 10);
});