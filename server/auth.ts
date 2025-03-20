import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateToken(user: SelectUser): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET must be set in environment variables');
  }
  const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '24h' });
  console.log('Generated token for user:', user.username);
  return token;
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ message: 'JWT_SECRET not configured' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: number; username: string };
    req.user = { id: decoded.id, username: decoded.username } as SelectUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function setupAuth(app: Express) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET must be set in environment variables');
  }

  app.use(passport.initialize());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  app.post("/api/register", async (req, res) => {
    try {
      console.log('Register attempt for username:', req.body.username);
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log('Registration failed: Username already exists');
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      const token = generateToken(user);
      console.log('Registration successful for:', user.username);
      res.status(201).json({ user, token });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log('Login attempt for username:', req.body.username);
    passport.authenticate(
      "local",
      { session: false },
      (err: Error | null, user: SelectUser | false) => {
        if (err) {
          console.error('Login error:', err);
          return next(err);
        }
        if (!user) {
          console.log('Login failed: Invalid credentials');
          return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = generateToken(user as SelectUser);
        console.log('Login successful for:', user.username);
        res.json({ user, token });
      }
    )(req, res, next);
  });

  app.get("/api/user", authenticateJWT, (req, res) => {
    console.log('User info requested for:', req.user?.username);
    res.json(req.user);
  });
}
