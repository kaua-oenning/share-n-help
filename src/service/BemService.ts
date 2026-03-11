import { api } from "./api";

export async function getAllBens() {
  const data = await api.get("/bens");
  return data;
}

export async function salvarBem(bem: any) {
  const data = await api.post("/bens/salvar", bem);
  return data;
}
