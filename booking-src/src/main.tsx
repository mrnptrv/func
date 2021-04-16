import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import {App, Login} from 'app';
import ReactModal from 'react-modal';

// prepare history
const history = createBrowserHistory();

// render react DOM
ReactDOM.render(<App history={history} />, document.getElementById('root'));

ReactModal.setAppElement('#root')// render react DOM

ReactDOM.render(<Login history={history} />, document.getElementById('login'));

