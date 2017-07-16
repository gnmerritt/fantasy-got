# fantasy-got
fantasy game of thrones

## usage

need: python 3, pip, yarn

```
pip install -r requirements.txt
export FLASK_APP=app.py
# populate your teams.txt file with team names, one per line

# build the UI
cd ui
yarn build

# run flask (debug, local machine only)
python -m flask run

# OR run flask visible to the internet
python server.py
```
