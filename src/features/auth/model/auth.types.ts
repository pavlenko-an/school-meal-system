import { z } from "zod";
import { registerSchema } from "./register.schema";

export type RegisterInput = z.infer<typeof registerSchema>;
