import React, {useEffect, useState} from "react";
import './index.scss'


class StatusBar extends React.Component{
    constructor(props) {
        super(props);
        this.id = 0;
        this.animateEndLength = 0;
        this.state = {
            lis: []
        }
        props.set(this.addText)
    }

    addText = (t)=>{
        const temp = this.state.lis.slice(0, 4)
        temp.splice(0, 0, {
            id: this.id++,
            text: t
        })
        this.setState({
            lis: temp
        })
        this.animateEndLength = 0
    }

    render() {

        return (
            <section className={'scope--status-bar'}>
                {
                    this.state.lis.map((v)=>{
                        return (
                            <span onAnimationEnd={(e)=>{
                                this.animateEndLength ++;
                                // 一次性清空
                                if (this.state.lis.length === this.animateEndLength){
                                    this.setState({
                                        lis: []
                                    })
                                }
                            }} key={v.id}>{v.text}</span>
                        )
                    })
                }
            </section>
        )
    }
}

export default StatusBar