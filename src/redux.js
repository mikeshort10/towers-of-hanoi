import { createStore } from 'redux';

const MOVE = 'MOVE';

const UNDO = 'UNDO';

const REDO = 'REDO';

const RESET = 'RESET';

export const moveAction = (rods) => {
	return dispatch => dispatch({ type: MOVE, rods });
}

export const undoAction = () => {
	return dispatch => dispatch({ type: UNDO });
}

export const redoAction = () => {
	return dispatch => dispatch({ type: REDO });
}

export const resetAction = (startRod = 1) => {
	return dispatch => dispatch({
		type: RESET,
		startRod,
		rods: Array(3).fill([]).splice(startRod, 1, [5,4,3,2,1])
	});
}

const reducer = (state = {past:[], present:resetAction(), future:[]}, action) => {
	let state = Object.assign({}, state)
	switch (action) {
		case MOVE:
			return {
				past: state.past.concat(state.present),
				present: {...state.preset, rods: action.rods},
				future: []
			}
		case UNDO:
			return {
				past: state.past.concat(Object.assign({}, state.present)),
				present: state.future.slice(0,1),
				future: state.future.slice(1)
			}
		case REDO:
			return {
				past: state.past.slice(0, state.past.length - 1),
				present: state.past.slice(state.past.length - 1),
				future: [Object.assign({}, state.present), ...state.future]
			}
		case RESET:
			return {
				past: [],
				present: { 
					rods: action.rods, 
					startRod: action.startRod 
				},
				future: []
			}
		default:
			return state;
	}
}

export const store = createStore(reducer);

