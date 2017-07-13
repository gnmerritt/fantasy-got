import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import './main.scss';

import App from './App';

// create container element on DOM
const container = document.createElement('div'); // eslint-disable-line no-undef
document.body.append(container); // eslint-disable-line no-undef

const appContainer = (
  <div className="app-container">
    <App />
  </div>
);

ReactDOM.render(appContainer, container);
