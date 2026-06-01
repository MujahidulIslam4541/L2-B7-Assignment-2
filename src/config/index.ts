import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  port: process.env.PORT as string,
  databaseUrl: process.env.DATABASE_URL as string,
};

export default config;
