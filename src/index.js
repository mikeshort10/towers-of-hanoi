import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import Tower from './Tower';
import { store } from './redux.js';

ReactDOM.render(
	<Provider store={store}>
		<Tower />
	</Provider>

document.getElementById('root'));
