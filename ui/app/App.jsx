import React from 'react';
import { fromJS, List, Record } from 'immutable';

const Character = Record({
  'name': undefined,
  'house': undefined,
  'headshot': undefined,
});

const App = React.createClass({
  getInitialState() {
    return {
      characters: List([
        ['Cersei Lannister', 'The Lannisters', 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/9b/9b62abb13a73878b02616a83bf307cc4b24281db_medium.jpg'],
        ['Jon Snow', 'The Starks', 'https://images.moviepilot.com/image/upload/c_fill,h_64,q_auto,w_64/fatkouxg383ziqkfwsos.jpg'],
        ['Danaerys Targaeryan', 'The Targaeryans', 'http://cdn.images.express.co.uk/img/dynamic/galleries/64x64/223128.jpg'],
      ]).map(([name, house, headshot]) => new Character({ name, house, headshot }))
        .groupBy(({ name }) => name).map(list => list.first()),
      teams: fromJS({
        'nathan': [],
        'sam': ['Cersei Lannister'],
        'kelsey': ['Cersei Lannister', 'Jon Snow'],
        'Undrafted': ['Danaerys Targaeryan'],
      }).toOrderedMap().sortBy((v, k) => {
        if (k === 'Undrafter') {
          return -1;
        }
        return k;
      }),
    };
  },
  render() {
    const { characters, teams } = this.state;
    return (
      <div className="app">
        <div className="page-header">
          Fantasy Game of Thrones
        </div>
        <div className="teams-container">
          {teams.map((cList, teamName) => {
            return (
              <div className="team">
                <div className="team-name">{teamName}</div>
                <table className="character-list">
                  <tbody>
                    {cList.map((characterName) => {
                      const { house, headshot } = characters.get(characterName);
                      return (
                        <tr key={characterName}>
                          <td className="character-name">{characterName}</td>
                          <td className="house">{house}</td>
                          <td className="headshot">
                            <img alt="loading" src={headshot} width={64} height={64} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});

export default App;
