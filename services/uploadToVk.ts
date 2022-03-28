import { MediaTypeInstEnum, uploadMediaFileStories } from "./instagram";
import { sendStoriesToVk } from "./vk";

export const uploadMediaToVK = async (
  link: string,
  media_type: MediaTypeInstEnum
) => {
  try {
    const formData = await uploadMediaFileStories(link, media_type);

    const res = await sendStoriesToVk(media_type, formData, {
      group_id: +process.env.VK_GROUP_ID,
      access_token: process.env.VK_TOKEN,
    });
    return res;
  } catch (error) {
    console.warn("uploadMediaToVK", error);

    throw error;
  }
};
