import dotenv from "dotenv";

dotenv.config();

const required = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicModel: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
};
