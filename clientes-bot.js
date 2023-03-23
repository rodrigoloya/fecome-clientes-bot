const TelegramBot = require('node-telegram-bot-api');

// Reemplaza el token con el token de tu bot de Telegram
//console.log(process.env);
const token = process.env.telegram_token;


// Crea el bot con el token
const bot = new TelegramBot(token, { polling: true });
let esConsulta = false;
let step = -1;
let cliente = '';

// Manejador de comando /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Bienvenido Fernando, elige que necesitas?:',
        {
            reply_markup: {
                keyboard: [
                    ['Consultar Informacion', 'Registrar Deposito'],
                ],
                one_time_keyboard: true,
               // callback_data: 'servicio',
            },
        });
    step = 0;
});

// Manejador para recibir el nombre del usuario
bot.on('message', (msg) => {
    if (msg.text !== '/start') {

        if (step === 0) {

            // Almacena el tipo de servicio seleccionado por el usuario en una variable
            tipoServicio = msg.text;
            step = 1;
            esConsulta = (tipoServicio.toLocaleLowerCase().indexOf("consultar") >= 0)
            // Pide al usuario que seleccione un tipo de servicio utilizando opciones múltiples
            bot.sendMessage(
                msg.chat.id,
                `${tipoServicio} de?`,
                {
                    reply_markup: {
                        keyboard: [
                            ['Manolo Taqueria', 'Tulum canceleria'],
                            ['Hotel Barbados', 'Ihop'],
                        ],
                        one_time_keyboard: true,
                     //   callback_data: 'servicio',
                    },
                }
            );
        }
        else if (step === 1) {

            cliente = msg.text;

            step = 2;
            clienteDetalle = clientes.find(p => p.nombre === cliente);

            // Pide al usuario que ingrese un texto libre para proporcionar más información
            bot.sendMessage(
                msg.chat.id,
                `Los datos del cliente  ${cliente} 
          Razon Social : ${clienteDetalle.razonSocial}  
          RFC : ${clienteDetalle.rfc} 
          CTA : ${clienteDetalle.cta} 
          Banco : ${clienteDetalle.banco} 

Si requiere ingresar un monto de factura escriba el monto.`  );
        }
        else if (step === 2) {

            // Almacena la información adicional proporcionada por el usuario en una variable
            infoAdicional = msg.text;
            step = -1;
            if (infoAdicional && infoAdicional > 0) {
                bot.sendMessage(
                    msg.chat.id,
                    `Gracias por proporcionar la informacion. Ya puede reenviar el siguiente mensaje a su secretaria por telegram.`);
          
                bot.sendMessage(
                msg.chat.id,
`Los datos del cliente  ${cliente} 
Razon Social : ${clienteDetalle.razonSocial }  
RFC : ${clienteDetalle.rfc } 
CTA : ${ clienteDetalle.cta} 
Banco : ${ clienteDetalle.banco}
Monto :$ ${infoAdicional}
Fecha: ${new Date().toISOString()}`
                );
            }
            else {
                bot.sendMessage(
                    msg.chat.id,
                    ` Gracias por utilizar el servicio hasta la proxima.`);
            }
        }
        else {
            bot.sendMessage(
                msg.chat.id,
                "escriba /start para iniciar una nueva solicitud"
            );
        }
    }
});

let tipoServicio = '';


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

   // bot.editMessageText(text, opts);
});

const clientes = [
    {
        nombre: "Manolo Taqueria",
        razonSocial: "Taqueria Manolo S.A. de C.V.",
        rfc: "MTAQ8794564654nv-f",
        cta: "90-87999",
        banco: "Santander"
    },
    {
        nombre: "Tulum canceleria",
        razonSocial: "Tulum canceleria S.A. de C.V.",
        rfc: "TAc8794564654nv-f",
        cta: "433290-8739",
        banco: "Banamex"
    },
    {
        nombre: "Hotel Barbados",
        razonSocial: "Hotel Barbados S.A. de C.V.",
        rfc: "JH564654nv-f",
        cta: "43328933290-8739",
        banco: "Banamex"
    },
    {
        nombre: "Ihop",
        razonSocial: "Ihop S.A. de C.V.",
        rfc: "IHOPJH564654nv-f",
        cta: "43328933290-8739",
        banco: "HSBC"
    },
];

