import { z } from "zod";
import { loginSchema, registerSchema } from "./schemas";

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginFormInput = z.infer<typeof loginSchema>;
