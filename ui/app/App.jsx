import React from 'react';
import $ from 'jquery';
import { fromJS, List, Record } from 'immutable';

const Character = Record({
  'name': undefined,
  'house': undefined,
  'headshot': undefined,
});

const UNDRAFTED = 'Undrafted';

const App = React.createClass({
  getInitialState() {
    return {
      characters: false, // until loaded
      teams: false, // until loaded
      movingCharacter: undefined, // will be character name when moving
      pickingTeam: undefined, // until loaded
    };
  },

  componentDidMount() {
    this.fetch();
    setInterval(this.fetch, 4000);
  },

  onMove(e) {
    e.preventDefault();
    const { movingCharacter } = this.state;
    const teamName = this.select.value;
    $.ajax({
      method: 'POST',
      url: '/pick',
      contentType: 'application/json',
      data: JSON.stringify({
        'char': movingCharacter,
        'team': teamName,
      }),
      success: (response) => {
        console.log(response);
        this.setState({ movingCharacter: undefined });
        this.fetch();
      },
    });
  },

  onCancel() {
    this.setState({ movingCharacter: undefined });
    this.fetch();
  },

  fetch() {
    $.when(
      $.ajax({
        method: 'GET',
        url: '/characters',
        contentType: 'application/json',
      }),
      $.ajax({
        method: 'GET',
        url: '/teams',
        contentType: 'application/json',
      }),
    ).then(([charItems], [teamItems]) => {
      const teams = fromJS(teamItems);
      this.setState({
        characters: List(charItems)
          .map(c => new Character(c))
          .groupBy(({ name }) => name).map(list => list.first()),
        teams,
        // TODO: snake draft is going to be more complicated...
        pickingTeam: teams.keyOf(teams.minBy(picks => picks.size)),
      });
    });
  },

  renderMoveDialog(movingCharacter) {
    const { teams, pickingTeam } = this.state;
    return (
      <tr className="move-character">
        Move character {movingCharacter} to what team?
        <form onSubmit={this.onMove}>
          <select type="select" ref={(select) => { this.select = select; }}>
            {teams.keySeq().toList().sortBy(t => t).map((teamName) => {
              return (
                <option value={teamName} selected={pickingTeam === teamName}>{teamName}</option>
              );
            })}
          </select>
          <button type="submit">Submit</button>
          <button onClick={this.onCancel}>Cancel</button>
        </form>
      </tr>
    );
  },

  render() {
    const { movingCharacter, characters, teams, pickingTeam } = this.state;
    if (!characters || !teams) {
      return <div />;
    }
    const isAdmin = window.location.search.indexOf('whenandysweatsitgoesrightinhiseyes') !== -1; // eslint-disable-line no-undef
    const draftedChars = teams.toList().flatMap(c => c).toSet();
    const undraftedChars = characters.map(({ name }) => name).filter(name => !draftedChars.includes(name));
    const teamsWithUndrafted = teams.set('Undrafted', undraftedChars)
      .toOrderedMap()
      .sortBy(
        (v, k) => k,
        (a, b) => {
          if (a === UNDRAFTED) {
            return -1;
          }
          if (b === UNDRAFTED) {
            return 1;
          }
          return a.localeCompare(b);
        },
      );

    const appClass = 'app' + (isAdmin ? ' admin' : ''); // eslint-disable-line prefer-template

    return (
      <div className={appClass}>
        <div className="page-header">
          Fantasy Game of Thrones{isAdmin ? ' (Admin)' : ''}
        </div>
        <div className="teams-container">
          {teamsWithUndrafted.map((cList, teamName) => {
            let className = `team${teamName === UNDRAFTED ? ' undrafted' : ''}`;
            if (teamName === pickingTeam) className += ' picking';
            return (
              <div className={className} key={teamName}>
                <div className="team-name">{teamName}</div>
                <table className="character-list">
                  <tbody>
                    {cList.map((characterName) => {
                      const { house, headshot } = characters.get(characterName);
                      const movingDialog = (characterName === movingCharacter) ? this.renderMoveDialog(characterName) : null;
                      const canDraft = isAdmin && teamName === UNDRAFTED;
                      return (
                        <tbody>
                          <tr key={characterName}>
                            <td
                              className="character-name"
                              onClick={canDraft ? () => this.setState({ movingCharacter: characterName }) : null}
                            >{characterName}</td>
                            <td className="house">{house}</td>
                            <td className="headshot">
                              <img alt="loading" src={headshot} width={32} height={32} />
                            </td>
                          </tr>
                          {movingDialog}
                        </tbody>
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
