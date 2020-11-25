import React from "react";
import './index.scss'

const Board = ({ended, history, play})=>{
    return (
        <div className={'scope--board'}>
            {history}
            <div className='board' onClick={(e)=>play(e)}>

            </div>
        </div>
    )
}

export default Board