import axios from "axios";
import FormData from "form-data";

import path from "path";

export enum MediaTypeInstEnum {
  Video = "VIDEO",
  Image = "IMAGE",
  Carusel = "CAROUSEL_ALBUM",
}

export interface StoriesFileInterface {
  caption: string;
  id: string;
  like_count: number;
  media_type: MediaTypeInstEnum;
  media_url?: string;
  owner: { id: string };
  permalink: string;
  thumbnail_url: string;
  username: string;
  shortcode: string;
  media_product_type: string;
  ig_id: string;
  timestamp: string;
}

export async function apiInstagramPosts() {
  const paginate = `10`;
  const hashtags = null;
  const hashtagsEnabled = hashtags === true || hashtags?.enabled;
  const hashtagsCommentDepth = hashtags?.commentDepth ?? 3;
  const commentsParam = hashtagsEnabled
    ? `,comments.limit(${hashtagsCommentDepth}){text}`
    : ``;

  const urlApiPOST = `https://graph.facebook.com/v11.0/${process.env.INSTAGRAM_ID}/media?fields=media_url,thumbnail_url,caption,media_type,like_count,shortcode,timestamp,comments_count,username,children{media_url},permalink${commentsParam}&limit=${paginate}&access_token=${process.env.INST_TOKEN}`;
  const urlApiSTORIES = `https://graph.facebook.com/v11.0/${process.env.INSTAGRAM_ID}/stories?access_token=${process.env.INST_TOKEN}`;

  return axios
    .get(urlApiSTORIES)
    .then(async (response) => {
      const results = [];
      results.push(...response.data.data);

      if (results.length > 0) {
        const storiesItems = results.reverse().map(async (story) => {
          const str = await getStoriesItem(story.id);
          return str;
        });
        return storiesItems;
      } else {
        return [];
      }
    })
    .catch(async (err) => {
      console.warn(
        `\nCould not get instagram posts using the Graph API. Error status ${err}`
      );
      throw err;
    });
}

async function getStoriesItem(idStories) {
  const urlGetStories = `https://graph.facebook.com/v11.0/${idStories}?fields=caption,id,like_count,media_type,media_url,permalink,thumbnail_url,username,children{caption},shortcode,media_product_type,ig_id,timestamp&access_token=${process.env.INST_TOKEN}`;
  return await axios.get(urlGetStories).then(async (response) => {
    return response.data;
  });
}

export async function uploadMediaFileStories(link, media_type) {
  return await axios
    .get(link, { responseType: "stream" })
    .then(async (response) => {
      const formData = new FormData();

      const fileName = path.basename(link.split("?")[0]);

      response.data.on("data", (chunk) => console.log(chunk.length));
      response.data.on("finish", () => {
        console.log("finish EVENT uploadMediaFileStories");
      });

      response.data.on("end", function () {
        console.log("END EVENT uploadMediaFileStories");
      });

      let uploadParams = "";

      switch (media_type) {
        case MediaTypeInstEnum.Image:
          uploadParams = "photo";
          break;
        case MediaTypeInstEnum.Video:
          uploadParams = "video_file";

        default:
          uploadParams = "photo";
          break;
      }

      formData.append(uploadParams, response.data, fileName);

      return formData;
    })
    .catch((err) => {
      throw err;
    });
}
