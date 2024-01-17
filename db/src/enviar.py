import smtplib
import os
from dotenv import load_dotenv
load_dotenv()

from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart

# Configuración de la cuenta de Gmail
gmail_user = 'sensor.center.isgrupa@gmail.com'
gmail_password = os.getenv("GMAIL_PASSWORD")

# Direcciones de correo electrónico
from_email = 'sensor.center.isgrupa@gmail.com'
to_email = 'xavier.massana@estudiantat.upc.edu'

# Crear el mensaje
subject = 'Aquest correu es totalment de prova'
body = 'En aquesta part del text senviara un codi random'


def send_email(subject, body, to_email):
    message = MIMEText(body)
    message['From'] = 'sensor.center.isgrupa@gmail.com'
    message['To'] = to_email
    message['Subject'] = subject

    # Configurar la conexión con el servidor SMTP de Gmail
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
    
        # Iniciar sesión en la cuenta de Gmail
        smtp_server.login('sensor.center.isgrupa@gmail.com', os.getenv("GMAIL_PASSWORD"))
    
        # Enviar el correo electrónico
        smtp_server.sendmail('sensor.center.isgrupa@gmail.com', to_email, message.as_string())