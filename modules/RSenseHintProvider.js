/*jslint vars: true */
/*global define, $, brackets, window, console */

define(function (require, exports, module) {
  'use strict';
  
  var HTMLUtils  = brackets.getModule('language/HTMLUtils');
  var ProjectManager = brackets.getModule('project/ProjectManager');
  
  /**
   * Represents a CodeHintProvider
   *
   * @param {LibraryList}
   * A LibraryList instance containing the available
   * libraries.
   */
  function RSenseHintProvider() {
    //this.libraryList = libraryList;
  }
  
  /**
   * Determines whether hints can be offered given the
   * current editor context.
   *
   * @param {Editor} editor
   * A non-null editor object for the active window.
   *
   * @param {string} implicitChar
   * Null if the hinting request was explicit,
   * otherwise a single character that represents the last 
   * insertion and that indicates an implicit hinting request.
   *
   * @return {boolean} 
   * True if hints can be provided, otherwise false.
   */
  RSenseHintProvider.prototype.hasHints = function (editor, implicitChar) {
    this.editor = editor;
    
    // For now just return true
    return true;
  };
  
  /**
   * Returns a list of available hints for the current editor
   * context.
   *
   * @param {string} implicitChar
   * Null, if the request to update the hint list was a result
   * of navigation, otherwise a single character that represents
   * the last insertion.
   *
   * @return {object}
   * {jQuery.Deferred|{
   *    hints: Array.<string|jQueryObject>,
   *    match: string,
   *    selectInitial: boolean,
   *    handleWideResults: boolean
   * }}
   */
  RSenseHintProvider.prototype.getHints = function (implicitChar) {
    var pos     = this.editor.getCursorPos(),
        document = this.editor.document;

    console.log("this.editor", this.editor);
      
    var command = {
        "command": "code_completion",
        "project": ProjectManager.getProjectRoot().fullPath,
        "file": document.file.fullPath,
        "code": document.getText(),
        "location": {
            "row": 1+pos.line,
            "column": 1+pos.ch
        }
    }

    console.log( command );

    var hints = [];
    var completions = [];

    $.ajax({
      type: "POST",
      url: "http://localhost:47367",
      data: JSON.stringify(command),
      contentType: 'application/json; charset=utf-8', 
      success: function( data ) {
        console.log( data );
        completions = data.completions;
      },
      dataType: 'json'
    });
    
    if (completions.length > 0) {
      completions.forEach(function(c) {
        hints.push(c.name);
      });
    }
    
    return {hints: hints, match: "", selectInitial: false, handleWideResults: false};
  };

  exports.RSenseHintProvider = RSenseHintProvider;
});