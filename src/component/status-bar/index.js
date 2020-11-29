import React, {useEffect} from "react";
import './index.scss'

const StatusBar = ({class_, text})=>{
    return (
        <section className={'scope--status-bar '+class_}>
            <span>{text}</span>
        </section>
    )
}

export default StatusBar