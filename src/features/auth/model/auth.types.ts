import { z } from "zod";
import { registerSchema } from "./register.schema";
import { loginSchema } from "./login.schema";

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
