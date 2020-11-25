import axios from "axios";
import {hostOrigin} from "./index";

export const timeout = 17000;

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