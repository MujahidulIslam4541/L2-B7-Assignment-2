import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  port: process.env.PORT as string,
  databaseUrl: process.env.DATABASE_URL as string,
  accessToken: process.env.ACCESS_TOKEN_SECRET as string,
  refreshToken: process.env.REFRESH_TOKEN_SECRET as string,
  accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION as string,
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION as string,
};

export default config;
