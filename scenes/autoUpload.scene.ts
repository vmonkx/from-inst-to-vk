import { Scenes } from "telegraf";
import { MyContext } from "..";
import { apiInstagramPosts, StoriesFileInterface } from "../services/instagram";
import { uploadMediaToVK } from "../services/uploadToVk";

export const autoUploadScene = new Scenes.BaseScene<MyContext>("autoUpload");

autoUploadScene.enter(async (ctx) => {
  try {
    const stories = (await Promise.all(await apiInstagramPosts())) as [
      StoriesFileInterface
    ];

    if (stories.length > 0) {
      await ctx.reply("Начинаю загружать 📤 \nОжидайте...");
      const resUploads = await Promise.all(
        stories.map((story: StoriesFileInterface) => {
          if (story.media_url) {
            const res = uploadMediaToVK(story.media_url, story.media_type);
            return res;
          }
        })
      );
      await ctx.reply(
        `✅ Сторис в количестве ${resUploads.length} шт. успешно загружен в вк 🎉`
      );
    }
  } catch (error) {
    ctx.reply(
      `⛔️ Что-то пошло не так: \n${error}\n\nПопробуйте начать заново 🔄 /start`
    );
  }

  return ctx.reply(`Начать заново 🔄 /start`);
});
