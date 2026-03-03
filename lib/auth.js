import jwt from "jsonwebtoken";

export function signJwt(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwt(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function getBearerToken(req) {
  const h = req.headers.get("authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}
