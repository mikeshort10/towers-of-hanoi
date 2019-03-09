import { createStore } from 'redux';

const MOVE = 'MOVE';

const UNDO = 'UNDO';

const REDO = 'REDO';

const RESET = 'RESET';

export const moveRing = rods => {
	return { type: MOVE, rods }
};

export const undoMove = () => {
	return { type: UNDO }
}

export const redoMove = () => {
	return { type: REDO }
}

export const resetGame = (startRod = 1) => {
	let rods = [[],[],[]]
	rods.splice(startRod, 1, [5,4,3,2,1])
	return {
		type: RESET, 
		startRod, rods
	}
}

const initialState = Object.assign({},{
	past: [],
	present: {
		startRod: 1,
		rods: [
			[],
			[5,4,3,2,1],
			[]
		]
	},
	future: []
})

const reducer = (state = Object.assign({}, initialState), action) => {
	switch (action.type) {
		case MOVE:
			let present = Object.assign({},state.present);
			delete present.rods;
			present.rods = action.rods;
			return {
				past: state.past.concat(Object.assign({},state.present)),
				present,
				future: []
			}
		case REDO:
			if (state.future.length === 0) return state;
			return {
				past: state.past.concat(Object.assign({}, state.present)),
				present: Object.assign({},state.future[0]),
				future: state.future.slice(1)
			}
		case UNDO:
			if (state.past.length === 0) return state;
			return {
				past: state.past.slice(0, state.past.length - 1),
				present: Object.assign({},state.past[state.past.length - 1]),
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

