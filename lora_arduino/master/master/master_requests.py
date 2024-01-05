import serial
import requests
import re

"""
Codi que es comunica mitjançant el port sèrie amb el master per realitzar les peticions a la API necessàries per 
al bon funcionament de l'aplicació
"""

# URL de la API JSONPlaceholder para obtener la lista de usuarios
url = "https://jsonplaceholder.typicode.com/users"

def comprovaDispositiuExistent(idDispo_hardcoded):
    """
    Per comprovar si el dispositiu està guardat a la base de dades i està assignat a un usuari.
    """
    try:
        # Realitzar una petició per obtenir la informació del dispositiu
        url = "http://localhost:5000/comprovacioDispositiuInserit?idHardcode=" + idDispo_hardcoded 
        response = requests.get(url)

        # verificar si la sol·licitud és exitosa (codi d'estat 200)
        if response.status_code == 200:
            resposta_json = response.json()
            if resposta_json["success"]: # la petició ha anat bé
                return (resposta_json["dispositiuTrobat"], resposta_json["assignat"])

        # s'ha produit algun error en la petició
        return None
    
    except:
        return None

def insereixDispositiu(idDispo_hardcoded):
    """
    Per inserir el dispositiu a la base de dades.
    """
    try:
        # Realitzar una petició per inserir el dispositiu
        url = "http://localhost:5000/inserirDispositiu"
        dades_json = {
            "idHardcode": idDispo_hardcoded,
            "llindarMinimReg": 50, # canviar per valors reals
            "llindarMaximReg": 75
        }
        response = requests.post(url, json = dades_json)

        # verificar si la sol·licitud és exitosa (codi d'estat 200)
        if response.status_code == 200:
            return True
        else: # s'ha produit algun error en la petició
            return False
    
    except:
        return False

def comprovaModificacionsLlindars(idDispo_hardcoded):
    """
    Per demanar si els llindars del dispositiu s'han modificat.
    """
    try:
        # Realitzar una petició per obtenir la informació del dispositiu
        url = "http://localhost:5000/obtenirModificacionsLlindars?idHardcode=" + idDispo_hardcoded
        response = requests.get(url)

        # verificar si la sol·licitud és exitosa (codi d'estat 200)
        if response.status_code == 200:
            resposta_json = response.json()
            if resposta_json["success"]: # la petició ha anat bé
                dades = resposta_json["dades"]
                if len(dades) > 0: # s'ha modificat algun llindar
                    llindarMinimReg = dades["llindarMinimReg"]
                    llindarMaximReg = dades["llindarMaximReg"]

                    return (llindarMinimReg, llindarMaximReg) 

        # s'ha produit algun error en la petició o no hi han llindars a modificar
        return tuple()
    
    except:
        return tuple()

def enviaDades(idDispo_hardcoded, humitat, temperatura):
    """
    Per enviar les dades d'humitat i temperatura del dispositiu.
    """
    try:
        # Realitzar una petició per inserir la dada
        url = "http://localhost:5000/inserirDada"
        dades_json = {
            "idHardcode": idDispo_hardcoded,
            "dadaHum": humitat,
            "dadaTemp": temperatura
        }
        response = requests.post(url, json = dades_json)

        # verificar si la sol·licitud és exitosa (codi d'estat 200)
        if response.status_code == 200:
            return True
        else: # s'ha produit algun error en la petició
            return False
    
    except:
        return False

def enviaEstatReg(idDispo_hardcoded, estatReg):
    """
    Per enviar l'estat del reg
    """
    try:
        # Realitzar una petició per inserir la dada
        url = "http://localhost:5000/inserirEstatReg"
        dades_json = {
            "idHardcode": idDispo_hardcoded,
            "estatReg": estatReg
        }
        response = requests.post(url, json = dades_json)

        # verificar si la sol·licitud és exitosa (codi d'estat 200)
        if response.status_code == 200:
            return True
        else: # s'ha produit algun error en la petició
            return False
    
    except:
        return False

if __name__ == '__main__':
    try:
        # Configura el port sèrie
        ser = serial.Serial('/dev/ttyACM0', 9600)
        
        while True:
            # llegeix una línia pel port sèrie
            data = ser.readline().decode('utf-8').strip()
            print(data)
            
            # depenent del que s'hagi rebut, realitza una petició o una altra o no en realitza cap
            
            # si la dada comença per '?' està el slave acaba de començar la connexió i vol saber si 
            # s'ha canviat algun paràmetre
            # format: "?-idHardcoded"
            if data.startswith('?-'):
                # obtenim el id hardcoded del dispositiu
                idDispo_hardcoded = data.split('?-', 1)[1]

                result = comprovaDispositiuExistent(idDispo_hardcoded)

                if result is not None:
                    if result[0] and result[1]: # el dispositiu està guardat i assignat
                        # comprovem si el dispositiu té paràmetres a modificar
                        modificacions = comprovaModificacionsLlindars(idDispo_hardcoded)
                        
                        if not modificacions: # no hi han paràmetres a modificar
                            ser.write("NO".encode('utf-8'))

                        else:
                            #responem amb format "CP-min:45.0max:70.6"
                            llindarMin = modificacions[0]
                            llindarMax = modificacions[1]
                            resposta = "CP-min:" + str(llindarMin) + "max:" + str(llindarMax)
                            ser.write(resposta.encode('utf-8'))


                    elif result[0]: # el dispositiu està guardat i desassignat
                        # responem que el dispositiu no té un usuari assignat
                        ser.write("NOASS".encode('utf-8'))

                    else: # el dispositiu no està guardat
                        #inserim el dispositiu a la base de dades
                        insereixDispositiu(idDispo_hardcoded)
                        # responem que el dispositiu no té un usuari assignat (donat que no estava guardat)
                        ser.write("NOASS".encode('utf-8'))

                else: # error
                    ser.write("NOASS".encode('utf-8'))

            # si la dada comença per 'd', significa que ens està enviant les dades d'humitat i de temperatura
            # format: "d-idHardcode-H:100T:40"
            elif data.startswith('d-'):
                # obtenim el id hardcoded del dispositiu
                idDispo_hardcoded = data.split('-', 2)[1]

                # obtenim les dades d'humitat i temperatura
                try:
                    parts = data.split(':')
                    humitat = float(parts[1].split('T')[0])
                    temperatura = float(parts[2])
                    
                except:
                    # si no es corresponen a floats informem
                    ser.write("MAL".encode('utf-8'))  

                else:
                    # guardem la dada  
                    enviaDades(idDispo_hardcoded, humitat, temperatura)

                    # responem 
                    ser.write("OK".encode('utf-8'))   

            # si la dada comença per 'r', significa que està enviant l'estat del reg
            # format: "r-idHarccode-estatReg", on estatReg pot ser "ON" o "OFF"
            elif data.startswith('r-'):
                parts = data.split('-', 2)
                #obtenim el id hardcoded del dispositiu
                idDispo_hardcoded = parts[1]

                #obtenim l'estat del reg
                estatRegRebut = parts[2]
                if estatRegRebut == "ON" or estatRegRebut == "OFF":
                    estatReg = estatRegRebut == "ON"

                    # guardem l'estat del reg
                    enviaEstatReg(idDispo_hardcoded, estatReg)
                    # responem 
                    ser.write("OK".encode('utf-8')) 
                    
                else:
                    # si l'estat del reg no es correspon ni a "ON" ni a "OFF", s'informa
                    ser.write("MAL".encode('utf-8')) 

    except KeyboardInterrupt:
        # tanca el port sèrie
        ser.close()
        print("Port sèrie tancat.")
