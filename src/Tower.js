import React, { Component } from 'react';
import './Tower.css';
import { moveRing, undoMove, redoMove, resetGame } from './redux.js'
import { connect } from 'react-redux';

const mapStateToProps = state => {
	let newState = Object.assign({}, state.present);
	let rods = [];
	for (let i = 0; i < newState.rods.length; i++)
		rods.push([...newState.rods[i]])
	delete newState.rods;
	newState.rods = rods;
	return newState;
}

const mapDispatchToProps = dispatch => {
	return {
		moveRing: rods => dispatch(moveRing(rods)),
		undoMove: () => dispatch(undoMove()),
		redoMove: () => dispatch(redoMove()),
		resetGame: startRod => (resetGame(startRod))
	}
}

function Rods (props) {
	return (
		<div style={{ left: `${33*props.num}%` }} className="rod-wrapper">
			{props.rings}
			<div className="rod"/>
		</div>
	)
}

function Ring (props) {
	let style = {
		width: `${props.num * 25 + 100}px`,
		backgroundColor: `hsl(${props.num * 75 % 360}, 100%, 45%)`,
	}

	return (
		<div 
		id={'ring' + props.num}
		style={{ bottom: `${(props.position) * 50}px` }} 
		className="ring-wrapper">
			<div 
			onMouseDown={props.grabRing(props.num, props.rod)} 
			onTouchStart={props.grabRing(props.num, props.rod)}
			style={style} 
			className="ring" />
		</div>
	)
}

class Presentational extends Component {
	constructor (props) {
		super (props);
		this.state = { ringPos: [] }
		this.grabRing = this.grabRing.bind(this);
		this.drag = this.drag.bind(this);
		this.dropRing = this.dropRing.bind(this);
	}

	renderRingsandRods () {
		let arr = [];
		let rods = this.props.rods;
		for (let i = 0; i < rods.length; i++) {
			let rod = rods[i];
			let ringArr = [];
			for (let j = 0; j < rod.length; j++) {
				ringArr.push(
					<Ring 
					grabRing={this.grabRing} 
					key={j} 
					num={rod[j]} 
					rod={i} 
					position={j}/>)
			}
			arr.push(<Rods key={i} num={i} rings={ringArr}/>)
		}
		return arr;
	}

	drag = id => event => {
			event.preventDefault();
			let element = document.getElementById(id);
			let ringPos = [...this.state.ringPos];
			let movementX = ringPos[0] - event.clientX;
			let movementY = ringPos[1] - event.clientY;
			ringPos[0] = event.clientX;
			ringPos[1] = event.clientY;
			element.style.top = (element.offsetTop - movementY) + "px";
			element.style.left = (element.offsetLeft - movementX) + "px";
			this.setState({ ringPos })
	}

	dropRing (ringNum, oldRod) {
		document.onmouseup = document.ontouchend = null;
		document.onmousemove = document.ontouchmove = null;
		let event = window.event;
		let wrapperWidth = window.innerWidth/3;
		let ringX = event.clientX;
		let tooHigh = event.clientY < window.innerHeight/3;
		let rods = [...this.props.rods];
		let newRod, rings;

		if (ringX < wrapperWidth) newRod = 0;
		else if (ringX < 2 * wrapperWidth) newRod = 1;
		else newRod = 2;
		rings = rods[newRod];

		if (newRod === oldRod || rings[rings.length-1] < ringNum || tooHigh) {
			let element = document.getElementById('ring' + ringNum);
			element.style.top = this.state.origPos[0];
			element.style.left = this.state.origPos[1];
			if (rings[rings.length-1] < ringNum) {
				setTimeout(() => {
				alert(`A ring can only be placed on another ring if it is larger than it. 
					Keep trying though!'`)},
				10)
			}
			//this.setState({ ringPos: [], origPos: [] })
		} else {
			rods[oldRod] = rods[oldRod].filter( ring => ring !== ringNum);
			rods[newRod].push(ringNum)
			rods[newRod].sort((a,b) => b - a);
			this.props.moveRing(rods);
			this.setState({ ringPos: [], origPos: [] }, () => this.win());
		}
	}

	grabRing = (ringNum, oldRodNum) => event => {
		let oldRod = this.props.rods[oldRodNum];
		if (oldRod[oldRod.length-1] !== ringNum) return;
		let ringPos = [...this.state.ringPos];
		let elementStyle = document.getElementById(event.target.parentNode.id).style;
		let origPos = [elementStyle.top, elementStyle.left];
		event.preventDefault();
		event.persist();
		ringPos = [event.clientX, event.clientY];
		document.onmousemove = document.ontouchmove = this.drag(event.target.parentNode.id);
		document.onmouseup = document.ontouchend = () => this.dropRing(ringNum, oldRodNum);
		this.setState({ ringPos, origPos })
	}

	win () {
		let rods = this.props.rods;
		for (let i = 0; i < rods.length; i++) {
			if (i !== this.props.startRod && rods[i].length === 5) {
				setTimeout(() => alert('You win!'), 10);
				this.props.resetGame(i);
			}
		}
	}

	render () {
		return (
			<div id="app">
				<div id="buttons">
					<button onClick={this.props.undoMove}>Undo</button>
					<button onClick={this.props.redoMove}>Redo</button>
					<button onClick={() => this.props.resetGame(this.props.startRod)}>Reset</button>
				</div>
				<h1>Towers of Hanoi</h1>
				<h2> {`How many moves will it take you to move all the rings to a new rod?`} </h2>
				<p> Click and drag each ring to move it. </p>
				<p> Only one ring can be moved at a time. </p>
				<p> Larger rings cannot be placed on smaller rings. </p>
				<p> Good luck! </p>
				<div id="game"> {this.renderRingsandRods()} </div>
			</div>
		)
	}
}

export default connect(
	mapStateToProps, 
	mapDispatchToProps)(Presentational)