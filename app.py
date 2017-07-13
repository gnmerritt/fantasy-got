import csv
import jsonpickle
from flask import Flask, jsonify
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


if __name__ == "__main__":
    print("Resetting game state at " + STATE)
    teams = read_teams()
    undrafted = {t: [] for t in teams}
    frozen = jsonpickle.encode(undrafted)
    with open(STATE, 'w') as out:
        out.write(frozen)
