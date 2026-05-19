import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
	let token;

	if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
		token = req.headers.authorization.split(" ")[1];
		
		if (token && token !== "null" && token !== "undefined") {
			try {
				const decoded = jwt.verify(token, process.env.JWT_SECRET);
				req.user = await User.findById(decoded.id).select("-password");
				return next();
			} catch (error) {
				return res.status(401).json({ message: "Not authorized, token failed" });
			}
		}
	}

	if (!token || token === "null" || token === "undefined") {
		return res.status(401).json({ message: "Not authorized, no token" });
	}
};
