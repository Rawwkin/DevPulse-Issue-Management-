import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types";


const auth = (...roles: ROLES[]) => {
    return async (req : Request, res : Response, next : NextFunction) => {
      try {
        
        const token = req.headers.authorization;

        if(!token) {
            res.status(403).json({
                success : false, 
                message : "Unauthorized access!!"
            })
        }

        const decoded = jwt.verify(token as string, config.secret as string) as JwtPayload;
        
        const userData = await pool.query(`
            
            SELECT * FROM users WHERE email = $1
            `, [decoded.email],    
        );

        if (userData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User invalid!!",
              });
        }

        req.user = decoded;
      const user = userData.rows[0];

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Valid token but insufficient role/permissions",
        });
      }

      next();

      } 
   
      catch (error) {
        if(error) {
            return res.status(403).json({
                success : false,
                message : "Unauthorized"
            })
        }
      }
    }
}

export default auth;