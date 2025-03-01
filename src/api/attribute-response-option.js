import { apiRoutes } from "../apiRoutes";
import axios from "axios";

export const getAttributeResponseOptions = async ({ queryKey }) => {
  const [, attributeTypeId] = queryKey;
  return await axios.get(
    `${apiRoutes.attributeResponseOption}/GetAllByAttributeTypeId/${attributeTypeId}`
  );
};

export const getAllAttributeResponseOptions = async () => {
  return await axios.get(`${apiRoutes.attributeResponseOption}`);
};
