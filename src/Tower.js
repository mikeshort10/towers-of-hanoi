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
		resetGame: startRod => dispatch(resetGame(startRod))
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
		width: `${100 - (5 - props.num) * 15}%`,
		backgroundColor: `hsl(${props.num * 75 % 360}, 100%, 45%)`,
	}
  
	return (
		<div 
		id={'ring' + props.num}
		style={{ bottom: `${props.position * 25}px` }} 
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
      let eventX = event.clientX || event.targetTouches[0].pageX;
      let eventY = event.clientY || event.targetTouches[0].pageY;
			let element = document.getElementById(id);
			let ringPos = [...this.state.ringPos];
			let movementX = ringPos[0] - eventX;
			let movementY = ringPos[1] - eventY;
			ringPos[0] = eventX;
			ringPos[1] = eventY;
			element.style.top = (element.offsetTop - movementY) + "px";
			element.style.left = (element.offsetLeft - movementX) + "px";
			this.setState({ ringPos })
	}

	dropRing = (ringNum, oldRod) => event => {
		document.onmouseup = document.ontouchend = document.ontouchcancel = null;
		document.onmousemove = document.ontouchmove = null;
    let eventX = this.state.ringPos[0];//event.clientX || event.targetTouches[0].pageX;
    let eventY = this.state.ringPos[1];//event.clientY || event.targetTouches[0].pageY;
		let wrapperWidth = window.innerWidth/3;
		let tooHigh = eventY < window.innerHeight/3;
		let rods = [...this.props.rods];
		let newRod, rings;

		if (eventX < wrapperWidth) newRod = 0;
		else if (eventX < 2 * wrapperWidth) newRod = 1;
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
		} else {
			rods[oldRod] = rods[oldRod].filter( ring => ring !== ringNum);
			rods[newRod].push(ringNum)
			rods[newRod].sort((a,b) => b - a);
			this.props.moveRing(rods);
			this.setState({ ringPos: [], origPos: [] }, () => this.win());
		}
	}

	grabRing = (ringNum, oldRodNum) => event => {
    let eventX = event.clientX || event.targetTouches[0].pageX;
    let eventY = event.clientY || event.targetTouches[0].pageY;
		let oldRod = this.props.rods[oldRodNum];
		if (oldRod[oldRod.length-1] !== ringNum) return;
		let ringPos = [...this.state.ringPos];
		let element = document.getElementById(event.target.parentNode.id);
		let origPos = [element.style.top, element.style.left];
		event.preventDefault();
		event.persist();
		ringPos = [eventX, eventY];
		document.onmousemove = document.ontouchmove = this.drag(event.target.parentNode.id);
		document.onmouseup = document.ontouchend = document.ontouchcancel = this.dropRing(ringNum, oldRodNum);
		this.setState({ ringPos, origPos })
	}

	win () {
		let rods = this.props.rods;
		for (let i = 0; i < rods.length; i++) {
			if (i !== this.props.startRod && rods[i].length === 5) {
        let score = this.props.moves;
				setTimeout(() => alert('You won in ' + score + ' moves!'), 10);
				this.props.resetGame(i);
			}
		}
	}

	render () {
		return (
			<div id="app">
				<div id="game"> 
          <div id="buttons">
            <div 
              className="moves" 
              onClick={this.props.undoMove} 
              onTouchStart={this.props.undoMove}>
              Undo
            </div>
            <div 
              className="moves" 
              onClick={this.props.redoMove} 
              onTouchStart={this.props.redoMove}>
              Redo
            </div>
            <div 
              className="moves" 
              onClick={() => this.props.resetGame(this.props.startRod)} 
              onTouchStart={() => this.props.resetGame(this.props.startRod)}>
              Reset
            </div>
            <div className="moves">{'Move: ' + this.props.moves}</div>
				  </div>
          <h1>Towers of Hanoi</h1>
          <h2> {`How many moves will it take you to move all the rings to a new rod?`} </h2>
          <p> Click and drag each ring to move it.
          <br/> Only one ring can be moved at a time.
          <br/>Larger rings cannot be placed on smaller rings.
          <br/>Good luck! </p>
          {this.renderRingsandRods()} 
        </div>
			</div>
		)
	}
}

export default connect(
	mapStateToProps, 
	mapDispatchToProps)(Presentational)