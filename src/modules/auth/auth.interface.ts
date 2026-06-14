import type { ROLES } from "../../types";

export interface  IUser {
    name : string,
    email : string,
    password : string,
    role? : ROLES
}

export interface ILogin {
    email : string,
    password : string
}