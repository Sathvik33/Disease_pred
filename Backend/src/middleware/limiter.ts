import { rateLimit } from "express-rate-limit";

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    message: { error: "too many requests, try again later" },
    standardHeaders: "draft-8" as any,
    legacyHeaders: false,
});

const diagnoseLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { error: "diagnosis limit reached, try again later" },
    standardHeaders: "draft-8" as any,
    legacyHeaders: false,
});

export { apiLimiter, diagnoseLimiter };
