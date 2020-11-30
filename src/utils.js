import axios from "axios";
import {hostOrigin} from "./index";

export const timeout = 17;

export const boardLines = 15;
export const winNum = 5;

export async function http(endpoint, param, throwError, config){
    try{
        const res = await axios.post(hostOrigin + '/api/gobang/'+endpoint, param||{}, {
                withCredentials: true,
                ...(config||{})
            });
        const data = res.data;
        if (data.status){
            return [true, data.data]
        }else{
            throwError(data.data)
            return [false]
        }
    }catch (err){
        throwError(err)
        return [false]
    }
}

export function checkPlayerWin(num, lis){
    // 取出自己的棋子
    const my = [];
    lis.forEach((v, idx)=>{
        if (idx%2 === num){
            my.push(v)
        }
    })
    return checkWin(my)
}

export function checkPlayerFakeWin(num, lis, pos){
    // 取出周围棋子
    const around = [];
    lis.forEach((v, idx)=>{
        if (idx%2 === num && Math.abs(v[0]-pos[0])<winNum && Math.abs(v[1]-pos[1])<winNum){
            around.push(v)
        }
    })
    return checkWin(around)
}

export function checkWin(lis) {
    for (const start of lis) {
        // 以start为开始
        for (const orient of [[1, 0], [0, 1], [-1, 1], [1, 1], [1, -1], [-1, -1], [-1, 0], [0, -1]]) {
            // 8种
            const findList = [start];
            for (let idx=1;idx<winNum;idx++){
                const findPos = lis.find(v=>{
                    return v[0]===start[0]+orient[0]*idx && v[1]===start[1]+orient[1]*idx
                })
                if (findPos){
                    findList.push(findPos)
                }
            }
            if (findList.length === winNum){
                return findList
            }
        }
    }
    return []
}