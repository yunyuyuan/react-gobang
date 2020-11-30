import React from "react";
import ReactDOM from 'react-dom';
import './index.scss';
import Game from "./views/game";

export const hostOrigin = process.env.NODE_ENV==='development'?'http://localhost:16074':'https://fun-backend.herokuapp.com'

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);

