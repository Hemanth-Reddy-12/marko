import "dotenv/config";
import express from "express";
import cors from "cors";
import { registerTaskRoutes } from "./modules/task/task.server.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
    res.send("Marco API is running");
});

registerTaskRoutes(app);

app.listen(5000, () => {
    console.log("server running");
});
