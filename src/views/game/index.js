import React from "react";
import './index.scss'
import Menu from "./menu";
import Board from "./board";
import SingleButton from "../../component/single-button";
import {boardLines, checkPlayerWin, http, timeout} from "../../utils";
import {language} from "../../lang";
import StatusBar from "../../component/status-bar";


class Game extends React.Component{
    constructor(props) {
        super(props);
        this.activePos = [];
        this.statusBar = <StatusBar set={(func)=>{this.setState({setStatus: func})}}/>
        this.state = {
            available: '',
            setStatus: null,
            lang: 'zh',
            assistant: true,

            self: '',
            enemy: 'unknown',
            myNumber: 0,
            turnAt: 0,
            timer: timeout,

            history: [],
            endState: false,
            winner: -1,
            winList: []
        }
    }

    componentDidMount() {
        (async ()=>{
            await this.reload()
        })()
    }

    throwError(err){
        this.state.setStatus(err)
    }

    async reload (){
        this.setState({
            available: '',
            enemy: 'unknown',
            myNumber: 0,
            turnAt: 0,
            timer: 0,

            history: [],
            endState: false,
            winner: -1,
            winList: []
        })
        await this.getAvailable()
    }

    async getAvailable (){
        const data = await http('check-available', {}, (err)=>this.throwError(err));
        if (data[0]){
            this.setState({
                available: data[1]
            })
        }else{
            // TODO resume game
            this.setState({
                available: 'resume'
            })
        }
    }

    async createGame (){
        if (!this.state.self) {
            this.throwError('昵称不能为空!')
            return
        }
        const data = await http('create', {nick: this.state.self}, (err)=>this.throwError(err));
        if (data[0]){
            this.setState({
                available: 'waiting'
            })
            const data = await http('wait', {}, (err)=>this.throwError(err))
            if (data[0]) {
                this.setState({
                    enemy: data[1],
                    myNumber: 0,
                    available: 'running'
                })
                await this.gameLoop()
            }else{
                await this.reload()
            }
        }else{
            await this.reload()
        }
    }

    async cancelWait (){
        const data = await http('end', {}, (err)=>this.throwError(err));
        if (data[0]) {
            await this.reload();
        }
    }

    async joinGame (){
        if (!this.state.self) {
            this.throwError('昵称不能为空!')
            return
        }
        const data = await http('join', {nick: this.state.self}, (err)=>this.throwError(err))
        if (data[0]) {
            this.setState({
                enemy: data[1],
                myNumber: 1,
                available: 'running'
            })
            await this.gameLoop()
        }else{
            await this.reload()
        }
    }
    async gameLoop (){
        if (this.state.turnAt !== this.state.myNumber){
            // 先等待
            if (!await this.gameWait()) return
            this.setState({
                turnAt: this.state.turnAt?0:1
            })
        }
        while (await this.gamePlay()){
            this.setState({
                turnAt: this.state.turnAt?0:1
            })
            const res = await this.gameWait()
            this.setState({
                turnAt: this.state.turnAt?0:1
            })
            if (!res) return
        }
    }
    async gamePlay (){
        console.log('wait play')
        return new Promise((resolve => {
            this.setState({
                timer: timeout
            })
            const handle = setInterval(()=>{
                this.setState({
                    timer: this.state.timer-1
                })
                if (this.state.timer === 0){
                    window.removeEventListener('play-event', playEventHandle)
                    clearInterval(handle);
                    this.setState({
                        err: '超时，你输了',
                        endState: true
                    })
                }
            }, 1000);
            const playEventHandle = async (e)=> {
                window.removeEventListener('play-event', playEventHandle);
                clearInterval(handle);
                if (this.checkWin(this.state.myNumber, e.detail) || this.checkDraw(e.detail)){
                    await http('play', {pos: JSON.stringify(this.activePos), end: true}, (err) => this.throwError(err))
                    // 发送后直接结束
                    resolve(false)
                }else {
                    resolve((await http('play', {pos: JSON.stringify(this.activePos)}, (err) => this.throwError(err)))[0])
                }
            }
            window.addEventListener('play-event', playEventHandle);
        }))
    }
    setCheese (pos){
        if (this.state.winner !== -1 || pos.length===0 || this.state.endState) return false
        if (this.state.turnAt === this.state.myNumber) {
            this.activePos = pos
            const temp = this.state.history.slice()
            temp.push(pos)
            this.setState({
                history: temp
            })
            // 防止setState异步更新
            const playEvent = new CustomEvent('play-event', {detail: temp});
            window.dispatchEvent(playEvent);
        }else{
            this.setState({
                err: '请先等待对方下棋'
            })
        }
    }
    async gameWait (){
        if (this.state.winner !== -1) return false
        console.log('wait enemy play')
        this.setState({
            timer: timeout
        })
        const handle = setInterval(()=>{
            this.setState({
                timer: this.state.timer-1
            })
            if (this.state.timer === 0){
                clearInterval(handle)
            }
        }, 1000);
        const data = await http('wait', {}, (err)=>this.throwError(err), {timeout: (timeout)*1000+1000});
        clearInterval(handle);
        if (data[0]){
           if (data[1] === 'end'){
               this.setState({
                   err: '对方弃战了',
                   endState: true
               })
               return false
           }else{
               const pos = JSON.parse(data[1]);
               for (const v of this.state.history){
                   if (v[0] === pos[0] && v[1] === pos[1]) {
                       this.throwError('对方非法操作!')
                       this.setState({
                           endState: true
                       })
                       return false
                   }
               }
               const temp = this.state.history.slice()
               temp.push(pos)
               this.setState({
                   history: temp
               })
               if (this.checkWin(this.state.myNumber?0:1, temp) || this.checkDraw(temp)){
                   // 游戏结束
                   return false
               }
           }
        }
        return data[0]
    }

    watchGame (){

    }

    render() {
        let content = '';
        switch (this.state.available) {
            case "":
                content = (
                    <div className={this.state.available}>
                        初始化...
                    </div>)
                break
            case "not":
                content = (
                    <div className={this.state.available}>
                        出错了,尝试刷新页面?
                    </div>)
                break
            case "exist":
                content = (
                    <div className={this.state.available}>
                        有人在玩了,你可以选择观战
                        <SingleButton text={language.watchGame[this.state.lang]} onClick={() => this.watchGame()}/>
                    </div>)
                break
            case "create":
                content = (
                    <div className={this.state.available}>
                        <label>
                            <input placeholder={language.nickName[this.state.lang]} value={this.state.self}
                                   onChange={(v) => {
                                       this.setState({
                                           self: v.target.value
                                       })
                                   }}/>
                        </label>
                        <SingleButton text={language.createGame[this.state.lang]} onClick={() => this.createGame()}/>
                    </div>)
                break
            case "waiting":
                content = (
                    <div className={this.state.available}>
                        <span>等待玩家加入...</span>
                        <SingleButton text={language.cancel[this.state.lang]} onClick={() => this.cancelWait()}/>
                    </div>)
                break
            case "join":
                content = (
                    <div className={this.state.available}>
                        <label>
                            <input placeholder={language.nickName[this.state.lang]} value={this.state.self}
                                   onChange={(v) => {
                                       this.setState({
                                           self: v.target.value
                                       })
                                   }}/>
                        </label>
                        <SingleButton text={language.joinGame[this.state.lang]} onClick={() => this.joinGame()}/>
                    </div>)
                break
            case "running":
                content = (
                    <div className={this.state.available}>
                        <Menu self={this.state.self} enemy={this.state.enemy} isMe={this.state.myNumber === this.state.turnAt}
                              timer={this.state.timer}
                              ended={this.state.endState} reload={this.reload}/>
                        <Board history={this.state.history} ended={this.state.endState} myNumber={this.state.myNumber}
                               play={(e)=>{this.setCheese(e)}} assistant={this.state.assistant} turnOn={this.state.myNumber===this.state.turnAt}
                               winner={this.state.winner} winList={this.state.winList}/>
                    </div>)
                break
            case "resume":
                content = (
                    <div className={this.state.available}>
                        正在恢复对局...
                    </div>)
                break
        }
        return (
            <div className={'scope--game'}>
                {this.statusBar}
                {content}
            </div>)
    }

    checkWin (num, lis){
        let winList = checkPlayerWin(num, lis),
            winner = winList.length?num:-1;
        this.setState({
            winner,
            winList,
            endState: winner !== -1
        })
        return winList.length
    }

    checkDraw (lis){
        if (lis.length === boardLines*boardLines){
            this.setState({
                endState: true
            })
            return true
        }
        return false
    }
}

export default Game