require('dotenv').config();
const { Bot, GrammyError, HttpError, InlineKeyboard } = require('grammy');
const { hydrate } = require('@grammyjs/hydrate');

const bot = new Bot(process.env.BOT_API_KEY);

bot.use(hydrate());

bot.api.setMyCommands([
  {
    command: 'start',
    description: 'Запуск бота',
  },
  {
    command: 'menu',
    description: 'Получить меню',
  },
]);

bot.command('start', async (ctx) => {
  await ctx.react('👍');
  await ctx.reply(
    'Привет\\! Я – бот\\. Тг канал: [это ссылка](https://t.me/pomazkovjs)',
    {
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    },
  );
});

const menuKeyboard = new InlineKeyboard()
  .text('Узнать статус заказа', 'order-status')
  .text('Обратиться в поддержку', 'support');
const backKeyboard = new InlineKeyboard().text('< Назад в меню', 'back');

bot.command('menu', async (ctx) => {
  await ctx.reply('Выберите пункт меню', {
    reply_markup: menuKeyboard,
  });
});

bot.callbackQuery('order-status', async (ctx) => {
  await ctx.callbackQuery.message.editText('Статус заказа: в пути', {
    reply_markup: backKeyboard,
  });

  await ctx.answerCallbackQuery();
});

bot.callbackQuery('support', async (ctx) => {
  await ctx.callbackQuery.message.editText('Напишите, пожалуйста, Ваш запрос', {
    reply_markup: backKeyboard,
  });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery('back', async (ctx) => {
  await ctx.callbackQuery.message.editText('Выберите пункт меню', {
    reply_markup: menuKeyboard,
  });
  await ctx.answerCallbackQuery();
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }
});

bot.start();
