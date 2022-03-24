import { Markup } from "telegraf";

export const storiesKeyboard = Markup.keyboard([
  "📦 Загрузить все сторис",
  "🖼 Выбрать вручную нужные сторис",
])
  .oneTime()
  .resize();
