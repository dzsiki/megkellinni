HOST = "dzsiki.duckdns.org"
let socket

name = undefined
players = []
activeplayers = []
pics = {}
profilepicmap = {}
soros = undefined
highscores = undefined

sounds = {}
mindim = 0

STATE = -1

//state -1: bejelentkezes
let nameinput, namebutton
let adminbutton
eventlog = []

function setup() {
    frameRate(60)
    createCanvas(windowWidth, windowHeight);

    socket = io.connect('http://' + HOST + ':6969')
    socket.on('update_state', function (data) {
        getupdate(data);
    });

    if(windowHeight < windowWidth*0.4+50){
        mindim = height-50
    }else{
        mindim = width*0.4
    }


    //state -1: bejelentkezes
    nameinput = createInput();
    nameinput.size(width / 2, height / 10)
    nameinput.position(width / 4, height / 10)
    namebutton = createButton('submit');
    namebutton.size(width / 4, height / 10)
    namebutton.position(3 * width / 8, height / 10 * 4)
    namebutton.mousePressed(sendName);

    adminbutton = createButton("startgame")
    adminbutton.hide()
    adminbutton.size(width / 4, height / 10)
    adminbutton.position(3 * width / 8, height / 10 * 4)
    adminbutton.mousePressed(nextphase);

    picinput = createSelect()
    filenamespng = ["bende","bendev2","csenge","dani","daniboss","csengehell","rajzmestereni","sara","sarav2","tomi","unknown","petra","matyiirl","matyi"]
    for(i = 0;i <filenamespng.length; i++){
        picinput.option(filenamespng[i])
    }
    picinput.size(width / 2, height / 10)
    picinput.position(width / 4, height / 10 * 2.5)

    tempname = localStorage.getItem('name')
    temppic = localStorage.getItem('profilepic')
    if (tempname && temppic) {
        name = tempname
        profilepic = temppic
        sendHTTPPOST({"name": name, "pic": profilepic}, 'addName')
        namebutton.hide()
        nameinput.hide()
    }

    loadimages()
    loadsounds()

    loadtorpedo()


}


function draw() {
    background(100, 100, 100)

    if (STATE == -1) {
        if (name == "admin") {adminbutton.show()}
        for(i=0;i<players.length;i++){
            fill(0)
            textAlign(LEFT,CENTER)
            textSize(mindim/20)
            text(players[i],0,(i+1)*50)
        }
        //3 * width / 8, height / 10 * 4
        image(pics[picinput.selected()], 5*width/8, height / 10 * 3.5, width/5, width/5,0,0, pics[picinput.selected()].width, pics[picinput.selected()].height)
        return
    }

    if(STATE == 0) {
        drawtorpedo()
    }
}


function mousePressed() {
    if (STATE == 0 && soros == name && deathtimer === 0) {
        torpedomouse()
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    if(windowHeight < windowWidth*0.4+50){
        mindim = height-50
    }else{
        mindim = width*0.4
    }

    if(STATE === 0){
        torpedoselect.position(mindim/4,mindim+20)
        torpedoselect.size(mindim/4)
    }

    loop()
}

function getupdate(data) {
    data = JSON.parse(data)

    if(data["type"] === "sound"){
        soundname = data["soundname"]
        sounds[soundname].play(0,1,0.05)
        return
    }

    if(data["type"] === "anim"){
        if(data["name"] === "die"){
            torpedodieanim(data["target"])
        }
    }

    if(STATE === -1 && data['state'] === 0){adminbutton.hide()}

    STATE = data['state']
    players = data["players"]
    activeplayers = data["activeplayers"]
    soros = data["soros"]
    eventlog = data["eventlog"]
    profilepicmap = data["profilpics"]

    temphighscores = data["highscores"]
    highscores = Object.keys(temphighscores).map(function(key) {
        return [key, temphighscores[key]];
    });

    highscores.sort(function(first, second) {
        return second[1] - first[1];
    });

    if(STATE === 0){gettorpedoupdate(data)}
}

function sendHTTPPOST(data, url) {
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    fetch("http://" + HOST + ":6969/" + url, options)
        .then(response => response.json())
        .then(data => {
                if (data['type'] == "name") {
                    namebutton.hide()
                    nameinput.hide()
                    picinput.hide()
                    name = data["name"]
                    profilepic = data["pic"]
                    localStorage.setItem('name', name)
                    localStorage.setItem('profilepic', profilepic)
                }
            }
        )
        .catch(error => {
            console.error('Error:', error);
        });
}

function sendName() {
    tempname = nameinput.value().toLowerCase()
    temppic = picinput.selected()
    if (tempname == undefined || tempname == '') {
        return
    }
    sendHTTPPOST({"name": tempname, "pic": temppic}, 'addName')
}

function loadimages(){
    filenamespng = ["dani","matyi","bende","csenge","sara","tomi","unknown","csengehell","bendev2","daniboss","sarav2","rajzmestereni","petra","matyiirl","1","2e","2h","3e","3","3h","4e","4","4h","5e","5","5h"]
    filenamesgif = ["explosion"]
    for(i = 0;i <filenamespng.length; i++){
            pics[filenamespng[i]] = loadImage("assets/pics/" + filenamespng[i] + ".png")
    }
    for(i = 0;i <filenamesgif.length; i++){
        pics[filenamesgif[i]] = loadImage("assets/pics/" + filenamesgif[i] + ".gif")
    }
}

function loadsounds(){
    filenames = ["torpedomiss","torpedohit","torpedohitEE","dead","sunk","utolsolehelet"]
    for(i = 0;i < filenames.length; i++){
        sounds[filenames[i]] = loadSound("assets/sounds/" + filenames[i] + ".mp3")
    }
}

function nextphase(){
    sendHTTPPOST("admin","nextphase")
}