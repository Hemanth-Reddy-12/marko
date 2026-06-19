import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { registerTaskRoutes } from "./modules/task/task.server.js";

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.get("/", (_, res) => {
    res.send("Marco API is running");
});

registerTaskRoutes(app);

app.listen(5000, () => {
    console.log("server running");
});
