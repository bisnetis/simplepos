var Downloader = function Downloader() {
    this.className = "Downloader";
    this.config = {
        completions: [],
        failures: [],
        rootdir: '',
        textDownloadComplete: 'Download Complete!',
        textDownloading: 'Downloading',
        textFile: 'file',
        textFiles: 'files',
        textDownloadingError: 'Something went wrong with the download and a report has been sent.',
        textDownloadButton: 'Download',
        textMissingPlugin: 'File transfer plug in is missing. Downloads may not be complete.',
        textMissingContent: 'Please download the most recent content.',
        textUnavailableMedia: '<p>This media is unavailable.</p>',
        textUnsupportedFileType: 'That file type is not currently supported.',
        download_links: [
            "http://techslides.com/demos/sample-videos/small.mp4"
        ],
        test: 'testing!',
        downloadCounter: true,
        progressBar: true,
        downloadCounterId: 'downloadCounter',
        progressBarId: 'progressContainer'
    };
};

Downloader.prototype = {
    getFileSystem: function() {
        var self = this;
        document.addEventListener('deviceready', function() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemSuccess, fileSystemFail);
            function fileSystemSuccess(fileSystem) {
                self.config.rootdir = fileSystem.root.toURL();
            }
            function fileSystemFail(evt) {
                //Unable to access file system
                alert(evt.target.error.code);
            }
        });
    },

    test: function() {
        return this.config.test;
    },

    setDownloadLinks: function(links) {
        if (links instanceof Array) {
            this.config.download_links = links;
        }
        else {
            this.config.download_links = links;
        }
    },
    downloadSingle: function(url,folder) {
        var fpSingle = '';
        var ext = url.substr(url.lastIndexOf('.') + 1);
        var fileName = url.substr(url.lastIndexOf('/') + 1);
        fileName = fileName.split('.')[0];
        if (folder) {
            fpSingle = this.config.rootdir + folder + fileName + "1" + "." + ext; // file path and name
        }
        else {
            fpSingle = this.config.rootdir + fileName + "." + ext; // file path and name
        }
        localStorage.setItem('fpSingle',fpSingle);

        // call file transfer function
        this.filetransfer(url, fpSingle, 1);
        var self = this;
        setTimeout(function() {
            if (self.config.failures.length > 0) {
                alert(self.config.textDownloadingError);
            }
            self.config.failures = [];
        }, 500);
    },
    downloadMultiple: function() {
        // the order that these links are listed is the order that corresponds to the content.
        // e.g. the first link in this array will correspond to the string 'video01' in the content.
        var dl_links = this.config.download_links;
        var numDownloads = dl_links.length;
        var downloadContainer = document.getElementById(this.config.downloadCounterId);

        downloadContainer.innerHTML = "Downloading " + numDownloads + " files...";
        this.config.failures = [];
        this.config.completions = [];

        fp = [];
        for (var i = 0; i < numDownloads; i++) {
            var fileName = dl_links[i].substr(dl_links[i].lastIndexOf('/') + 1);
            fileName = fileName.split('.')[0];
            var ext = dl_links[i].substr(dl_links[i].lastIndexOf('.') + 1);
            fp.push(this.config.rootdir + fileName + ".mp4"); // file path and name
            localStorage.setItem('fp',JSON.stringify(fp));

            // call file transfer function
            this.filetransfer(dl_links[i], fp[i], numDownloads);
        }
        var self = this;
        setTimeout(function() {
            if (self.config.failures.length > 0) {
                alert(self.config.textDownloadingError);
            }
            self.config.failures = [];
        }, 500);
    },
    findElements: function(fileType,content) {
        var elements = [];

        // currently supported file types: video, audio
        // should follow the format of "video_small.mp4"
        var reg = new RegExp(fileType+"_(.*)_","g");
        var found = String(content.match(reg));

        elements.push(found);
        elements = elements[0].split(',');
        return elements;

    },
    replaceElements: function(fileType,content,elements) {
        var elemFileNames = [];
        var elemNew = [];
        console.log("elements: "+elements);
        for (i = 0; i < elements.length; i++) {
            // access local storage if files have already been downloaded
            if (typeof localStorage.fp === 'undefined') {
                alert(this.config.textMissingContent);
                return content;
            }
            else if (elements[0] === "null") {
                return content;
            }
            else {
                fp = JSON.parse(localStorage.fp);
            }
            // create an array of the ID numbers
            var elemFileName = new RegExp(fileType+"_(.*)_");
            elemFileNames.push(elements[i].match(elemFileName)[1]);
            var fileIndex = fp.indexOf(this.config.rootdir+elemFileNames[i]);
            console.log(this.config.rootdir+elemFileNames[i]);
            var fileSrc = fp[fileIndex];
                if (fileType === "video") {
                    elemTag = "<video controls style='max-width:100%;'><source type='video/mp4' src='"+fileSrc+"'/></video>";
                    console.log(elemTag);
                }
                else if (fileType === "audio") {
                    elemTag = "<audio controls style='max-width:100%;'><source type='audio/mpeg' src='"+fileSrc+"'/></audio>";
                }
                else {
                    alert(this.config.textUnsupportedFileType);
                    return content;
                }
            elemNew.push(elemTag);
            if (elemNew[i].indexOf("undefined") === -1) {
                content = content.replace(elements[i],elemNew[i]);
            }
            else {
                content = content.replace(elements[i],this.config.textUnavailableMedia);
            }
        }
        return content;
    },

    insert: function(fileType,content) {
        var thingsToReplace = this.findElements(fileType,content);
        var content = this.replaceElements(fileType,content,thingsToReplace);

        return content;
    },
    constructDownloadCounter: function(ftObject, numDownloads) {
      /*var self = this;
      var downloadContainer = document.getElementById(self.config.downloadCounterId);

      downloadContainer.innerHTML = self.config.textDownloading + " " + numDownloads + " " + self.config.textFiles + "...";
      console.log(downloadContainer.innerHTML);*/
      /*ftObject.onprogress = function(progressEvent) {
        if (progressEvent.lengthComputable) {
          var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);

          if (perc === 100) {
            setTimeout(function() {
              var numDownloadsRemaining = numDownloads - self.config.completions.length;

              if (numDownloadsRemaining > self.config.failures.length) {
                if (numDownloads > 1) {
                  downloadContainer.innerHTML = self.config.textDownloading + " "+numDownloadsRemaining+" "+self.config.textFiles + "...";
                }
                else if (numDownloadsRemaining === 1) {
                  downloadContainer.innerHTML = self.config.textDownloading + " 1 " + self.config.textFile + "...";
                }
              } else if (self.config.failures.length > 0) {
                downloadContainer.innerHTML = "" + self.config.failures.length + " " + self.config.textFiles + " failed to download, please try again";
              }
            }, 1000);
          }
        }
      };*/
    },

    constructProgressBar: function(ftObject, numDownloads) {
        // set the ID of your html progress bar div/span in the config variables


        var progressContainer = document.getElementById(this.config.progressBarId);
            progressContainer.setAttribute("style","display: block"); 
        var progress = document.createElement("div");
            progress.setAttribute("class","progress");
            progressContainer.appendChild(progress);
        var progressbar = document.createElement("div");
            progressbar.setAttribute("class","progress-bar progress-bar-striped");
            progressbar.setAttribute("aria-valuemin","0");
            progressbar.setAttribute("aria-valuemax","100");
            progressbar.setAttribute("role","progressbar");
            progress.appendChild(progressbar);

        ftObject.onprogress = function(progressEvent) {
            
            if (progressEvent.lengthComputable) {
                var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                progressbar.setAttribute("style","width: "+perc+"%");
                progressbar.setAttribute("aria-valuenow",perc);

                if (perc === 100) {
                    setTimeout(function() {
                        progress.setAttribute("class","progress fade");

                        progressContainer.setAttribute("style","display: none");
                    }, 1000);
                }
            }
        };
    },

    filetransfer: function(file,filepath,numFiles) {
        var fileTransfer = new FileTransfer();
        var self = this;
        if (self.config.downloadCounter === true) {
            self.constructDownloadCounter(fileTransfer,numFiles);
        }
        if (self.config.progressBar === true) {
            self.constructProgressBar(fileTransfer,numFiles);
        }
        if (typeof FileTransfer === 'undefined') {
            alert(self.config.textMissingPlugin);
            return;
        }
        console.log("downloading: " + file);

        function reportStatus() {
          var downloadContainer = document.getElementById(self.config.downloadCounterId);

          if (self.config.failures.length > 0 &&
              numFiles - self.config.completions.length === self.config.failures.length) {
            downloadContainer.innerHTML = "" + self.config.failures.length + " files had errors, please retry.";
          } else {
            downloadContainer.innerHTML = "files: " +
                                          (numFiles - self.config.completions.length) +
                                          " remaining, " +
                                          self.config.failures.length +
                                          " had errors";
          }
        }
        
        // only download if the file isn't found
        window.resolveLocalFileSystemURL(filepath, function() {
            self.config.completions.push(file);
            reportStatus();

            if (self.config.completions.length === self.config.download_links) {
              document.getElementById(self.config.downloadCounterId).innerHTML = "Complete!";
            }
          }, function() {
          fileTransfer.download(
              file,
              filepath,
              function(entry) {
                  self.config.completions.push(file);
                  reportStatus();
                  console.log("" + self.config.completions.length + " download complete: " + entry.fullPath);

                  if (self.config.completions.length === numFiles) {
                      alert(self.config.textDownloadComplete);
                  }
              },
              function(error) {
                  console.log("download error source " + error.source);
                  self.config.failures.push(file);
                  reportStatus();
                  console.log("failure count: " + self.config.failures.length);
              }
          );
        });
    }
};
