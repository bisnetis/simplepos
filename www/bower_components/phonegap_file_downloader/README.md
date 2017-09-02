=======
PhoneGap File Downloader/Reader
====================


This library creates an object "files" that has a method to download and insert the downloaded files into app content. 

Key dependencies:
-----------------
- Cordova 


Installation process:

1. Run
`bower install phonegap-file-downloader`

2. Install necessary Cordova plugins if you haven't done so already. In your project directory, run from the command line:
```
cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-file.git

cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-file-transfer.git
```

3. Add `<access origin="*" />` to your config.xml file.


Usage:
---------------

Initial Setup:
-------
Upon initial app installation, any files that you will want to insert into content will have to be downloaded from a remote server. 

If using the Downloader with a cordova phone, you will want to first invoke the method Downloader.getFileSystem as to set the rootpath of the phone where the files will be downloaded/retrieved.

The URLs to the files can be changed by invoking the method "downloader.setDownloadLinks(links)" with 'links' as an array or a single URL.

For example:
```
var dl = new Downloader();
dl.getFileSystem();
var links = [
		"http://example.com/funny.mp4",
		"http://example.com/mediocre.mp4",
		"http://example.com/sad.mp4"
	];
dl.setDownloadLinks(links);
```

Config:
-------

Config settings can be found in the Downloader.config object. Mutable values include text (for internationalization considerations) and options to configure download counters/progress bars.

Text fields include:
```
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
```

If you would like to enable/disable the downloader counter or progress bars, you can set the boolean as follows:

```
dl.config.progressBar = true/false;
dl.config.downloadCounter = true/false;
```

If using the download counter/progress bar, you can also set the ID of which DOM elements for the Downloader to manipulate. By default, they are set as 'downloadCounter' and 'progressContainer'.

```
dl.config.downloadCounterId = 'myDownloadId';
dl.config.progressBarId = 'myProgressId';
```

Replacing static content with media:
-------
The files.insert method currently takes "video" and "audio" as arguments of file types. 

This will replace any static content of video_[filename]_ with your chosen download links above. The filename in the brackets corresponds to the file name of the downloaded video.

For example
```
var downloader = new Downloader();
sampleText = "lorem ipsum video_mediocre.mp4_ lorem lorem video 01 lorem video_funny.mp4_";

sampleText = downloader.insert('video',sampleText);
```
This will result in video_mediocre.mp4_ displaying the mediocre.mp4 and video_funny.mp4_ displaying funny.mp4

Downloading Single/Multiple Files
---------------------------------

To download multiple files, set an array of links, and set downloaderGlobal.download_links to that array (as shown above).

Then you can call the function downloadMultiple() after creating a new instance of Downloader.
```
var downloader = new Downloader();
downloaderGlobal.download_links = [
		"http://example.com/funny.mp4",
		"http://example.com/mediocre.mp4",
		"http://example.com/sad.mp4"
	];
downloader.downloadMultiple();
```

For a single file, you can call the function downloadSingle with the target URL and optional argument of a folder path.

```
downloadSingle("http://www.example.com/picture.png")
downloadSingle("http://www.example.com/specific_picture.png","/www/images");
```

Progress Bars
-------------
Where you want a progress bar, add the following markup:
```
<div id="passThisIdToConfig" style="display: none;">
</div>
```
and the following CSS
```
div.progress {
	opacity: 1;
	transition: opacity 1s;
}
div.progress.fade {
	display: none;
}
```

Error Messages
--------------

FileTransfer is not defined:
Make sure that the cordova.js file is included in the head
`<script src="cordova.js"></script>`


Download Source Error:
Make sure the phone is connected to a data connection.




