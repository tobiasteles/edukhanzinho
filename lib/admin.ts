import { auth } from "@clerk/nextjs/server";

const adminIds = [
  "user_2zTiwmeur0umKHBR2Ae8AD8vDmt",
  "user_30ZT38hHqzHxEgQDA5tVYYli7fG",
  "user_30eqtuQWSDZlDBcT9ryWUGXrSh6",
"user_30YUqbde2BlVZmPVMvQouBIStOR",
"user_319PHfKsljZJCY5tcIeeG8GSbF9",
];

export const isAdmin = async () => {
  const { userId } = await auth();
  console.log(">> ID do usuário atual:", userId);
  if (!userId) {
    return false;
  }

  return adminIds.indexOf(userId) !== -1;
};
