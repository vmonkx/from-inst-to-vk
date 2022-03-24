import { Context, Markup, Scenes } from "telegraf";
import { MyContext } from "..";
import {
  apiInstagramPosts,
  MediaTypeInstEnum,
  StoriesFileInterface,
} from "../services/instagram";
import { manualUploadKeyboard } from "../keyboards/manulUpload.keyb";
import { uploadMediaToVK } from "../services/uploadToVk";

// manualUploadScene scene
export const manualUploadScene = new Scenes.BaseScene<MyContext>(
  "manualUpload"
);
manualUploadScene.enter(async (ctx) => {
  ctx.reply("Начинаю искать 🔎 \nОжидайте...", manualUploadKeyboard);

  try {
    const stories = (await Promise.all(await apiInstagramPosts())) as [
      StoriesFileInterface
    ];

    

    if (stories.length > 0) {
      ctx.scene.session.stories ??= stories;

      ctx.reply("Вот что мне удалось найти: 🤔");
      stories.forEach(async (story: StoriesFileInterface) => {
        return await ctx.replyWithPhoto(
          {
            url:
              story.media_type === MediaTypeInstEnum.Image
                ? story.media_url
                : story.thumbnail_url,
          },
          {
            caption: `Дата: ${new Date(
              story.timestamp
            ).toLocaleDateString()} ${new Date(
              story.timestamp
            ).toLocaleTimeString()}
                  \nОписание:  ${story.caption},\nCсылка на сторис:  ${
              story.permalink
            }`,
            ...Markup.inlineKeyboard([
              story.media_url
                ? Markup.button.callback(
                    "Загрузить в вк 📤",
                    `upload_vk@${story.id}`
                  )
                : Markup.button.callback(
                    "Данный сторис нельзя загрузить 🚫",
                    "cannot_upload"
                  ),
            ]),
          }
        );
      });
    } else {
      ctx.reply(
        "В данный момент у вашего аккаунта инстаграм отсутвуют сторисы 😔"
      );
    }
  } catch (error) {
    ctx.reply(
      `⛔️ Что-то пошло не так: \n${error}\n\nПопробуйте начать заново 🔄 /start`
    );
  }
});

manualUploadScene.action(/(upload_vk@)([\w-]{2,50})$/, async (ctx) => {
  const story = ctx.scene.session.stories?.find(
    (story) => story.id === ctx.match[2]
  );

  
  try {
    const res = await uploadMediaToVK(story.media_url, story.media_type);
    if (res.count > 0) {
      ctx.deleteMessage();

      return ctx.reply(`✅ Сторис ${story.caption} успешно загружен в вк 😎`);
    }
  } catch (error) {
    ctx.reply(
      `⛔️ Что-то пошло не так: \n${error}\n\nПопробуйте начать заново 🔄 /start`
    );
  }

  return;
});

manualUploadScene.hears("Вернуться обратно", async (ctx) => {
  return ctx.reply(
    "При выходе из ручного режима загрузки, поиск сторисов придется повторить. \nВы точно хотите вернуться в главное меню?🤔",
    Markup.inlineKeyboard([
      Markup.button.callback("Я понимаю", `exit_scene`),
      Markup.button.callback("Нет, продолжаем", "cancel_exit"),
    ])
  );
});

manualUploadScene.action("exit_scene", (ctx) => ctx.scene.enter("start"));
manualUploadScene.action("cancel_exit", (ctx) => ctx.reply("Продолжаем 😎"));

manualUploadScene.action("cannot_upload", (ctx) =>
  ctx.reply(
    "Скорее всего сторис содержит материалы, защищенные авторскими правами, или был помечен как нарушающий авторские права. Такие сторис facebook не дает выгружать 😐"
  )
);

manualUploadScene.use((ctx) =>
  ctx.replyWithMarkdown(
    "Пожалуйста выберите кнопку и нажмите на неё или \nпопробуйте начать сначала 🔄 /start"
  )
);
