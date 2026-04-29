import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "ahsadksNmfdhjkbedfmcdvblmbmmsnandbnlmmbjmhsdsfzdgxhlelhukyDVAHF";

export interface AuthRequest extends Request {
  userId?: number;
}

const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "token required" });
    return;
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secret) as { id: number };
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "invalid token" });
  }
};

export const signToken = (id: number): string =>
  jwt.sign({ id }, secret, { expiresIn: "7d" });

export default auth;