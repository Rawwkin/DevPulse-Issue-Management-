import type { Request, Response } from "express";
import { authService } from "./auth.service";

const registerUSer = async (req : Request, res : Response) => {
    try {
        const result = await authService.regUsers(req.body);
        res.status(200).json({
            success : true,
            message : "User has been registered.",
            data : result.rows[0]
        })
        
    } catch (error : any) {
        res.status(500).json({
            success : false,
            message : error.message,
            error : error
        });
    }
};




const loginUSer = async (req : Request, res : Response) => {
    try {
        const result = await authService.loginUSerService(req.body);
        res.status(200).json({
            success : true,
            message : "login Successful.",
            data : result,
        })
        
    } catch (error: any) {
        res.status(500).json({
          success: false,
          message: error.message,
          error: error,
        });
    }
};




export const authController = {
    registerUSer,
    loginUSer
}

