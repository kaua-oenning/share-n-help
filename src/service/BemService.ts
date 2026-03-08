import { api } from "./api";

export async function getAllBens() {
  const data = await api.get("/bens");
  return data;
}
