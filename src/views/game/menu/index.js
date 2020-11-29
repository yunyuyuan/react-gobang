import React, {useEffect, useState} from "react";
import './index.scss'
import SingleButton from "../../../component/single-button";

const Menu = ({self, enemy, isMe, timer, ended, reload})=>{
    const [timerDiv, setTimerDiv] = useState((<div className='timer'/>))

    useEffect(()=>{
        setTimerDiv((
            <div className='timer'>
                <span>
                    倒计时
                    <b className={timer<=5?'red':''}>{timer}</b>
                </span>
            </div>
        ))
    }, [timer])

    return (
        <div className='scope--menu'>
            <div className='player player1'>
                <b>{self}</b>
                {isMe?timerDiv:null}
            </div>
            <div className='mid'>
                {ended?
                    <SingleButton text={'退出'} onClick={reload}/>:''
                }
            </div>
            <div className='player player2'>
                <b>{enemy}</b>
                {!isMe?timerDiv:null}
            </div>
        </div>
    )
}

export default Menu