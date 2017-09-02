var filebot = {
    x : null,
    y : null,
    
    registerError : function (error) {
        //console.log("Unsuccessful download : [SOURCE:" + error.source() + "] [TARGET:" + error.target + "] [CODE:" + error.code + "]");
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("file:Unsuccessful download : [SOURCE:" + error.source() + "] [TARGET:" + error.target + "] [CODE:" + error.code + "]"); }
        filebot.y += 1;
    },
    
    registerSuccess : function (entry) {
        var url = entry.toURL();
        //console.log("Successful download : " + url);
        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('file:Successful download : ' + url); }
        //$('#result_image').attr('src', url);
        filebot.x += 1;
    },
    
    downloadFile : function (data) {
        var fileTransfer = new FileTransfer();
        var file_count = data.url.length;
        filebot.x = 0; //counter for successful downloads
        filebot.y = 0; //counter for unsuccessful downloads
        
        for (var y = 0; y < file_count; y++) {
            fileTransfer.download(
                data.url[y].url,
                cordova.file.dataDirectory + data.url[y].name,
                filebot.registerSuccess,
                filebot.registerError,
                false
            );
        }
    },
    
    listDir : function (path, fn, fn2) {
        window.resolveLocalFileSystemURL(
            path,
            function (fileSystem) {
                var reader = fileSystem.createReader();
                reader.readEntries(
                    function (entries) {
                        //console.log(JSON.stringify(entries));
                        console.log("File listing for " + path);
                        for (var x = 0; x < entries.length; x++) {
                            if (entries[x].isFile === true) {
                                //console.log("[FILE] " + entries[x].name);
                                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('file:[FILE] ' + entries[x].name); }
                                //console.log("<a onclick='filebot.showImage($(this));'>" + entries[x].nativeURL + "</a>");
                            } else if (entries[x].isDirectory) {
                                //console.log("[DIR] " + entries[x].name);
                                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('file:[DIR] ' + entries[x].name); }
                            }
                        }
                        //return entries;
                        if (typeof fn !== 'undefined') {
                            fn(entries);
                        }
                        if (typeof fn2 !== 'undefined') {
                            fn2(entries);
                        }
                    },
                    function (error) {
                        console.log(error);
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('file:[error] ' + error); }
                    }
                );
            },
            function (error) {
                console.log(error);
                //return entries;
                if (typeof fn !== 'undefined') {
                    fn(null);
                }
                if (typeof fn2 !== 'undefined') {
                    fn2(null);
                }
            }
        );
    },
    
    removeFile : function (path, filename) {
        window.resolveLocalFileSystemURL(
            path,
            function (fileSystem) {
                fileSystem.getFile(
                    filename,
                    {
                        create : false
                    },
                    function (fileEntry) {
                        fileEntry.remove(
                            function () {
                                //console.log("File " + path + filename + " deleted!");
                                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("file:File " + path + filename + " deleted!"); }
                            },
                            function (error) {
                                //console.log("File " + path + filename + " NOT deleted! [ERROR:" + error.code + "]");
                                if(databasebot.mode_debug === "yes"){ databasebot.debugConsole("file:File " + path + filename + " NOT deleted! [ERROR:" + error.code + "]"); }
                            }
                        );
                    },
                    function (error) {
                        //console.log("ERROR:" + error.code);
                        if(databasebot.mode_debug === "yes"){ databasebot.debugConsole('file:[error] ' + error.code); }
                    }
                );
            }
        );
    },
    
    showImage : function ($context) {
        $('#result_image').attr('src', $context.html());
        //alert("'" + $context.html() + "'");
    }
};

/*
    
    window.requestFileSystem(type, size, successCallback, opt_errorCalback);
        //Parameters__
        * type              :   window.TEMPORARY | window.PERSISTENT
        * size              :   in bytes
        * successCallback   :   function to be invoked on successful request of file system
                                passed a FileSystem object
        * opt_errorCallback :   (optional) function to be invoked on unsuccessful request                           of file system. Passed a FileError object
        //General notes__
        * new storage created for app
        * file system is sandboxed (apps don't share data)
        * cannot read/write data to arbitrary folders (eg: My Pictures, My Documents,..)
    
    FileTransfer.download(source, target, successCallback, errorCallback, trustAllHosts, options);
        //Parameters__
        * source            :   URL of server to download the file 
                                As encoded by encodeURI()
        * target            :   FileSystem URL representing the file on the device
                                may be the full path of the file on the device
        * successCallback   :   function to be invoked if download successful
                                Passed a FileEntry object
        * errorCallback     :   a function to be invoked if error retrieving file
                                Passed a FileTransferError object
        * trustAllHosts     :   (optional) (default: false) 
                                accept all security certificates
                                not recommended for production use
        * options           :   currently only supports headers (eg: basic authorization)
    
    Entries return
        * array of entry objects
        * entry object :
            //Properties
            * isFile        : boolean
            * isDirectory   : boolean
            * name          : string (file name)
            * fullPath      : string (eg: '/myfile.jpg')
            * filesystem    : string
            * nativeURL     : string (fully qualified path to file / directory)
*/