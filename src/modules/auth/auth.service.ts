import config from "../../config";
import { pool } from "../../db";
import type { ROLES } from "../../types";
import type { IUser, ILogin } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const allowedRoles: ROLES[] = ["contributor", "maintainer"];

const regUsers = async (payload : IUser) => {
    const {name , email, password, role } = payload;

    //validation
    if(role && allowedRoles.includes(role) === false ) {
        throw new Error ("Invalid role");
    }


    const hashPassword = await bcrypt.hash(password, 10);
    //signup
    const result = await pool.query(`
        
        INSERT INTO users(name, email, password, role)
        VALUES ($1, $2, $3, COALESCE($4,'contributor')) RETURNING *`, [name, email, hashPassword, role],
       );
       delete result.rows[0].password;
       return result;
};

const loginUSerService = async (payload : ILogin) => {
    const {email, password} = payload;
    
    const userData = await pool.query(` 
        SELECT * FROM users WHERE email = $1`, [email]);

    if(userData.rows.length ===0) {
        throw new Error("Invalid Credential!!");
    }   
    const user = userData.rows[0];
    
    const matchPass = await bcrypt.compare(password, user.password);

    if(matchPass === false ) {
        throw new Error("Invalid Credential!!");
    }

    //
    delete user.password;
    const jwtpayload = {
        id : user.id,
        name : user.name,
        email : user.email,
        role : user.role
    }

    const accessToken = jwt.sign( jwtpayload, config.secret as string, {expiresIn : "1d"});


    return {token : accessToken, user}

} 

export const authService = {
    regUsers,
    loginUSerService
}