const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { MONGODB_URI, JWT_SECRET } = process.env;

if (!MONGODB_URI) {
	throw new Error("Missing required environment variable: MONGODB_URI");
}

if (!JWT_SECRET || JWT_SECRET.length < 32) {
	throw new Error("JWT_SECRET must be set to at least 32 characters");
}

module.exports = { MONGODB_URI, JWT_SECRET };