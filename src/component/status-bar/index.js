import React from "react";
import './index.scss'


class StatusBar extends React.Component {
    constructor(props) {
        super(props);
        this.id = 0;
        this.animateEndLength = 0;
        this.state = {
            lis: []
        }
        props.set(this.addText)
    }

    addText = (t, c) => {
        const temp = this.state.lis.slice(0, 4)
        temp.splice(0, 0, {
            id: this.id++,
            text: t,
            class_: c || 'err'
        })
        this.id = this.id % 5;
        this.setState({
            lis: temp
        })
        this.animateEndLength = 0
    }

    render() {
        return (
            <section className={'scope--status-bar'}>
                {
                    this.state.lis.map((v) => {
                        return (
                            <span className={v.class_} key={v.id}
                                  onAnimationEnd={() => {
                                      this.animateEndLength++;
                                      // 一次性清空
                                      if (this.state.lis.length === this.animateEndLength) {
                                          this.setState({
                                              lis: []
                                          })
                                      }
                                  }}
                            >{v.text}</span>
                        )
                    })
                }
            </section>
        )
    }
}

export default StatusBar