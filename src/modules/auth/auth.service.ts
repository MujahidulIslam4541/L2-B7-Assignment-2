import type { IUser } from "./auth.types";

const userDataSaveInDb = async (userData: IUser) => {
  console.log("Received user data:", userData);
};

export const authService = {
  userDataSaveInDb,
};
