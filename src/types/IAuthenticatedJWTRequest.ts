import express from "express";
import { Role } from "../entity/Role";
import { Request } from "express";

export interface IAuthenticatedJWTRequest extends Request {
    headers: any;
    signedInUser?: {
        email: string;
        role: string;
    };
    ip: string; 
}