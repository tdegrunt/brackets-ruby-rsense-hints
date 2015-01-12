/*jslint vars: true */
/*global define, $, brackets, window, console */

define(function (require, exports, module) {
  'use strict';
  
  var HTMLUtils  = brackets.getModule('language/HTMLUtils');
  
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
    
    var pos     = editor.getCursorPos(),
        tagInfo = HTMLUtils.getTagInfo(editor, pos);
    
//    if (this.hasLibraryHints(tagInfo) || this.hasVersionHints(tagInfo)) {
      return true;
//    } else {
//      return false;
//    }
  };
  
  /**
   * Determines if library hints are available for the current
   * editor context.
   */
  RSenseHintProvider.prototype.hasLibraryHints = function (tagInfo) {
    var pos         = this.editor.getCursorPos(),
        tagStartPos = this.editor.document.getLine(pos.line);
    
    var result = (tagInfo.tagName === 'script' || tagInfo.tagName === 'link') &&
        tagInfo.position.tokenType === 'attr.name' &&
        tagInfo.attr.name.length === 0;

    return result;
  };
  
  /**
   * Determines if version hints are available for the current
   * editor context.
   */
  RSenseHintProvider.prototype.hasVersionHints = function (tagInfo) {
    return this.libraryList.findById(tagInfo.attr.name) !== null;
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

    console.log("this.editor.document ", this.editor.document.file.fullPath);
      
    var command = {
        "command": "code_completion",
        "project": "spec/fixtures/test_gem",
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
      contentType: 'application/json', 
      success: function( data ) {
      console.log( data );
      completions = data.completions;
    },
      dataType: 'json'
    });
    
    if (completions.length > 0) {
      completions.forEach(function(c) {
        hints.push(c.name);
      })
    }
    
    return {hints: hints, match: "", selectInitial: false, handleWideResults: false};
  };
  
  /**
   * Returns a list of library hints for the current editor 
   * context.
   */
  RSenseHintProvider.prototype.getLibraryHints = function (tagInfo) {
    var filter = new RegExp(tagInfo.attr.name, 'i');
    
    var libraryNames = this.libraryList.getLibraryNamesByType(tagInfo.tagName)
    .filter(function (libraryName) {
      return filter.test(libraryName);
    });
    
    if (tagInfo.attr.name.length !== 0) {
      // Sort based on the location of the current attribute
      libraryNames.sort(compareByStrPos);
    }
    
    /**
     * Compares two strings based on their character positions.
     */
    function compareAlphabetically(a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    }

    /**
     * Compares two string based on the position of the
     * attribute name `tagInfo.attr.name` (RegExp `filter`).
     * This method uses a regular expression to for its
     * case-insensitivity flag.
     */
    function compareByStrPos(a, b) {
      var difference = filter.exec(a).index - filter.exec(b).index
      
      if (difference === 0) {
        return a.localeCompare(b);
      } else {
        return difference;
      }
    }
    
    return {
      hints: libraryNames,
      match: tagInfo.attr.name,
      selectInitial: true,
      handleWideResults: false
    };
  };
  
  /**
   * Returns a list of version hints for the library in the 
   * current editor context.
   */
  RSenseHintProvider.prototype.getVersionHints = function (library) {
    if (library === null) {
      return null;
    }
    
    return {
      hints: library.getVersions(),
      match: null,
      selectInitial: true,
      handleWideResults: false
    };
  };
  
  /**
   * Inserts a hint into the current editor context.
   *
   * @param {string} hint
   * The hint selected by the user.
   *
   * @return {boolean}
   * Indicates whether the manager should follow hint 
   * insertion with an explicit hint request.
   */
  RSenseHintProvider.prototype.insertHint = function (hint) {
    var pos     = this.editor.getCursorPos(),
        tagInfo = HTMLUtils.getTagInfo(this.editor, pos),
        library = this.libraryList.findById(tagInfo.attr.name);
    
    if (library === null) {
      this.insertLibraryId(hint);
      return true;
    } else {
      this.insertLibrarySnippet(hint);
      return false;
    }
  }  

  exports.RSenseHintProvider = RSenseHintProvider;
});