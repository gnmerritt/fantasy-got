import React from 'react';
import $ from 'jquery';
import { fromJS, List, Record } from 'immutable';

const Character = Record({
  'name': undefined,
  'house': undefined,
  'headshot': undefined,
});

const App = React.createClass({
  getInitialState() {
    return {
      characters: false, // until loaded
      teams: false, // until loaded
    };
  },
  componentDidMount() {
    $.ajax({
      method: 'GET',
      url: '/characters',
      contentType: 'application/json',
      success: (items) => {
        this.setState({
          characters: List(items)
            .map(c => new Character(c))
            .groupBy(({ name }) => name).map(list => list.first()),
        });
      },
    });
    $.ajax({
      method: 'GET',
      url: '/teams',
      contentType: 'application/json',
      success: (items) => {
        this.setState({
          teams: fromJS(items),
        });
      },
    });
  },
  render() {
    const { characters, teams } = this.state;
    if (!characters || !teams) {
      return <div />;
    }
    const draftedChars = teams.toList().flatMap(c => c).toSet();
    const undraftedChars = characters.map(({ name }) => name).filter(name => !draftedChars.includes(name));
    const teamsWithUndrafted = teams.set('Undrafted', undraftedChars)
      .toOrderedMap()
      .sortBy(
        (v, k) => k,
        (a, b) => {
          if (a === 'Undrafted') {
            return -1;
          }
          if (b === 'Undrafted') {
            return 1;
          }
          return a.localeCompare(b);
        },
      );
    return (
      <div className="app">
        <div className="page-header">
          Fantasy Game of Thrones
        </div>
        <div className="teams-container">
          {teamsWithUndrafted.map((cList, teamName) => {
            return (
              <div className="team" key={teamName}>
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
                    }).toList().toArray()}
                  </tbody>
                </table>
              </div>
            );
          }).toList().toArray()}
        </div>
      </div>
    );
  },
});

export default App;
