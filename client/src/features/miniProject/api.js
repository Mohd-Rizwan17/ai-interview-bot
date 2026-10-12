import api from "../../api/axios.js";

export const fetchStacks = async () => {
  const { data } = await api.get("/mini-projects/stacks");

  return data.stacks;
};
