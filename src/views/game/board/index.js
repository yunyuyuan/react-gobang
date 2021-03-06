import React from "react";
import './index.scss'
import {boardLines, checkPlayerFakeWin, checkPlayerWin, winNum} from "../../../utils";

class Board extends React.Component {
    constructor(props) {
        super(props);
        const lines = (new Array(boardLines).fill(0)).map((_, i) => <span key={i}/>);
        this.linesContainer = React.createRef();
        this.lines = (
            <div className='lines'>
                <div className='row'>
                    {lines.slice()}
                </div>
                <div className='column'>
                    {lines.slice()}
                </div>
            </div>
        )
        this.state = {
            ceilSize: 0,
            activePos: [],
            tri: [],
            quart: [],
            fakeWin: []
        }
    }

    mouseMove = (e) => {
        // 玩家获胜 | 没轮到你 | 游戏结束
        if (this.props.winner !== -1 || !this.props.turnOn || this.props.ended) {
            this.setState({
                activePos: []
            })
            return
        }
        const container = this.linesContainer.current;
        const rect = container.getBoundingClientRect(),
            ceilSize = rect.width / (boardLines - 1);
        const offsetX = Math.ceil((e.clientX - rect.left - ceilSize / 2) / ceilSize),
            offsetY = Math.ceil((e.clientY - rect.top - ceilSize / 2) / ceilSize);
        for (const v of this.props.history) {
            // 已放置的棋子
            if (v[0] === offsetX && v[1] === offsetY) return
        }
        let fakeWin = []
        if (this.props.assistant) {
            const temp = this.props.history.slice()
            temp.push([offsetX, offsetY])
            fakeWin = checkPlayerFakeWin(this.props.myNumber, temp, [offsetX, offsetY])
        }
        this.setState({
            activePos: [offsetX, offsetY],
            ceilSize,
            fakeWin
        })
    }

    render() {
        const {ceilSize, activePos} = this.state;
        const chessSize = ceilSize * 4 / 5;
        return (
            <div className={'scope--board'}
                 onMouseMove={(e) => {
                     this.mouseMove(e)
                 }}
                 onClick={() => this.props.play(activePos)}>
                <div ref={this.linesContainer} className='board'>
                    {this.lines}
                </div>
                <div className='chess-container'>
                    {activePos.length?
                        <span className={'active chess ' +
                        (this.state.fakeWin.find(v => v[0] === activePos[0] && v[1] === activePos[1]) ? 'fake-win' : '')}
                              style={this.genChessStyle({pos: activePos, chessSize, ceilSize})}/>:''
                    }{
                        this.props.history.map((pos, i) => {
                            return <span key={i}
                                         className={'chess ' +
                                         (i % 2 ? 'white ' : 'black ')+
                                         (this.state.fakeWin.find(v=>v[0]===pos[0]&&v[1]===pos[1])?'fake-win ':' ')+
                                         (i % 2===this.props.winner?
                                             (this.props.winList.find(v=>v[0]===pos[0]&&v[1]===pos[1])?'win':''):'')}
                                         style={this.genChessStyle({pos, chessSize, ceilSize})}/>
                        })
                    }
                </div>
            </div>
        )
    }

    genChessStyle ({pos, chessSize, ceilSize}){
        return {
            width: chessSize + 'px',
            height: chessSize + 'px',
            left: Math.floor(ceilSize * pos[0] + chessSize / 5 - ceilSize / 2 - 2) + 'px',
            top: Math.floor(ceilSize * pos[1] + chessSize / 5 - ceilSize / 2 - 2) + 'px'
        }
    }
}

export default Board