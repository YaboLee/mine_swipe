import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

function Timer(props) {
    return (
        <span>
            {props.time}
        </span>
        
    );
}

function Reset(props) {
    return (
        <button onClick={props.onClick}>
            Reset
        </button>
    );
}

class Square extends React.Component {    
    render() {
        var className = "square";
        if (this.props.info.showOrNot) {
            className += " square-show";
            if (this.props.info.mineOrNot) {
                className += " mine";
            } else {
                switch (this.props.info.value) {
                    case 0:
                        className += " zero";
                        break;
                    case 1:
                        className += " one";
                        break;
                    case 2:
                        className += " two";
                        break;
                    case 3:
                        className += " three";
                        break;
                    default:
                        
                }

            }
        }
        return (
            <button className={className} onClick={() => this.props.onClick(this.props.info.index)}>
                {
                    (this.props.info.showOrNot ? 
                        this.props.info.value :
                        '')
                }
            </button>
        );
    }
}

function OneRow(props) {
    return (
        <div className='row'>
            {props.row.map((info) => <Square info={info} onClick={props.onClick} />)}
        </div>
    );
}

class Board extends React.Component {
    renderRows() {
        return (
            <div className='board'>
                {this.props.rows.map((row) => <OneRow row={row} onClick={this.props.onClick} />)}
            </div>
        );
    }

    render() {
        return (
            this.renderRows()
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        const rows = this.initializeBoard(props.shape);
        this.state = {
            shape: props.shape,
            rows: rows,
            isBegin: true,
            time: 0,
        }
    }

    initializeBoard(shape) {
        var rows = Array(shape);
        var count = 0;
        for (let i = 0; i < shape; i++) {
            rows[i] = Array(shape);
            for (let j = 0; j < shape; j++) {
                rows[i][j] = this.initializeSquare(count);
                count += 1;
            }
        }
        return rows;
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        const newTime = this.state.time + 1;
        this.setState({
            time: newTime,
        });
    }

    handleClick(index) {
        if (this.state.isBegin) {
            this.generateMines(index, 20);
        }
        this.display(index);
    }

    display(index) {
        var currentBoard = this.state.rows.slice();
        const ret = this.indexToCordinates(index);
        const i = ret[0];
        const j = ret[1];
        if (this.checkMine(currentBoard, i, j)) {
            alert('Boom!');
            this.displayAll();
            return;
        }
        currentBoard[i][j].showOrNot = true;
        if (currentBoard[i][j].value > 0) {
            this.setState({
                rows: currentBoard,
            });
            return;
        }
        const around = this.avaliableAround(i, j);
        for (let x in around) {
            const x_i = around[x][0];
            const x_j = around[x][1];
            if (currentBoard[x_i][x_j].showOrNot) {
                continue;
            }
            if (currentBoard[x_i][x_j].mineOrNot) {
                continue;
            }
            currentBoard[x_i][x_j].showOrNot = true;                    
            currentBoard = this.displayRecursion(currentBoard, x_i, x_j);
        }
        this.setState({
            rows: currentBoard,
        });
    }

    displayRecursion(currentBoard, i, j) {
        const around = this.avaliableAround(i, j);
        for (let x in around) {
            const x_i = around[x][0];
            const x_j = around[x][1];
            if (currentBoard[x_i][x_j].showOrNot) {
                continue;
            }
            if (currentBoard[x_i][x_j].mineOrNot) {
                continue;
            }
            currentBoard[x_i][x_j].showOrNot = true;
            if (currentBoard[x_i][x_j].value > 0) {
                continue;
            }              
            currentBoard = this.displayRecursion(currentBoard, x_i, x_j);
        }
        return currentBoard;
    }

    displayAll() {
        var currentBoard = this.state.rows.slice();
        for (let i = 0; i < this.state.shape; i++) {
            for (let j = 0; j < this.state.shape; j++) {
                currentBoard[i][j].showOrNot = true;
            }
        }
        this.setState({
            rows: currentBoard,
        });
    }

    generateMines(ori_index, numberOfMines) {
        var currentBoard = this.state.rows.slice();
        const shape = this.state.shape;
        const totalSquares = shape * shape;
        const ori_ret= this.indexToCordinates(ori_index);
        const ori_i = ori_ret[0];
        const ori_j = ori_ret[1];
        const around = this.avaliableAround(ori_i, ori_j);
        // console.log(ori_i, ori_j, around, currentBoard);
        while (numberOfMines) {
            const index = randInt(0, totalSquares);
            const ret = this.indexToCordinates(index);
            const i = ret[0];
            const j = ret[1];
            // The mine will not around the first click.
            if (this.cordinatesInArray(around, i, j)) {
                continue;
            }
            // No repeated mine loc.
            if (this.checkMine(currentBoard, i, j)) {
                continue;
            }
            // The mine is not the click loc.
            if (i === ori_i && j === ori_j){
                continue;
            }
            currentBoard[i][j].mineOrNot = true;
            numberOfMines -= 1;
        }
        // Set value for each square.
        for (let i = 0; i < this.state.shape; i++) {
            for (let j = 0; j < this.state.shape; j++) {
                this.setValue(currentBoard, i, j);
            }
        }
        this.setState({
            rows: currentBoard,
            isBegin: false,
        });
    }

    checkMine(currentBoard, i ,j) {
        if (i < 0 || i >= this.shape) return false;
        if (j < 0 || j >= this.shape) return false;
        return currentBoard[i][j].mineOrNot === true;
    }

    cordinatesInArray(array, i, j) {    
        for (let x in array) {
            if (array[x][0] === i && array[x][1] === j) {
                return true
            }
        }
        return false;
    }

    indexToCordinates(index) {
        if (index >= this.state.shape*this.state.shape || index < 0) {
            return null;
        }
        return [Math.floor(index / this.state.shape), Math.floor(index % this.state.shape) ]
    }

    initializeSquare(index) {
        return ({
            index: index,
            mineOrNot: false,
            showOrNot: false,
            value: 0,
        });
    }

    setValue(currentBoard, i, j) {
        if (this.checkMine(currentBoard, i, j)) {
            currentBoard[i][j].value = 'X';
            return;
        }
        var value = 0;
        const around = this.avaliableAround(i, j);
        for (let x in around) {
            if (this.checkMine(currentBoard, around[x][0], around[x][1])) value += 1;
        }
        currentBoard[i][j].value = value;
    }

    avaliableAround(i, j) {
        let ret = new Array();
        if (i-1 >= 0 && i-1 < this.state.shape && j-1 >= 0 && j-1 < this.state.shape) ret.push([i-1, j-1]);
        if (i-1 >= 0 && i-1 < this.state.shape && j >= 0 && j < this.state.shape) ret.push([i-1, j]);
        if (i-1 >= 0 && i-1 < this.state.shape && j+1 >= 0 && j+1 < this.state.shape) ret.push([i-1, j+1]);
        if (i >= 0 && i < this.state.shape && j-1 >= 0 && j-1 < this.state.shape) ret.push([i, j-1]);
        if (i >= 0 && i < this.state.shape && j+1 >= 0 && j+1 < this.state.shape) ret.push([i, j+1]);
        if (i+1 >= 0 && i+1 < this.state.shape && j-1 >= 0 && j-1 < this.state.shape) ret.push([i+1, j-1]);
        if (i+1 >= 0 && i+1 < this.state.shape && j >= 0 && j < this.state.shape) ret.push([i+1, j]);
        if (i+1 >= 0 && i+1 < this.state.shape && j+1 >= 0 && j+1 < this.state.shape) ret.push([i+1, j+1]);
        return ret;
    }

    reset() {
        const rows = this.initializeBoard(this.state.shape);
        this.setState({
            rows: rows,
            isBegin: true,
            time: 0,
        });
    }

    render() {
        return (
            <div className='game'>
                <Board 
                    rows={this.state.rows}
                    onClick={(index) => this.handleClick(index)} 
                />
                <ul>
                    <li>
                        <div className='timer'>
                            <Timer time={this.state.time} />
                        </div>
                    </li>
                    <li>
                        <div className='reset-btn'>
                            <Reset onClick={() => this.reset()} />
                        </div>
                    </li>
                    
                </ul>
                
            </div>
        );
    }
}

function randInt(floor, roof) {
    const range = roof - floor;
    const rand = Math.random();
    return floor + Math.floor(rand * range);
}

ReactDOM.render(
    <Game shape={12}/>,
    document.getElementById('root')
);