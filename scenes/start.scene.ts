import { Context, Scenes } from "telegraf";
import { MyContext } from "..";
import { storiesKeyboard } from "../keyboards/stories.keyb";

// Handler factories
const { enter, leave } = Scenes.Stage;

export const startScene = new Scenes.BaseScene<MyContext>("start");

startScene.enter((ctx) => {
  ctx.replyWithHTML(
    `👋 Приветствую тебя, <b>${
      ctx.message ? ctx.message.from.first_name : ""
    }</b>! \nЯ могу загрузить "сторисы" в вк из твоего инстаграм .\nВыбери тип загрузки:`,
    storiesKeyboard
  );
});
startScene.hears(
  "🖼 Выбрать вручную нужные сторис",

  (ctx) => {
    return ctx.scene.enter("manualUpload");
  }
);
startScene.hears("📦 Загрузить все сторис", (ctx) => {
  return ctx.scene.enter("autoUpload");
});
