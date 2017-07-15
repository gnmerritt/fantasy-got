# fantasy-got
fantasy game of thrones

## usage

need: python 3, pip, yarn

```
pip install -r requirements.txt
export FLASK_APP=app.py
# populate your teams.txt file with team names, one per line
python app.py # creates empty state
# build the UI
cd ui
yarn build
# run flask
python -m flask run
```
