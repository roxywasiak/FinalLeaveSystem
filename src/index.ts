// src/index.ts
import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { Server } from "./Server";
import { Router } from "express";
import { AppDataSource } from "./data-source";

import { LoginRouter }       from "./routes/LoginRouter";
import { RoleRouter }        from "./routes/RoleRouter";
import { UserRouter }        from "./routes/UserRouter";
import { LeaveRequestRouter }       from "./routes/LeaveRequestRouter";
import { UserManagementRouter }     from "./routes/UserManagementRouter";

import { LoginController }   from "./controllers/LoginController";
import { RoleController }    from "./controllers/RoleController";
import { UserController }    from "./controllers/UserController";
// import { LeaveRequestController }   from "./controllers/LeaveRequestController";
// import { UserManagementController } from "./controllers/UserManagementController";

const DEFAULT_PORT = 7063;
const port = process.env.SERVER_PORT ?? DEFAULT_PORT;

if (!process.env.SERVER_PORT) {
  console.log(`PORT environment variable is not set, defaulting to ${DEFAULT_PORT}`);
}

const routers = [
  new LoginRouter(Router(),            new LoginController()),
  new RoleRouter(Router(),             new RoleController()),
  new UserRouter(Router(),             new UserController()),
  new LeaveRequestRouter(),
  new UserManagementRouter(),
];

const server = new Server(port, routers, AppDataSource);
server.start();
