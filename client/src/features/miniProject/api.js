import api from "../../api/axios.js";

export const fetchStacks = async () => {
  const { data } = await api.get("/mini-projects/stacks");

  return data.stacks;
};

export const getProjectWork = async (attemptId) => {
  const { data } = await api.get(`/mini-projects/${attemptId}`);

  return data;
};

export const putProjectFiles = async (attemptId, { files, folders }) => {
  const { data } = await api.put(`/mini-projects/${attemptId}/files`, {
    files,
    folders,
  });

  return data;
};
