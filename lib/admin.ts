import { auth } from "@clerk/nextjs/server";

const adminIds = ["user_2zTiwmeur0umKHBR2Ae8AD8vDmt"];

export const isAdmin = async () => {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  return adminIds.indexOf(userId) !== -1;
};
