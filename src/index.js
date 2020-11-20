import React from "react";
import ReactDOM from 'react-dom';
import './index.scss';
import Game from "./views/game";

export const hostOrigin = 'http://localhost:16074'

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);

