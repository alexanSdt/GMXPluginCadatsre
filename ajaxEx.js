var AjaxEx = function () {
    //это массив аджаксов, который можно отменять(xhr.abort()).
    this._ajaxArr = [];
    

    this.ajax = function (url, params, success, error) {
        var xhrObj = $.ajax(url, params).done(success).fail(error);
        this._ajaxArr.push(xhrObj);
        return xhrObj;
    };

    this.abort = function () {
        var arr = this._ajaxArr;
        for (var i = 0; i < arr.length; i++) {
            var arr_i = arr[i];
            if (arr_i) {
                arr_i.abort();
                arr[i] = null;
            }
        }
        arr.length = 0;
    };
};