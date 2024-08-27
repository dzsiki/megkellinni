
let torpedomap
let shotmap

let torpedoselect
torpedotarget = undefined
hpdic = {}
let deathtimer = 0
let deathtarget

function loadtorpedo(){
    torpedoselect = createSelect()
    torpedoselect.size(mindim/4)
    torpedoselect.position(mindim/4,mindim+20)
    torpedoselect.hide()

}

function drawtorpedo(){
    if (torpedomap === undefined || shotmap === undefined) {
        return
    }

    if(deathtimer > 0){
        deathtimer--
        if(deathtimer < 270){
            tint(255,deathtimer)
        }
        image(pics[profilepicmap[deathtarget]], width / 2 - mindim/3 , mindim/6, mindim/1.5, mindim/1.5, 0,0, pics[profilepicmap[deathtarget]].width, pics[profilepicmap[deathtarget]].height)
        if(deathtimer < 270){
            tint(255,255)
            image(pics["explosion"], width / 2 - mindim/2 , 0, mindim, mindim,0,0, pics["explosion"].width, pics["explosion"].height)
        }
        if(deathtimer === 250){
            sounds["dead"].play(0,1,0.05)
        }
        return
    }

    fill(0)
    textAlign(CENTER,TOP)
    textSize(mindim/20)
    text("Soros:\n" + soros, mindim+mindim/2, mindim)
    textSize(mindim/40)
    text(eventlog[0], mindim, mindim+10)
    text(eventlog[1], mindim, mindim+mindim/30+10)
    text(eventlog[2], mindim, mindim+mindim/15+10)

    text("Leaderboard", mindim*2.25, mindim/20)
    for(i=0;i< highscores.length;i++){
        text(highscores[i][0] + " - " + highscores[i][1],mindim*2.25, (i+2) * mindim/10 - mindim/20)
    }

    strokeWeight(1)

    torpedoselect.show()
    torpedotarget = torpedoselect.value()



    if(torpedotarget) {

        for (x = 0; x < 10; x++) {
            for (y = 0; y < 10; y++) {
                if (shotmap[torpedotarget][x][y] === 0) {
                    fill(255, 255, 255)
                } else if (shotmap[torpedotarget][x][y] === 1) {
                    fill(100, 100, 100)
                } else if (shotmap[torpedotarget][x][y] === 2) {
                    fill(255, 0, 0)
                }
                rect(x * mindim / 10, y * mindim / 10, mindim / 10, mindim / 10)
            }
        }
        fill(0,0,255)
        rect(mindim,0,mindim,mindim)
        if(name !== "admin"){
            for (x = 0; x < 10; x++) {
                for (y = 0; y < 10; y++) {
                    if (shotmap[name][x][y] === 1) {
                        fill(100, 100, 150)
                    } else if (shotmap[name][x][y] === 2) {
                        renderboat(torpedomap[x][y],x,y)
                        fill(255, 0, 0, 150)
                    }else if (torpedomap[x][y] === 0) {
                        fill(0, 0, 255)
                    } else if (torpedomap[x][y] > 0) {
                        renderboat(torpedomap[x][y],x,y)
                        fill(0,0,0,0)
                    }
                    rect(x * mindim / 10 + mindim, y * mindim / 10, mindim / 10, mindim / 10)
                }
            }
        }else {
            for (x = 0; x < 10; x++) {
                for (y = 0; y < 10; y++) {
                    if (shotmap[soros][x][y] === 0) {
                        fill(255, 255, 255)
                    } else if (shotmap[soros][x][y] === 1) {
                        fill(100, 100, 100)
                    } else if (shotmap[soros][x][y] === 2) {
                        fill(255, 0, 0)
                    }
                    rect(x * mindim / 10 + mindim, y * mindim / 10, mindim / 10, mindim / 10)
                }
            }
        }
        tint(255, 255)
        if (pics[profilepicmap[name]]) {
            image(pics[profilepicmap[name]], mindim, mindim - mindim/5, mindim/5, mindim/5,0,0, pics[profilepicmap[name]].width, pics[profilepicmap[name]].height)
        } else if(name === "admin" && pics[soros]) {
            image(pics[profilepicmap[soros]], mindim, mindim - mindim/5, mindim/5, mindim/5,0,0, pics[profilepicmap[soros]].width, pics[profilepicmap[soros]].height)
        } else {
            //image(pics["unknown"], mindim, mindim - mindim/5, mindim/5, mindim/5,0,0, pics["unknown"].width, pics["unknown"].height)
        }
        if (pics[profilepicmap[torpedotarget]]) {
            image(pics[profilepicmap[torpedotarget]], mindim-mindim/5, mindim - mindim/5, mindim/5, mindim/5,0,0, pics[profilepicmap[torpedotarget]].width, pics[profilepicmap[torpedotarget]].height)
        } else {
            //image(pics["unknown"], mindim - mindim/5, mindim - mindim/5, mindim/5, mindim/5,0,0, pics["unknown"].width, pics["unknown"].height)
        }
    }
    strokeWeight(5)
    line(mindim, 0,mindim, mindim)

    fill(0,255,0)
    stroke(0)
    textAlign(RIGHT,TOP)
    text(hpdic[torpedotarget], mindim - mindim/30,mindim - mindim/5.5)
    if(name === "admin"){
        text(hpdic[soros], mindim + mindim/6,mindim - mindim/5.5)
    }else {
        text(hpdic[name], mindim + mindim/6,mindim - mindim/5.5)
    }




    strokeWeight(0)
}

function renderboat(boatsize,x,y){
    switch (boatsize) {
        case 1:
            image(pics["1"],x * mindim / 10 + mindim,y * mindim / 10,mindim/10,mindim/10)
            break
        case 2:
            if(torpedomap[x][y-1] === 2){
                image(pics["2h"],x * mindim / 10 + mindim,y * mindim / 10,mindim/10,mindim/10)
            } else if(torpedomap[x][y+1] === 2){
                image(pics["2e"],x * mindim / 10 + mindim,y * mindim / 10,mindim/10,mindim/10)
            } else if(x>0 && torpedomap[x-1][y] === 2){
                rotate_and_draw_image(pics["2e"], x * mindim / 10 + mindim,y * mindim / 10, mindim/10,mindim/10,90)
            } else if(x<10 && torpedomap[x+1][y] === 2){
                rotate_and_draw_image(pics["2h"], x * mindim / 10 + mindim,y * mindim / 10, mindim/10,mindim/10,90)
            }
            break
        default:
            if(torpedomap[x][y-1] === boatsize &&torpedomap[x][y+1] === boatsize){
                image(pics[boatsize.toString()],x * mindim / 10 + mindim,y * mindim / 10,mindim/10,mindim/10)
            }else if((x!==0)&&(torpedomap[x-1][y] === boatsize) && (x !== 10) && (torpedomap[x+1][y] === boatsize)){
                rotate_and_draw_image(pics[boatsize.toString()],x * mindim / 10 + mindim,y * mindim / 10,mindim/10,mindim/10,90)
            }else if((x!==0)&&(torpedomap[x-1][y] === boatsize) && (x === 10 || torpedomap[x+1][y] !== boatsize)){
                rotate_and_draw_image(pics[boatsize.toString() + "e"],x * mindim / 10 + mindim,y * mindim / 10,mindim/10,mindim/10,90)
            }else if((x===0 || torpedomap[x-1][y] !== boatsize) && (x === 10 || torpedomap[x+1][y] === boatsize)){
                rotate_and_draw_image(pics[boatsize.toString() + "h"],x * mindim / 10 + mindim,y * mindim / 10,mindim/10,mindim/10,90)
            }else if(torpedomap[x][y-1] === boatsize && torpedomap[x][y+1] !== boatsize){
                image(pics[boatsize.toString() + "h"],x * mindim / 10 + mindim,y * mindim / 10,mindim/10,mindim/10)
            }else if(torpedomap[x][y-1] !== boatsize && torpedomap[x][y+1] === boatsize){
                image(pics[boatsize.toString() + "e"],x * mindim / 10 + mindim,y * mindim / 10,mindim/10,mindim/10)
            }
            break
    }
}

function rotate_and_draw_image(img, img_x, img_y, img_width, img_height, img_angle){
    imageMode(CENTER);
    translate(img_x+img_width/2, img_y+img_width/2);
    rotate(PI/180*img_angle);
    image(img, 0, 0, img_width, img_height);
    rotate(-PI / 180 * img_angle);
    translate(-(img_x+img_width/2), -(img_y+img_width/2));
    imageMode(CORNER);
}

function gettorpedoupdate(data){
    shotmap = data['torpedo'][1]
    if(name === "admin"){
        torpedomap = data['torpedo'][0][soros]
    }else {
        torpedomap = data['torpedo'][0][name]
    }

    for (i=0;i<players.length;i++){
        torpedoselect.option(players[i], players[i])
        if(activeplayers.indexOf(players[i]) === -1 || players[i] === name){
            torpedoselect.disable(players[i])
        }
    }
    hpdic = data["hp"]
}

function torpedomouse(){
    x = floor(map(mouseX, 0, mindim, 0, 10))
    y = floor(map(mouseY, 0, mindim, 0, 10))

    if (x > 9 || y > 9 || x < 0 || y < 0 || shotmap[torpedotarget][x][y] !== 0) {
        return
    }

    sendHTTPPOST({"name": name, "target": torpedotarget, "x": x, "y": y}, "torpedoshot")
}

function torpedodieanim(targetname){
    background(100, 100, 100)
    deathtimer = 330
    if(pics[targetname] === undefined){
        targetname = "unknown"
    }
    deathtarget = targetname
}

