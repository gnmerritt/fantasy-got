import csv
import jsonpickle
import os.path
from flask import Flask, jsonify, request
app = Flask(__name__, static_folder='ui/build')

STATE = 'state.pickle'


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/static/<path:path>')
def assets(path):
    return app.send_static_file(path)


def read_teams():
    with open('teams.txt') as teams:
        folks = teams.read().split("\n")
        return [f for f in folks if f]


def read_state():
    if not os.path.exists(STATE):
        reset_state()
    with open(STATE) as state:
        return jsonpickle.decode(state.read())


def save_state(state):
    frozen = jsonpickle.encode(state)
    with open(STATE, 'w') as out:
        out.write(frozen)


def reset_state():
    print("Resetting game state at " + STATE)
    teams = read_teams()
    undrafted = {t: [] for t in teams}
    save_state(undrafted)


@app.route('/teams')
def game_info():
    state = read_state()
    teams = read_teams()
    return jsonify([
        {'name': t, 'chars': state.get(t, [])} for t in teams
    ])


def read_chars():
    with open('characters.csv') as chars:
        reader = csv.DictReader(chars, delimiter=',')
        return [row for row in reader]


@app.route('/characters')
def characters():
    return jsonify(read_chars())


@app.route('/pick', methods=['POST'])
def pick_char():
    if not request.json:
        return 'No JSON body found', 400
    character_names = [n['name'] for n in read_chars()]
    char = request.json['char']
    if char not in character_names:
        print(character_names)
        return "Character '{}' not found".format(char), 404
    teams = read_teams()
    team = request.json['team']
    if team not in teams:
        return "Team '{}' not found".format(team), 404
    state = read_state()
    for t, picked in state.items():
        if char in picked:
            return "{} already on {}".format(char, t), 400

    picks = state.get(team, [])
    picks.append(char)
    state[team] = picks
    save_state(state)
    return "Drafting {} to {}".format(char, team), 200


@app.route('/unpick', methods=['POST'])
def unpick_char():
    if not request.json:
        return 'No JSON body found', 400
    character_names = [n['name'] for n in read_chars()]
    char = request.json['char']
    if char not in character_names:
        print(character_names)
        return "Character '{}' not found".format(char), 404
    state = read_state()
    for t, picked in state.items():
        if char in picked:
            picked.remove(char)
    save_state(state)
    return "Character '{}' no longer on a team".format(char), 200


if __name__ == "__main__":
    app.run(host='0.0.0.0')
