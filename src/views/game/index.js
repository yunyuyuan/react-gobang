import React, {useState} from "react";
import './index.scss'
import axios from 'axios'
import {hostOrigin} from "../../index";

const Game = ()=>{
    const [available, setAvailable] = useState('not')

    // check has some people playing
    axios.post(hostOrigin + '/api/gobang/check-available').then(res=>{
        const data = res.data;
        if (data.status){
            setAvailable(data.data);
            if (data.data === 'create'){
                axios.post(hostOrigin + '/api/gobang/create', {
                    data: {
                        name: 'player-1'
                    }
                }).then(res=>{

                })
            }else if (data.data === 'join'){
                axios.post(hostOrigin + '/api/gobang/join', {
                    data: {
                        name: 'player-2'
                    }
                }).then(res=>{

                })
            }
        }
    })

    return (
        <div className={'scope--game'}>
            {available!=='not'? (
                <div>
                </div>
            ): (
                <div>
                    有人在玩了
                </div>
            )}
        </div>
    )
}

export default Game