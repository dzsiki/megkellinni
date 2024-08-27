import random
import time
import numpy as np
import torpedo

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import json

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app, cors_allowed_origins="*")

shipmaps = {}
shotmaps = {}

STATE = -1
SOROS = "admin"
PLAYERS = []
profilpics = {}
activeplayers = []
hpdic = {}
highscores = {}
utolsolehelet = {}

eventlog = ["", "", ""]

jsonencoder = json.JSONEncoder()


@socketio.on('connect')
def handle_connect():
    normal_update()
    print('Client connected')


def periodic_update():
    global STATE, test,activeplayers,PLAYERS,shipmaps,shotmaps, eventlog,hpdic,profilpics
    while True:
        socketio.emit('update_state', jsonencoder.encode(
            {"state": STATE, 'torpedo': [shipmaps, shotmaps], "soros": SOROS, "players": PLAYERS, "activeplayers": activeplayers, "eventlog": eventlog, "hp": hpdic, "profilpics": profilpics}))
        time.sleep(1)


def normal_update():
    global STATE, test, activeplayers,PLAYERS,shipmaps,shotmaps,eventlog,hpdic,highscores,profilpics
    socketio.emit('update_state', jsonencoder.encode(
        {"state": STATE, 'torpedo': [shipmaps, shotmaps], "soros": SOROS, "players": PLAYERS, "activeplayers": activeplayers, "eventlog": eventlog, "hp": hpdic, "highscores": highscores, "profilpics": profilpics}))

def play_sound(sname):
    socketio.emit('update_state', jsonencoder.encode({"type": "sound","soundname": sname}))

def play_anim(aname, data):
    socketio.emit('update_state', jsonencoder.encode({"type": "anim", "name": aname, "target": data["target"]}))

@app.route('/addName', methods=['POST'])
def addname():
    if request.is_json:
        data = request.json
        name = data["name"]
        if name not in PLAYERS and name != "admin":
            PLAYERS.append(name)
            shipmaps[name], shotmaps[name] = torpedo.generateships()
            profilpics[name] = data["pic"]
        normal_update()
        return jsonify({"name": name, "pic": data["pic"], "type": "name"})
    else:
        return jsonify({"error": "Invalid JSON"}), 400


@app.route('/torpedoshot', methods=['POST'])
def torpedoshot():
    global SOROS,shipmaps,shotmaps,activeplayers, eventlog, utolsolehelet
    if request.is_json:
        data = request.json
        if data["name"] == SOROS and data["name"] != data["target"] and data["target"] in activeplayers:
            target = data["target"]
            x = data["x"]
            y = data["y"]
            if hpdic[SOROS] == 1 and utolsolehelet[SOROS]:
                play_sound("utolsolehelet")
                talaltokszama = 0
                for ii in range(10):
                    if shipmaps[target][x][ii] == 0:
                        shotmaps[target][x][ii] = 1
                    elif shotmaps[target][x][ii] != 2:
                        shotmaps[target][x][ii] = 2
                        highscores[SOROS] += (talaltokszama+1)*100
                        talaltokszama += 1
                    if shipmaps[target][ii][y] == 0:
                        shotmaps[target][ii][y] = 1
                    elif shotmaps[target][ii][y] != 2:
                        shotmaps[target][ii][y] = 2
                        highscores[SOROS] += (talaltokszama+1)*100
                        talaltokszama += 1
                eventlog.append(SOROS + " " + str(talaltokszama) + " találatot vitt be az utolsó leheletével.")
                utolsolehelet[SOROS] = False
            elif shipmaps[target][x][y] == 0:
                play_sound("torpedomiss")
                shotmaps[target][x][y] = 1
                eventlog.append(SOROS + " nem találta el " + data["target"] + "-t. [" + str(x+1) + "][" + str(y+1) + "]")
            else:
                if random.randint(0,50) == 0:
                    play_sound("torpedohitEE")
                else:
                    play_sound("torpedohit")
                shotmaps[target][x][y] = 2
                highscores[SOROS] += 100
                eventlog.append(SOROS + " eltalálta " + data["target"] + "-t. [" + str(x+1) + "][" + str(y+1) + "]")

            hajokszama = 0
            hajokmeglove = {"1":0,"2":0,"3":0,"4":0,"5":0}
            for k in range(10):
                for j in range(10):
                    if shotmaps[target][k][j] == 2:
                        hajokszama += 1
                        hajokmeglove[str(shipmaps[target][k][j])] += 1
            hpdic[target] = 15 - hajokszama
            if shipmaps[target][x][y] != 0 and hajokmeglove[str(shipmaps[target][x][y])] == shipmaps[target][x][y]:
                play_sound("sunk")
                highscores[SOROS] += 400
                eventlog[-1] = eventlog[-1] + " " + str(shipmaps[target][x][y]) + " husszú hajó elsüllyedt."
            if hajokszama == 15:
                activeplayers.remove(target)
                #play_sound("dead")
                highscores[SOROS] += 750
                play_anim("die",{"target": target})
                eventlog[-1] = eventlog[-1] + " Kivégezte " + data["target"] + "-t."
            SOROS = activeplayers[(activeplayers.index(SOROS) + 1) % len(activeplayers)]
            eventlog.pop(0)
        normal_update()
        return jsonify({})
    else:
        return jsonify({"error": "Invalid JSON"}), 400


@app.route('/nextphase', methods=['POST'])
def nextphase():
    global STATE,SOROS,activeplayers,PLAYERS, hpdic, utolsolehelet

    if STATE == -1:
        activeplayers = PLAYERS[:]
        np.random.shuffle(activeplayers)
        SOROS = activeplayers[0]
        for player in PLAYERS:
            hpdic[player] = 15
            highscores[player] = 0
            utolsolehelet[player] = True

    STATE += 1
    normal_update()
    return jsonify({})


if __name__ == '__main__':
    #socketio.start_background_task(periodic_update)
    app.run(debug=True, host="0.0.0.0", port=6969)
