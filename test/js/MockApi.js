/**
 * @fileOverview Contains the code for mock api that responds to a request.
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com> 
*/

/**
 * Mimics the API and gives response for requests. 
 * 
 * @class MatrixGenerator
 * See API Details (https://github.com/pulkit110/jMatrixBrowse/wiki/API-Details)
 * for more details.
 * 
 * @param {Number} [height] - height of the matrix to answer requests for. optional. default = 100.
 * @param {Number} [width] - width of the matrix to answer requests for. optional. default = 100.
 */
function MockApi(height, width) {
  var matrixGenerator = new MatrixGenerator('sequential');
  matrixGenerator.init((height==undefined)?1000:height, (width==undefined)?1000:width);
  
  /**
   * Get a response for given request.
   * @param {Object} request - the request.
   * @returns {Object} response - the response to the request.
   */
  this.getResponse = function(request) {
    var mat_testMatrix = matrixGenerator.test_getMatrix();
    var arr_rowLabels = matrixGenerator.test_getMatrixRowLabels();
    var arr_colLabels = matrixGenerator.test_getMatrixColumnLabels();

    // TODO: Check for undefined variables
    var row1 = request.row1;
    var row2 = request.row2;
    var col1 = request.col1;
    var col2 = request.col2;

    var obj_response = {
      "matrix" : {
        "height" : mat_testMatrix.length,
        "width" : mat_testMatrix[0].length	// TODO: Check if length is atleast 1
      },
      "row" : {
        "labels" : []
      },
      "column" : {
        "labels" : []
      },
      "data" : [
    ]
    };

    for (var i=row1; i <= row2; ++i) {
      obj_response.row.labels.push(arr_rowLabels[i]);
      obj_response.data.push([]);
      for (var j=col1; j <= col2; ++j) {
        if (i === row1) {
          obj_response.column.labels.push(arr_colLabels[j]);
        }
        obj_response.data[i-row1].push(mat_testMatrix[i][j]);
      };
    };

    return obj_response;
  }

  /**
   * Gets a response for given request and calls the callback on success.
   * @param {Object} request - the request.
   * @param {function} callback - the callback function.
   */
  this.getResponseDataAsync = function(request, callback) {
    var response = this.getResponse(request);
    callback.call(this, response.data);
  };

  /**
   * Gets the response data for given request and calls the callback on success.
   * @param {Object} request - the request.
   * @param {function} callback - the callback function.
   */
  this.getResponseAsync = function(request, callback) {
    var response = this.getResponse(request);
    callback.call(this, response);
  };

    /**
     * Get matrix size from api. 
     * @returns {Object} size - size of the matrix. 
     * @returns {Number} size.width - width of the matrix. 
     * @returns {Number} size.height - height of the matrix.
     */
    this.getMatrixSize = function() {
      var response = this.getResponse({
        'row1': 0,
        'col1': 0,
        'row2': 0,
        'col2': 0
      });
      if (response)
        return response.matrix;
    };
};