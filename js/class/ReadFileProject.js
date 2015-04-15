/**
 * Created by Dylan on 11/03/2015.
 */

ReadFileProject = function(fileContent) {
    this.tabProject = JSON.parse(fileContent);

    console.log(this.tabProject);

    this.infoProject = this.tabProject.project;
    this.listFiles = this.tabProject.files;
    this.listTracks = this.tabProject.tracks;

    //this.progression = 0;
    //this.totalProgression = this.gTotalProgression();

    //this.progressInterval = setInterval(this.analyzeProgression, 500);

    rLog('ReadFileProject : start');
};

/*
ReadFileProject.prototype.gTotalProgression = function() {
    var totalProgression = this.listFiles.length;

    for(var i = 0; i < this.listTracks.length; i++)
    {
        totalProgression += this.listTracks[i].tabElements.length;
    }

    return totalProgression;
};

ReadFileProject.prototype.analyzeProgression = function() {
    eId('progressionBar').style.width = ((this.progression / this.totalProgression) * 100) + '%';
    eId('progressionStatus').innerHTML = 'Chargement du projet ... (' + readFileProject.progression + '/' + readFileProject.totalProgression + ')';

    if(readFileProject.progression == readFileProject.totalProgression)
    {
        rLog('ReadFileProject : finish');

        clearInterval(readFileProject.progressInterval);

        changeZoom(readFileProject.infoProject.zoom, true);
        loadM();
    }
};
*/

ReadFileProject.prototype.loadProject = function() {
    this.setProject();
};

ReadFileProject.prototype.setProject = function() {
    rLog('-LOAD- project : set properties');

    currentProject = new Project(this.infoProject.name.deleteAccent().replace(new RegExp(' ', 'g'), '_').toUpperCase(), usernameSession, this.infoProject.dateCreation);
    currentProject.lastSave = getHour();
    currentProject.forceSave = true;

    currentProject.updateText();
    currentProject.switchAutoSave();

    this.setFiles(true);
};

ReadFileProject.prototype.setFiles = function(start) {
    if(start)
    {
        this.countFiles = 0;

        if(this.listFiles.length > 0) {
            this.getFile(0);
        }
        else
        {
            this.setTracks();
        }
    }
    else
    {
        if(this.countFiles < this.listFiles.length)
        {
            this.getFile(this.countFiles);
        }
        else
        {
            console.log('finish load files');

            this.setTracks();
        }
    }
};

ReadFileProject.prototype.getFile = function(id) {
    rLog('-LOAD- file : ' + id);

    var file = this.listFiles[id];

    $('progressionStatus').innerHTML = 'Fichier : ' + file.fileName;

    var fileObject = new File(file.id, file.type, file.size, file.fileName, file.format);

    if(file.isVideo)
    {
        fileObject.makeVideo();
        this.getThumbnail(file.id, currentProject.tabListFiles.length, file.type);
    }

    if(file.isAudio)
    {
        fileObject.makeAudio();
        this.getThumbnail(file.id, currentProject.tabListFiles.length, TYPE.AUDIO);
    }

    fileObject.setDuration(file.duration);

    currentProject.tabListFiles.push(fileObject);

    addFileList(file.id, file.fileName, file.type);
};

ReadFileProject.prototype.getThumbnail = function(id, row, type) {
    var fileName;

    if(type == TYPE.VIDEO)
    {
        fileName = 'THUMBNAIL_I_' + id;
    }
    else if(type == TYPE.AUDIO)
    {
        fileName = 'THUMBNAIL_A_' + id;
    }
    else
    {
        fileName = 'FILE_' + id;
    }

    var url = 'http://clangue.net/other/testVideo/data/projectsData/' + usernameSession + '/' + this.infoProject.name + '/' + fileName + '.data';

    /*
    var xhr = createCORSRequest('GET', url);
    if (!xhr) {
        noty({layout: 'topRight', type: 'error', text: 'Erreur, navigateur incompatible avec les requêtes CORS.', timeout: '5000'});
        return;
    }

    xhr.onload = function() {
        console.log('response : ' + xhr.response);

        var blob = new Blob([xhr.response], {type: "image/png"});

        //console.log(blob, window.URL.createObjectURL(blob));

        if(type == TYPE.VIDEO || type == TYPE.IMAGE || type == TYPE.TEXT)
        {
            currentProject.tabListFiles[row].setThumbnailImage(window.URL.createObjectURL(blob));
        }
        else
        {
            currentProject.tabListFiles[row].setThumbnailAudio(window.URL.createObjectURL(blob));
        }

        readFileProject.progression++;
        readFileProject.countGetFiles++;

        if(readFileProject.countGetFiles == readFileProject.totalGetFiles)
        {
            rLog('-LOAD- files : finish');

            //readFileProject.dispatchEvent(listfilesend);

            readFileProject.setTracks();
        }
    };

    xhr.onerror = function() {
        reportError('No contact with server');

        noty({layout: 'topRight', type: 'error', text: 'Erreur, impossible de contacter le serveur.', timeout: '5000'});
    };

    xhr.responseType = 'arrayBuffer';
    xhr.send();
    */

    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function(oEvent) {
        var blob = new Blob([oReq.response], {type: "image/png"});

        //console.log(blob, window.URL.createObjectURL(blob));

        if(type == TYPE.VIDEO || type == TYPE.IMAGE || type == TYPE.TEXT)
        {
            currentProject.tabListFiles[row].setThumbnailImage(window.URL.createObjectURL(blob));
        }
        else
        {
            currentProject.tabListFiles[row].setThumbnailAudio(window.URL.createObjectURL(blob));
        }

        /*
        readFileProject.progression++;
        readFileProject.countGetFiles++;

        if(readFileProject.countGetFiles == readFileProject.totalGetFiles)
        {
            rLog('-LOAD- files : finish');

            readFileProject.setElementsTrack();
        }
        */

        readFileProject.countFiles++;
        readFileProject.setFiles(false);
    };

    oReq.send();
};

ReadFileProject.prototype.setTracks = function() {
    rLog('-LOAD- tracks : ' + this.listTracks.length);

    var id = -1;
    var lastId = -1;

    for(var i = 0; i < this.listTracks.length; i++)
    {
        id = addTrack(this.listTracks[i].type);

        if(lastId >= 0) {
            setParentTracks(lastId, id);

            lastId = -1;
        }
        else
        {
            lastId = (this.listTracks[i].parent >= 0) ? id : -1;
        }
    }
};

ReadFileProject.prototype.setElementsTrack = function() {
    rLog('-LOAD- elements track');

    for(var i = 0; i < this.listTracks.length; i++)
    {
        currentProject.tabListTracks[i].tabElements = this.listTracks[i].tabElements;

        for(var y = 0; y < currentProject.tabListTracks[i].tabElements.length; y++)
        {
            var element = currentProject.tabListTracks[i].tabElements[y];
            var file = currentProject.tabListFiles[rowById(element.fileId, currentProject.tabListFiles)];

            this.setElementThumbnail(element, file.thumbnail);
        }
    }
};

ReadFileProject.prototype.setElementThumbnail = function(element, thumbnail) {
    console.log('load thumbnail');
    console.log(element);

    var imageThumbnail = new Image();

    imageThumbnail.onload = function() {
        rLog('-LOAD- track : thumbnail');

        //console.log(element);
        //console.log(imageThumbnail);

        element.thumbnail = imageThumbnail;

        readFileProject.progression++;
    };

    imageThumbnail.src = (element.type != TYPE.AUDIO) ? thumbnail.i : thumbnail.a;
};