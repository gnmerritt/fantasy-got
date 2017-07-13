import csv
import jsonpickle
from flask import Flask, jsonify, request
app = Flask(__name__)

STATE = 'state.pickle'


@app.route('/')
def index():
    return 'Hello, World!'


def read_teams():
    with open('teams.txt') as teams:
        folks = teams.read().split("\n")
        return [f for f in folks if f]


def read_state():
    with open(STATE) as state:
        return jsonpickle.decode(state.read())


def save_state(state):
    frozen = jsonpickle.encode(state)
    with open(STATE, 'w') as out:
        out.write(frozen)


@app.route('/teams')
def game_info():
    state = read_state()
    teams = read_teams()
    return jsonify({t: state.get(t, []) for t in teams})


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

    state[team].append(char)
    save_state(state)
    return "Drafting {} to {}".format(char, team), 200


if __name__ == "__main__":
    print("Resetting game state at " + STATE)
    teams = read_teams()
    undrafted = {t: [] for t in teams}
    save_state(undrafted)
