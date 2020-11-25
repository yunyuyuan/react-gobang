import React from "react";
import './index.scss'

const SingleButton = ({text, icon, size, onClick})=>{
    size = size || 1;

    return (
        <div onClick={onClick} className='scope--single-button' style={{padding: `${0.3*size}rem ${1.2*size}rem`}}>
            <span style={{fontSize: size+'rem'}}>{text}</span>
        </div>
    )
}

export default SingleButton