var generalbot = {
    dirs : [
        "applicationDirectory",
        "applicationStorageDirectory",
        "dataDirectory",
        "cacheDirectory",
        "externalApplicationStorageDirectory",
        "externalDataDirectory",
        "externalCacheDirectory",
        "externalRootDirectory",
        "tempDirectory",
        "syncedDataDirectory",
        "documentsDirectory",
        "sharedDirectory"
    ],
    
    showSplash : function (title, content, size) {
        var $modal = $('#' + size + '_modal');
        var $modal_content = $('#' + size + '_modal_content');
        $modal_content.html('');
        
        if (title !== '' && title !== null) {
            $modal_content.append("<div class='modal-header'><h4 class='modal-title'>" + title + "</h4></div>");
        }
        
        $modal_content.append("<div class='modal-body'>" + content + "</div>");
        
        $modal_content.append("<div class='modal-footer'><button type='button' class='btn btn-default' data-dismiss='modal'>Okay</button></div>");
        
        $modal.modal('show');
    },
    
    listDirectories : function () {
        var dir_length = this.dirs.length;
        var paths = [];
        
        for (var x = 0; x < dir_length; x++) {
            if (typeof cordova.file[this.dirs[x]] !== 'undefined' && typeof cordova.file[this.dirs[x]] !== null) {
                paths.push(this.dirs[x] + " : " + cordova.file[this.dirs[x]]);
            }
        }
        
        return paths.join('<br>');
    }
};