const TelegramBot = require('node-telegram-bot-api');

// Reemplaza el token con el token de tu bot de Telegram
const token = 'token' //'6058863938:AAFVnnvVmY5uoa79MTu8nNoeW3MuhTkpmXA';

// Crea el bot con el token
const bot = new TelegramBot(token, { polling: true });

let step = -1;
// Manejador de comando /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Cual es tu nombre?:');
  step =0;
});

// Manejador para recibir el nombre del usuario
bot.on('message', (msg) => {
  if (msg.text !== '/start') {
    
    if(step === 0){

    
    
    // Almacena el nombre del usuario en una variable
    nombre = msg.text;
     step = 1;
    // Pide al usuario que seleccione un tipo de servicio utilizando opciones múltiples
    bot.sendMessage(
      msg.chat.id,
      `${nombre} ¿qué tipo de servicio estas recibiendo?`,
      {
        reply_markup: {
          keyboard: [
            ['Anticipo', 'Vidrieria'],
            ['Inversiones', 'Otro'],
          ],
          one_time_keyboard: true,
          callback_data: 'servicio',
        },
      }
    );
    }
    else if (step === 1){

    // Almacena el tipo de servicio seleccionado por el usuario en una variable
    tipoServicio = msg.text;
    step = 2;
        // Pide al usuario que ingrese un texto libre para proporcionar más información
        bot.sendMessage(
          msg.chat.id,
          `¿Proporciona el RFC para facturar el servicio de ${tipoServicio}?`,
          { reply_markup: { remove_keyboard: true } }
        );
    }
    else if (step === 2){

        // Almacena la información adicional proporcionada por el usuario en una variable
        infoAdicional = msg.text;
        step = -1;
        // Envía un mensaje de confirmación al usuario con la información recopilada
        bot.sendMessage(
        msg.chat.id,
        `${nombre} Gracias por proporcionar la información. Se emitira tu factura para ${tipoServicio} con RFC: ${infoAdicional}`
        );
            }
            else {
                bot.sendMessage(
                    msg.chat.id,
                    "escriba /start para iniciar una nueva solicitud"
                    );
            }
  }
});
let nombre = '';
let tipoServicio='';
let infoAdicional = '';
 

 

bot.on('polling_error', (error) => {
    console.log(error.code);  // => 'EFATAL'
  });

  // Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };
    let text;
    console.log(action);
    if (action === 'edit') {
      text = 'Edited Text';
    }
  
    bot.editMessageText(text, opts);
  });
