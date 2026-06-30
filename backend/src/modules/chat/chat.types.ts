import { z } from "zod";
import { initInterviewSchema } from "./chat.validate.js";

export type InitInterviewDTO = z.infer<typeof initInterviewSchema>;
