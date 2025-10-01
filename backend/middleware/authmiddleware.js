import jwt from "jsonwebtoken";
// import { token } from "morgan";

export const authMiddleware = (req, res, next) => {
  // Get token from Authorization header
// const authHeader =req.cookies.token;
const authHeader=req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>
    console.log("Auth Header:", authHeader);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Invalid token", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};
