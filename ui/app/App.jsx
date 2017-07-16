import React from 'react';
import $ from 'jquery';
import { fromJS, List, Record } from 'immutable';

const Character = Record({
  'name': undefined,
  'house': undefined,
  'headshot': undefined,
});

const UNDRAFTED = 'Undrafted';

const teamSize = t => t.get('chars').size;

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
    this.fetchCharacters();
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

  onUndraft(characterName) {
    $.ajax({
      method: 'POST',
      url: '/unpick',
      contentType: 'application/json',
      data: JSON.stringify({
        'char': characterName,
      }),
      success: () => this.fetch(),
    });
  },

  onCancel() {
    this.setState({ movingCharacter: undefined });
    this.fetch();
  },

  fetchCharacters() {
    $.ajax({
      method: 'GET',
      url: '/characters',
      contentType: 'application/json',
      success: (charItems) => {
        this.setState({
          characters: List(charItems)
            .map(c => new Character(c))
            .groupBy(({ name }) => name).map(list => list.first()),
        });
      },
    });
  },

  fetch() {
    $.ajax({
      method: 'GET',
      url: '/teams',
      contentType: 'application/json',
      success: (teamItems) => {
        const teams = fromJS(teamItems);
        const smallestTeamSize = teams.map(teamSize).min();
        // snake draft:
        // when the smallest team has an even # of players we are drafting forward
        // and we want the first from the front with fewer players. otherwise
        // we're going backwards, so we want the first from the back
        const ordering = (smallestTeamSize % 2 === 0) ? teams : teams.reverse();
        this.setState({
          teams,
          // the name of the smallest team in whichever direction we're going
          pickingTeam: ordering.minBy(teamSize).get('name'),
        });
      },
    });
  },

  isAdmin() {
    return window.location.search.indexOf('whenandysweatsitgoesrightinhiseyes') !== -1; // eslint-disable-line no-undef
  },

  renderMoveDialog(movingCharacter) {
    const { teams, pickingTeam } = this.state;
    return (
      <tr className="move-character">
        Move character {movingCharacter} to what team?
        <form onSubmit={this.onMove}>
          <select type="select" ref={(select) => { this.select = select; }}>
            {teams.map(t => t.get('name')).map((teamName) => {
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

  renderTeam(team) {
    const { movingCharacter, characters, pickingTeam } = this.state;
    const chars = team.get('chars');
    const teamName = team.get('name');
    const undrafted = teamName === UNDRAFTED;
    let className = 'team';
    if (undrafted) className += ' undrafted';
    if (teamName === pickingTeam) className += ' picking';

    return (
      <div className={className} key={teamName}>
        <div className="team-name">{teamName}</div>
        <table className="character-list">
          <tbody>
            {chars.map((characterName) => {
              const { house, headshot } = characters.get(characterName);
              const movingDialog = (characterName === movingCharacter) ? this.renderMoveDialog(characterName) : null;
              const canDraft = this.isAdmin() && undrafted;
              const canRemove = this.isAdmin() && !undrafted;
              return (
                <tbody>
                  <tr key={characterName}>
                    <td className="headshot">
                      <img alt="loading" src={headshot} width={48} height={48} />
                    </td>
                    <td
                      className="character-name"
                      onClick={canDraft ? () => this.setState({ movingCharacter: characterName }) : null}
                    >{characterName}</td>
                    <td className="house">{house}</td>
                    {canRemove
                      ? <td className="undo" onClick={() => this.onUndraft(characterName)}>UNDO</td>
                      : null
                    }
                  </tr>
                  {movingDialog}
                </tbody>
              );
            }).toList().toArray()}
          </tbody>
        </table>
      </div>
    );
  },

  render() {
    const { characters, teams } = this.state;
    if (!characters || !teams) {
      return <div />;
    }
    const draftedChars = teams.map(t => t.get('chars')).flatMap(c => c).toSet();
    const undraftedChars = characters.map(({ name }) => name).filter(name => !draftedChars.includes(name));
    const undrafted = fromJS({ name: 'Undrafted', chars: undraftedChars });

    const appClass = 'app' + (this.isAdmin() ? ' admin' : ''); // eslint-disable-line prefer-template

    return (
      <div className={appClass}>
        <div className="page-header">
          Fantasy Game of Thrones{this.isAdmin() ? ' (Admin)' : ''}
        </div>
        <div className="game-grid">
          <div className="teams-container undrafted-container">
            {this.renderTeam(undrafted)}
          </div>
          <div className="teams-container players">
            {teams.map(team => this.renderTeam(team)).toArray()}
          </div>
        </div>
      </div>
    );
  },
});

export default App;
