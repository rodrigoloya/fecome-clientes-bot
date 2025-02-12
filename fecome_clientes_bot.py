import logging
from typing import Final, Tuple
from datetime import datetime
#python -m pip install python-telegram-bot

from telegram import ReplyKeyboardMarkup, ReplyKeyboardRemove, Update
from telegram.ext import (Application, CommandHandler, MessageHandler,
                           filters, ContextTypes)

print ("Starting bot...")

TOKEN: Final = 'bbDSsBlTGmWU'
BOT_USERNAME: Final = '@Fa_bot'
# Variables globales
es_consulta = False
step = -1
cliente = ''
clientes = [
    {
        "nombre": "Manolo Taqueria",
        "razonSocial": "Taqueria Manolo S.A. de C.V.",
        "rfc": "MTAQ8794564654nv-f",
        "cta": "90-87999",
        "banco": "Santander"
    },
    {
        "nombre": "Tulum canceleria",
        "razonSocial": "Tulum canceleria S.A. de C.V.",
        "rfc": "TAc8794564654nv-f",
        "cta": "433290-8739",
        "banco": "Banamex"
    },
    {
        "nombre": "Hotel Barbados",
        "razonSocial": "Hotel Barbados S.A. de C.V.",
        "rfc": "JH564654nv-f",
        "cta": "43328933290-8739",
        "banco": "Banamex"
    },
    {
        "nombre": "Ihop",
        "razonSocial": "Ihop S.A. de C.V.",
        "rfc": "IHOPJH564654nv-f",
        "cta": "43328933290-8739",
        "banco": "HSBC"
    },
]

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
# set higher logging level for httpx to avoid all GET and POST requests being logged
logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

#Función para manejar el comando /start
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        keyboard = [
            ['Consultar Informacion', 'Registrar Deposito'],
        ]
        reply_markup = ReplyKeyboardMarkup(keyboard, one_time_keyboard=True)
        await update.message.reply_text(
            'Hola soy un asistonto, elige que necesitas?:', reply_markup = reply_markup)
        global step
        step = 0

#Lets us use the /help command
async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text('Try typing anything and I will do my best to respond \n send /start para iniciar\n send /help para esta ayuda\n send /custom para personalizar')


#Lets us use the /help command
async def custom_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text('This is your custom command')

def handle_response(text) -> Tuple[str, ReplyKeyboardMarkup]:
    #Create your own response logic
    global step, es_consulta, cliente, info_adicional, cliente_detalle
    if step == 0:
        tipo_servicio = text
        step = 1
        es_consulta = "consultar" in tipo_servicio
        keyboard = [
            ['Manolo Taqueria', 'Tulum canceleria'],
            ['Hotel Barbados', 'Ihop'],
        ]
        reply_markup = ReplyKeyboardMarkup(keyboard, one_time_keyboard=True)
        return { "text" : f'{tipo_servicio} de? ', "responseKeyboardMarkup": reply_markup}
    elif step == 1:
        cliente = text
        step = 2
        cliente_detalle = next(
            (p for p in clientes if p["nombre"].lower() == cliente), None)
        return{"text" :
            f'Los datos del cliente {cliente} son:\n'
            f'Razon Social: {cliente_detalle["razonSocial"]}\n'
            f'RFC: {cliente_detalle["rfc"]}\n'
            f'CTA: {cliente_detalle["cta"]}\n'
            f'Banco: {cliente_detalle["banco"]}\n\n'
            'Si requiere ingresar un monto de factura escriba el monto.', "responseKeyboardMarkup": None
        }
    elif step == 2:
        info_adicional = text
        step = -1
        if info_adicional and float(info_adicional) > 0:
            return { "text":
                f'Los datos del cliente {cliente} son:\n'
                f'Razon Social: {cliente_detalle["razonSocial"]}\n'
                f'RFC: {cliente_detalle["rfc"]}\n'
                f'CTA: {cliente_detalle["cta"]}\n'
                f'Banco: {cliente_detalle["banco"]}\n'
                f'Monto: ${info_adicional}\n'
                f'Fecha: {datetime.today().isoformat()}'
                , "responseKeyboardMarkup" : None
            }
        else:
            return {"text":
                ' Gracias por utilizar el servicio hasta la proxima.', "responseKeyboardMarkup" : None}
    else:
        return {"text":
            "escriba /start para iniciar una nueva solicitud o /help para ayuda", "responseKeyboardMarkup" : None}

    return retun("I dont understand", None)


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    #Get basic info of the incoming message
    message_type: str = update.message.chat.type
    text: str = str(update.message.text).lower()
    response = {} 

    #Print a log for debuggin
    print(f'User ({update.message.chat.id}) in {message_type}: "{text}"')

    #React to a group messages only if users mention the bot directly
    if message_type == 'group':
        # Replace with your bot usernam
        if BOT_USERNAME in text:
            new_text: str = text.replace(BOT_USERNAME, '').strip()
            response = handle_response(new_text)
        else:
            return # We dont want the bot reponse if its not metioned in the group
    else:
        response = handle_response(text)

    #reply normal if the message is in private
    print('Bot: ', response)

    if(response["responseKeyboardMarkup"] is None):
        await update.message.reply_text(response["text"])
    else:
        await update.message.reply_text(response["text"], reply_markup=response["responseKeyboardMarkup"])


#Log errors
def error(update: Update, context:ContextTypes.DEFAULT_TYPE):
    print(f'Update {update} caused error {context.error}')


if __name__ == '__main__':
    app = Application.builder().token(TOKEN).build()

    #Commands
    app.add_handler(CommandHandler('start', start_command))
    app.add_handler(CommandHandler('help', help_command))
    app.add_handler(CommandHandler('custom', custom_command))

    #Messages
    app.add_handler(MessageHandler(filters.TEXT, handle_message))

    # Log all errors
    app.add_error_handler(error)

    print ('Polling...')

    #Run the bot
    app.run_polling(poll_interval=5)


