/**
 * @fileOverview Contains the jMatrixBrowse configuration.
 * 
 * This reads the configuration set in the DOM by the user as per the options 
 * defined in https://github.com/pulkit110/jMatrixBrowse/wiki/Use
 * 
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com>
*/

var jMatrixBrowseNs = jMatrixBrowseNs || {};

(function (jQuery, jMatrixBrowseNs) {

  var _settings;      // user settings
  var _api;           // api manager
  var _dataReloadStategy = jMatrixBrowseNs.Constants.DEFAULT_DATA_RELOAD_STRATEGY;

  /**
   * Validates the options defined by the user.
   * @param {Object} options - User's options for the plugin.
   * @returns {Boolean} true if the options are valid.
   */
  function validate(options) {   
    if (options.boo_jMatrixBrowser !== true && options.boo_jMatrixBrowser !== true) {
      throw "data-jmatrix_browser invalid";
    }
    if (options.str_api === undefined || options.str_api === null) {
      throw "data-api invalid.";
    }
    if (options.str_initialWindowSize && !(/\s*\d+\s*,\s*\d+\s*/).test(options.str_initialWindowSize)) {
      throw "data-initial-window-size invalid."
    }
    if (options.str_initialWindowPosition && !(/\s*\d+\s*,\s*\d+\s*/).test(options.str_initialWindowPosition)) {
      throw "data-initial-window-size invalid."
    }
    return true;
  }
  
  /**
   * Get user defined options from data-* elements.
   * @param {jQuery object} elem - the element to retrieve the user options from.
   * @returns {Object} options - User's options for the plugin.
   * @returns {boolean} options.boo_jMatrixBrowser - Is jMatrixBrowse active for the container.
   * @returns {string} options.str_api - URI for the API.
   * @returns {string} options.str_initialWindowSize - comma separated window size as (width, height).
   * @returns {string} options.str_initialWindowPosition - comma separated window position as (row,col).
   */
  function getUserOptions(elem) {
    var options = {
      boo_jMatrixBrowser: (elem.attr('data-jmatrix_browser') === 'true'),
      str_api: elem.attr('data-api'),
      str_initialWindowSize: elem.attr('data-initial-window-size'),
      str_initialWindowPosition: elem.attr('data-initial-window-position'),
      boo_snap: elem.attr('data-snap') === 'true'
    };
    if (validate(options))
      return options;
    else
      throw "Unable to get user options.";
  }

  /**
   * Extend the user's settings with defaults.
   * @returns {Object} options - User's options for the plugin.
   * @returns {boolean} options.boo_jMatrixBrowser - Is jMatrixBrowse active for the container.
   * @returns {string} options.str_api - URI for the API.
   * @returns {string} options.str_initialWindowSize - comma separated window size as (width, height).
   * @returns {string} options.str_initialWindowPosition - comma separated window position as (row,col).
   */
  function extendDefaults(options) {
    return jQuery.extend({
      str_initialWindowPosition: jMatrixBrowseNs.Constants.INITIAL_WINDOW_POSITION,
      str_initialWindowSize: jMatrixBrowseNs.Constants.INITIAL_WINDOW_SIZE,
      boo_snap: jMatrixBrowseNs.Constants.DEFAULT_OPTION_SNAP
    }, options);
  }

  /**
   * Set the settings object.
   * @param {Object} settings
   */
  function setSettings(settings) {
    _settings = settings;
  }

 /**
   * Manages configurations for jMatrixBrowse.
   *
   * @param {jQuery Object} elem - element that initiated jMatrixBrowse.
   * @param {Object} api - api manager for making requests to api.
   * @class Configuration
   * @memberOf jMatrixBrowseNs
   */
  jMatrixBrowseNs.Configuration = function(elem, api) {
    var that = this;

    _api = api;

    // Get user options
    var options = getUserOptions(elem);

    // Extending user options with application defaults
    _settings = extendDefaults(options);

    /**
     * Gets settings object.
     * @returns {Object} User settings for jMatrixBrowse.
     * See (https://github.com/pulkit110/jMatrixBrowse/wiki/Use) for list of available settings.
     */
    that.getSettings = function() {
      return _settings;
    };

    /**
     * Gets window size from settings.
     * @returns {Object} size - size of the window.
     * @returns {Number} size.width - width of the window.
     * @returns {Number} size.height - height of the window.
     */
    that.getWindowSize = function() {
      if (_settings && _settings.str_initialWindowSize) {
        var  position = jMatrixBrowseNs.Utils.parsePosition(_settings.str_initialWindowSize);
        return {
          height: position.row,
          width: position.col
        };
      }
      return null;
    };

    /**
     * Gets position of window.
     * @returns {Object} position - position of the top-left corner of window.
     * @returns {Number} position.row - row index of the position.
     * @returns {Number} position.col - column index of the position.
     */
    that.getWindowPosition = function() {
      if (_settings && _settings.str_initialWindowPosition) {
        var  position = jMatrixBrowseNs.Utils.parsePosition(_settings.str_initialWindowPosition);
        return position;
      }
      return null;
    };

    /**
     * Get the window end points which has given point at its top left corner.
     * @param {Object} position - position of the cell.
     * @param {Number} position.row - row of the cell.
     * @param {Number} position.col - column of the cell.
     * @returns {Object} window - Object representing the window coordinates.
     * @returns {Number} window.row1 - row index of the top left corner.
     * @returns {Number} window.col1 - column index of the top left corner.
     * @returns {Number} window.row2 - row index of the bottom right corner.
     * @returns {Number} window.col2 - column index of the bottom right corner.
     */
    that.getCellWindow = function(position) {
      var size = _api.getMatrixSize();
      if (size == undefined) {
        throw "Unable to get matrix size";
        return null;
      }

      var windowSize = this.getWindowSize();
      if (windowSize == undefined) {
        throw "Unable to get window size.";
        return null;
      }

      return {
        row1: position.row - that.getNumberOfBackgroundCells(),
        col1: position.col - that.getNumberOfBackgroundCells(),
        row2: Math.min(position.row + windowSize.height, size.height),
        col2: Math.min(position.col + windowSize.width, size.width)
      };
    };

    /**
     * Gets the number of background cells to use.
     * @returns nBackgroundCells The number of background cells.
     */
    that.getNumberOfBackgroundCells = function() {
      return jMatrixBrowseNs.Constants.N_BACKGROUND_CELLS;
    };

    /**
     * Gets the number ata reload strategy to use.
     * @returns dataReloadStrategy Reload strategy (possible options defined in Constants)
     */
    that.getDataReloadStrategy = function() {
      return _dataReloadStategy;
    };
    
    that.isSnapEnabled = function() {
      return _settings.boo_snap;
    };

    return that;
  };

})(jQuery, jMatrixBrowseNs);