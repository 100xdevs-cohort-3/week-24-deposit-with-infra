import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { config } from "./config";

export interface ER extends Request{
    userId?: string
}
export const auth=(req: ER, res: Response, next: NextFunction)=>{
    const token=req.headers.authorization;
    if(!token){
        res.json({
            message: "Invalid -- Not authorized"
        })
        return;
    }
    const decoded= jwt.verify(token, config.SECRET_KEY) as ER;
    if(decoded){
        req.userId=decoded.userId;
        next();
    }else{
        res.json({
            message: "NOT AUTHORIZED"
        })
    }        
}   