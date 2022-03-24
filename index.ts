import { Context, Markup, Scenes, session, Telegraf } from "telegraf";
import dotenv from "dotenv";
import { storiesKeyboard } from "./keyboards/stories.keyb";

import { manualUploadScene } from "./scenes/manualUpload.scene";
import { startScene } from "./scenes/start.scene";
import { StoriesFileInterface } from "./services/instagram";
import { autoUploadScene } from "./scenes/autoUpload.scene";

dotenv.config();

interface SessionData {
  stories: [StoriesFileInterface];
  // ... more session data go here
}

export type MyContext = Scenes.SceneContext<MySceneSession>;

export interface MySceneSession extends Scenes.SceneSessionData {
  // will be available under `ctx.scene.session.mySceneSessionProp`
  stories: [StoriesFileInterface];
}

if (process.env.BOT_TOKEN === undefined) {
  throw new TypeError("BOT_TOKEN must be provided!");
}

// Create your bot and tell it about your context type
const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN);

const stage = new Scenes.Stage<MyContext>(
  [startScene, manualUploadScene, autoUploadScene],
  {
    default: "start",
  }
);
// Make session data available
bot.use(session());
bot.use(Telegraf.log());
bot.use(stage.middleware());

bot.start(async (ctx) => {
  ctx.scene.enter("start");
});

// Launch bot
// eslint-disable-next-line @typescript-eslint/no-floating-promises
/* bot.launch(); */

bot.telegram.setWebhook(`${process.env.URL}/bot${process.env.BOT_TOKEN}`);
bot.launch({
  webhook: {
    port: parseInt(process.env.PORT),
    tlsOptions: null,
    hookPath: `/bot${process.env.BOT_TOKEN}`,
  },
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
