import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import './main.scss';

// create container element on DOM
const container = document.createElement('div'); // eslint-disable-line no-undef
document.body.append(container); // eslint-disable-line no-undef

const appContainer = (
  <div className="app">
    Fantasy Game of Thones
  </div>
);

ReactDOM.render(appContainer, container);
