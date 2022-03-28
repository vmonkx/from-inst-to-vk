import axios from "axios";
import dotenv from "dotenv";
import queryString from "query-string";
import { MediaTypeInstEnum } from "./instagram";

dotenv.config();

interface ParamsSendStoriesVk {
  group_id: number;
  access_token: string;
}

function getUploadURLVk(methodName, params = {}) {
  return axios
    .post(
      `${process.env.VK_API}${methodName}?${params}&add_to_news=1&v=${process.env.VK_VERSION_API}`
    )
    .then((response) => {
      return response.data.response.upload_url;
    })
    .catch((err) => {
      console.warn("getUploadURLVk", err);

      throw err;
    });
}

export async function uploadStoriesVk(uploadUrl, formData) {
  return axios
    .post(uploadUrl, formData, { headers: formData.getHeaders() })
    .then((response) => {
      if (response.status === 200) {
        return response.data.response.upload_result;
      } else {
        return response.data;
      }
    })
    .catch((err) => {
      console.warn("uploadStoriesVk", err);

      throw err;
    });
}

async function saveStoriesVk(upload_result, access_token) {
  return axios
    .post(
      `${process.env.VK_API}stories.save?upload_results=${upload_result}&access_token=${access_token}&v=${process.env.VK_VERSION_API}`
    )
    .then((response) => {
      if (response.status === 200) {
        return response.data.response;
      } else {
        return response.data;
      }
    })
    .catch((err) => {
      console.warn("saveStoriesVk", err);
      throw err;
    });
}

export async function sendStoriesToVk(
  srcType = MediaTypeInstEnum.Image,
  formData,
  params: ParamsSendStoriesVk
) {
  const p = queryString.stringify(params);

  const typeMethod =
    srcType === MediaTypeInstEnum.Image
      ? "stories.getPhotoUploadServer"
      : "stories.getVideoUploadServer";
  try {
    const uploadUrl = await getUploadURLVk(typeMethod, p);
    const uploadResult = await uploadStoriesVk(uploadUrl, formData);
    const res = await saveStoriesVk(uploadResult, params.access_token);
    return res;
  } catch (error) {
    console.warn("sendStoriesToVk", error);
    throw error;
  }
}
