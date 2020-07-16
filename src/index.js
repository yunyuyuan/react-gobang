import React from "react";
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button
            className={`square ${props.win} ${props.now} ${props.his_hover}`}
            onClick={props.Click}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquareColumn(i) {
        const that = this,
            num = this.props.num,
            start = i * num;
        return new Array(num).fill(null).map(function (val, idx) {
            let back_at = that.props.back_at,
                his_hover = that.props.his_hover,
                now = start + idx;
            return (
                <Square
                    value={that.props.squares[now]}
                    Click={() => {
                        that.props.Click(now)
                    }}
                    win={that.props.winner_pos.includes(now)?'active':''}
                    now={back_at===-1?'':(that.props.his_pos[back_at][0]===now?'now':'')}
                    his_hover={his_hover===-1?'':(that.props.his_pos[his_hover][0]===now?'his-hover':'')}
                    key={idx}
                />)
        })
    }

    renderSquareRow() {
        const that = this,
            num = this.props.num;
        return new Array(num).fill(null).map(function (val, idx) {
            return (
                <div className="board-row" key={idx}>
                    {that.renderSquareColumn(idx)}
                </div>
            )
        })
    }

    render() {
        return (
            <div>
                {this.renderSquareRow()}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: new Array(this.props.num ** 2).fill(null),
            his_pos: [],
            winner: null,
            winner_pos: [],
            back_at: -1,
            hover_at: -1
        }
    }

    atX() {
        return (this.state.back_at+1 || this.state.his_pos.length) % 2 === 0
    }

    checkWinner(i, square) {
        const num = this.props.num,
            win_num = 5,
            x = Math.floor(i/num),
            y = i%num,
            char = square[i];
        let found_num = [];
        function check_type(exp) {
            let positive = true,
                negative = true;
            for (let base = 1; base < win_num + 1; base++) {
                for (let start of [1, -1]){
                    if (!(start>0?positive:negative)) continue;
                    let idx = exp(start*base);
                    if (idx !== false && square[idx] === char){
                        found_num.push(idx);
                        if (found_num.length === win_num) {
                            this.setState({
                                winner: char,
                                winner_pos: found_num
                            });
                            return true;
                        }
                    }else{
                        // 此路不通
                        if (start>0) positive = false;
                        else negative = false;
                    }
                }
            }
            return false;
        }
        for (let exp of [
            // 垂直
            function (start) {
                if (x+start < 0 || x+start >= num) return false;
                return y + (x+start) * num
            },
            // 水平
            function (start) {
                if (y+start < 0 || y+start >= num) return false;
                return i + start
            },
            // 斜向左
            function (start) {
                if (y+start < 0 || y+start >= num || x-start < 0 || x-start >= num) return false;
                return i - start * num + start
            },
            // 斜向右
            function (start) {
                if (y+start < 0 || y+start >= num || x+start < 0 || x+start >= num) return false;
                return i + start * num + start
            }
        ]) {
            found_num = [i];
            if (check_type.call(this, exp)) return;
        }
        this.setState({
            winner: null,
            winner_pos: []
        });
    }

    handlePut(i) {
        if (this.state.winner || this.state.squares[i]) return;
        let temp = this.state.squares.slice(),
            char = this.atX() ? 'X' : 'O';
        temp[i] = char;
        this.setState({
            squares: temp,
        });
        this.checkWinner(i, temp);
        let his_temp;
        if (this.state.back_at === -1){
            // 普通下棋
            his_temp = this.state.his_pos.slice();
        }else{
            // 历史记录中下棋,删除后面的记录
            his_temp = this.state.his_pos.slice(0, this.state.back_at+1);
        }
        his_temp.push([i, char]);
        this.setState({
            his_pos: his_temp,
            back_at: -1
        })
    }

    handleHis(i) {
        if (i === -1) {
            // 重置
            this.setState({
                squares: new Array(this.props.num ** 2).fill(null),
                his_pos: [],
                winner: null,
                winner_pos: [],
                back_at: -1
            })
        } else {
            // 计算square
            let square = new Array(this.props.num ** 2).fill(null);
            for (let j=0;j<=i;j++){
                square[this.state.his_pos[j][0]] = this.state.his_pos[j][1]
            }
            this.setState({
                squares: square,
                back_at: i,
                winner: null,
                winner_pos: []
            });
            if (i === this.state.his_pos.length - 1) {
                // 最后一个历史记录检查是否有赢家
                this.checkWinner(this.state.his_pos[i][0], square);
            }
        }
    }

    handleHisOver(i) {
        if (i === 'leave'){
            this.setState({
                hover_at: -1
            })
        }else{
            this.setState({
                hover_at: i
            })
        }
    }

    render() {
        const status = this.state.winner ? `Winner: ${this.state.winner}` : `Next player: ${this.atX() ? 'X' : 'O'}`;
        const his = [];
        for (let i = -1; i < this.state.his_pos.length; i++) {
            his.push(
                <li key={i}>
                    <button
                        onClick={() => {this.handleHis(i)}}
                        onMouseEnter={() => {if(i!==this.state.back_at || i===-1)this.handleHisOver(i)}}
                        className={'his-btn'+(i!==-1&&this.state.back_at===i?' chosen':'')}
                    >
                        {i === -1 ? '重新开始' : `跳转到第${i+1}步`}
                    </button>
                </li>
            )
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        num={this.props.num}
                        squares={this.state.squares}
                        Click={(i) => {
                            this.handlePut(i)
                        }}
                        his_pos={this.state.his_pos}
                        winner_pos={this.state.winner_pos}
                        back_at={this.state.back_at}
                        his_hover={this.state.hover_at}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ul onMouseLeave={() => this.handleHisOver('leave')}>{his}</ul>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <Game num={20}/>,
    document.getElementById('root')
);
