"""
Programa que, mitjançant els mètodes get i post, permet consultar i inserir dades en una base
de dades. Per a cada petició, s'especifica com ha de ser el format de la sol·licitud i quin
serà el format de la resposta en cas de que funcioni correctament. En cas contrari, la
resposta sempre tindrà el mateix format:

```json
{
    "success" = False,
    "error" = "descripció del error"
}   
```

Llibreries necessàries instal·lació:

```
pip3 install pytz
```
"""

from flask import Flask, request, jsonify
from mariaDB import mariaDBConn
import hashlib
from datetime import datetime
import pytz
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources = {r"/*": {"origins": "http://localhost:3000"}})
# connexió a la base de dades
db = mariaDBConn('localhost', 'arnau', 'isgrupA', 'integracioSistemes')
db.conecta()

# llista en la qual es guarden els llindars que s'han modificat. S'emmagatzemen en forma de diccionaris
# amb la forma següent: {'idDispositiu': (int), 'llindarMinimReg': (decimal), 'llindarMaximReg': (decimal)}
llindarsModificats = []

def __posicio_llindarDispositiu(idHardcode):
    """
    Per saber la posició on es troba la modificació del llindar d'un dispositiu de la llista 
    llindarsModificats.  

    Args:
        idHardcode (str): identificador del dispositiu del qual es vol saber els llindars.

    Returns:
        int: Retorna la posició on es troba la modificació del llindar d'un dispositiu de la llista 
            llindarsModificats. Si no troba cap modificació de llindars pel dispositiu, retorna -1.  
    """
    for i, dict in enumerate(llindarsModificats):
        if dict['idHardcode'] == idHardcode:
            return i

    else:
        return -1    
    
@app.route('/inserirProva', methods = ['POST'])
def inserirProva():
    """
    Endpoint de Flask per inserir dades a la taula provesDoctests.

    Mètode: POST
    Format de dades esperat: JSON

    Exemple de sol·licitud:
    ```
    POST /inserirProva
    {
        "nomProva": "nom_prova",
        "dataHoraProva": "2023-11-16 12:30:00",
        "dadaProva": 42.5
    }
    ```

    Respostes possibles:
    - 200 OK: Dades insertades correctament.   
        ```json
        {
            "success" = True
        }   
        ```
    - 400 Bad Request:
        - Si no es proporciona un JSON en la sol·licitud.
        - Si falta alguna dada necessària en el JSON. S'especifica quina dada falta.
    - 500 Internal Sever Error: 
        - Error al inserir les dades a la base de dades.
        - Error no controlat.
    """
    try: 
        try: 
            dades_json = request.json
        except Exception as e:
            return jsonify({'success': False, 'error': f"No s'ha propocionat un JSON en la sol·licitud."}), 400

        nom = dades_json.get('nomProva')
        dataHora = dades_json.get('dataHoraProva')
        dada = dades_json.get('dadaProva')

        if nom is None:
            return jsonify({'success': False, 'error': f'Camp "nomProva" no especificat en el JSON'}), 400
        elif dataHora is None:
            return jsonify({'error': f'Camp "dataHoraProva" no especificat en el JSON'}), 400
        elif dada is None:
            return jsonify({'success': False, 'error': f'Camp "dadaProva" no especificat en el JSON'}), 400
        
        else:
            db.començaTransaccio()
            try:
                db.insert('provesDoctests', {'nomProva': nom, 'dataHoraProva': dataHora, 'dadaProva': dada})
            except Exception as e:
                db.rollback()
                return jsonify({'success': False, 'error': f'Error al inserir dades: {str(e)}'}), 500
            else:
                db.commit()
                return jsonify({'success': True})
    
    except Exception as e:
        return jsonify({'success': False, 'error': f'Error no controlat: {str(e)}'}), 500

@app.route('/inserirUsuari', methods = ['POST'])
def inserirUsuari():
    """
    Endpoint de Flask per inserir dades a la taula usuaris. Cal tenir en compte que és necessari
    enviar la contrasenya sense aplicar cap funció de hash, ja que la mateixa funció és la que
    s'encarrega d'aplicar-lo. Per a un correcte funcionament del sistema, serà necessari utilitzar
    un protocol https. Al inserir un usuari, s'insereix a la base de dades la data utf de creació
    de l'usuari.
    """
    try: 
        try: 
            dades_json = request.json
        except Exception as e:
            return jsonify({'success': False, 'error': f"No s'ha propocionat un JSON en la sol·licitud."}), 400

        email = dades_json.get('email')
        nomUsuari = dades_json.get('nomUsuari')
        pwd = dades_json.get('contrasenya')
        dataCreacio_utc = datetime.now(pytz.utc)

        if email is None:
            return jsonify({'success': False, 'error': f"Camp 'email' no especificat en el JSON"}), 400
        elif nomUsuari is None:
            return jsonify({'success': False, 'error': f"Camp 'nomUsuari' no especificat en el JSON"}), 400
        elif pwd is None:
            return jsonify({'success': False, 'error': f"Camp 'contrasenya' no especificat en el JSON"}), 400
        
        else:
            # apliquem funció hash a la contrasenya
            hashedPwd = hashlib.sha256(pwd.encode()).hexdigest()

            db.començaTransaccio()
            try:
                db.insert('usuaris', {'email': email, 'nomUsuari': nomUsuari, 'contrasenya_hash': hashedPwd, 'dataCreacioUsuari': dataCreacio_utc})
            except Exception as e:
                db.rollback()
                return jsonify({'success': False, 'error': f"Error al inserir dades: {str(e)}"}), 500
            else:
                db.commit()
                idUsuariInsertat = db.executaQuery("SELECT id FROM usuaris WHERE email = %s", (email, ))[0][0]
                return jsonify({'success': True, 'idUsuariInsertat': idUsuariInsertat})
    
    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/inserirDispositiu', methods = ['POST'])
def inserirDispositiu():
    """
    Endpoint de Flask per inserir dades a la taula dispositius. Permet inserir un dispositiu no assignat a
    cap usuari. Tot i així, és obligatori afegir-li un id que el permeti identifiqui amb el hardware. 
    """
    try: 
        try: 
            dades_json = request.json
        except Exception as e:
            return jsonify({'success': False, 'error': f"No s'ha propocionat un JSON en la sol·licitud."}), 400

        idHardcode = dades_json.get('idHardcode')
        idUsuari = dades_json.get('idUsuariPropietari')
        nomDispositiu = dades_json.get('nomDispositiu')
        llindarMin = dades_json.get('llindarMinimReg')
        llindarMax = dades_json.get('llindarMaximReg')

        if idHardcode is None:
            return jsonify({'success': False, 'error': f"Camp 'idHardcode' no especificat en el JSON"}), 400
        
        else:
            db.començaTransaccio()
            try:
                db.insert('dispositius', {'idHardcode': idHardcode, 'idUsuariPropietari': idUsuari, 'nomDispositiu': nomDispositiu, 'nivellMinimReg': llindarMin, 'nivellMaximReg': llindarMax})
            except Exception as e:
                db.rollback()
                return jsonify({'success': False, 'error': f"Error al inserir dades: {str(e)}"}), 500
            else:
                db.commit()
                dadesDispositiuInsertat = db.executaQuery("SELECT id, idHardcode FROM dispositius ORDER BY id DESC LIMIT 1")
                idDispositiuInsertat = dadesDispositiuInsertat[0][0]
                idHardcodeDispositiuInsertat = dadesDispositiuInsertat[0][1]
                return jsonify({'success': True, 'idDispositiu': idDispositiuInsertat, 'idHardcode': str(idHardcodeDispositiuInsertat)})
    
    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/inserirDada', methods = ['POST'])
def inserirDadesDispositiu():
    """
    Endpoint de Flask per inserir dades a la taula dadesDispositius.
    """
    try: 
        try: 
            dades_json = request.json
        except Exception as e:
            return jsonify({'success': False, 'error': f"No s'ha propocionat un JSON en la sol·licitud."}), 400

        idHardcode = dades_json.get('idHardcode')
        dataCreacio_utc = datetime.now(pytz.utc)
        dadaHum = dades_json.get('dadaHum')
        dadaTemp = dades_json.get('dadaTemp')

        if idHardcode is None:
            return jsonify({'success': False, 'error': f"Camp 'idHardcode' no especificat en el JSON"}), 400
        elif dadaHum is None:
            return jsonify({'success': False, 'error': f"Camp 'dadaHum' no especificat en el JSON"}), 400
        elif dadaTemp is None:
            return jsonify({'success': False, 'error': f"Camp 'dadaTemp' no especificat en el JSON"}), 400
        
        else:
            
            # Obtenir les dades de tots els dispositius
            query = """SELECT id 
                    FROM dispositius 
                    WHERE idHardcode = %s 
                        AND idUsuariPropietari IS NOT NULL"""
            params = (idHardcode, )

            try: 
                dades_dispositius = db.executaQuery(query, params)

            except Exception as e:
                return jsonify({'success': False, 'error': f"Error al consultar dades: {str(e)}"}), 500
            
            else:
                
                if(len(dades_dispositius) == 0):
                    return jsonify({'success': False, 'error': f"No hi ha dispositius assignats amb el idHardcode especificat en el JSON"}), 400
                else:
                    idDispositiu = dades_dispositius[0][0]
                    db.començaTransaccio()
                    try:
                        db.insert('dadesDispositius', {'idDispositiu': idDispositiu, 'dataHora': dataCreacio_utc, 'dadaHum': dadaHum, 'dadaTemp': dadaTemp})
                    except Exception as e:
                        db.rollback()
                        return jsonify({'success': False, 'error': f"Error al inserir dades: {str(e)}"}), 500
                    else:
                        db.commit()
                        return jsonify({'success': True})
    
    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/inserirEstatReg', methods = ['POST'])
def inserirEstatReg():
    """
    Endpoint de Flask per inserir dades a la taula canvisReg. Aquest només insereix els canvis, és a dir,
    només insereix la dada si la última dada del dispositiu és diferent.
    """
    try: 
        try: 
            dades_json = request.json
        except Exception as e:
            return jsonify({'success': False, 'error': f"No s'ha propocionat un JSON en la sol·licitud."}), 400

        idHardcode = dades_json.get('idHardcode')
        dataCreacio_utc = datetime.now(pytz.utc)
        estatReg = dades_json.get('estatReg')

        if idHardcode is None:
            return jsonify({'success': False, 'error': f"Camp 'idHardcode' no especificat en el JSON"}), 400
        elif estatReg is None:
            return jsonify({'success': False, 'error': f"Camp 'estatReg' no especificat en el JSON"}), 400
        
        else:
            
            try:
                query = """SELECT id
                        FROM dispositius
                        WHERE idHardcode = %s
                        """
                params = (idHardcode, )
                dades_id = db.executaQuery(query, params)
                idDispositiu = dades_id[0][0]
                
            except Exception as e:
                return jsonify({'success': False, 'error': f"Error al consultar l'última dada: {str(e)}"}), 500
            
            else:
                try:
                    query = """SELECT estatReg
                            FROM canvisReg
                            WHERE idDispositiu = %s
                            ORDER BY dataHora DESC
                            LIMIT 1"""
                    params = (idDispositiu, )
                    last_estatReg = db.executaQuery(query, params)

                except Exception as e:
                    return jsonify({'success': False, 'error': f"Error al consultar l'última dada: {str(e)}"}), 500
                else:
                    # només s'insereix la dada si la dada és diferent a l'última dada inserida
                    if len(last_estatReg) > 0: # hi ha alguna dada inserida
                        if last_estatReg[0][0] == estatReg: # l'última dada inserida és igual
                            return jsonify({'success': True, 'dadaInserida': False})

                    db.començaTransaccio()
                    try:
                        db.insert('canvisReg', {'idDispositiu': idDispositiu, 'dataHora': dataCreacio_utc, 'estatReg': estatReg})
                    except Exception as e:
                        db.rollback()
                        return jsonify({'success': False, 'error': f"Error al inserir dades: {str(e)}"}), 500
                    else:
                        db.commit()
                        return jsonify({'success': True, 'dadaInserida': True})
    
    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/verificaLogIn', methods = ['POST'])
def verificaLogIn():
    """
    Endpoint de Flask per obtenir si les credencials de log in es corresponen a les credencials
    de la base de dades. Si troba les credencials, retorna el identificador de l'usuari per facilitar
    el logIn.
    """
    try:
        try: 
            dades_json = request.json
        except Exception as e:
            return jsonify({'success': False, 'error': f"No s'ha propocionat un JSON en la sol·licitud."}), 400

        email = dades_json.get('emailUsuari')
        contrasenya = dades_json.get('contrasenya')

        if email is None:
            return jsonify({'success': False, 'error': f"Camp 'email' no especificat en el JSON"}), 400
        elif contrasenya is None:
            return jsonify({'success': False, 'error': f"Camp 'contrasenya' no especificat en el JSON"}), 400
        
        try: 
            dades = db.executaQuery("SELECT id, contrasenya_hash FROM usuaris WHERE email = %s", (email, ))

        except Exception as e:
            return jsonify({'success': False, 'error': f"Error al consultar dades: {str(e)}"}), 500
        
        else:     
            if len(dades) == 0: # l'usuari no es troba a la bbdd
                credencials = False
                idUsuari = None
            else: # l'usuari es troba a la bbdd
                idUsuari = dades[0][0]
                contrasenya_hash_db = dades[0][1]
                contrasenya_hash_usuari = hashlib.sha256(contrasenya.encode()).hexdigest()
                credencials = contrasenya_hash_db == contrasenya_hash_usuari

            return jsonify({'success': True, 'credencialsTrobades': credencials, 'idUsuari': idUsuari})

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/assignaDispositiuUsuari', methods = ['POST'])
def assignaDispositiuUsuari():
    """
    Endpoint de Flask per assignar un dispositiu a un usuari. Només permet assignar-lo si el dispositiu
    està desassignat, és a dir, que no està assignat a cap altra usuari.
    """
    try: 
        try: 
            dades_json = request.json
        except Exception as e:
            return jsonify({'success': False, 'error': f"No s'ha propocionat un JSON en la sol·licitud."}), 400

        idDispositiu = dades_json.get('idDispositiu')
        idUsuari = dades_json.get('idUsuari')
        nomDispositiu = dades_json.get('nomDispositiu')
        llindarMin = dades_json.get('llindarMinimReg')
        llindarMax = dades_json.get('llindarMaximReg')

        if idDispositiu is None:
            return jsonify({'success': False, 'error': f"Camp 'idDispositiu' no especificat en el JSON"}), 400
        elif idUsuari is None:
            return jsonify({'success': False, 'error': f"Camp 'idUsuari' no especificat en el JSON"}), 400
        elif nomDispositiu is None:
            return jsonify({'success': False, 'error': f"Camp 'nomDispositiu' no especificat en el JSON"}), 400
        
        else:
            try:
                query = """SELECT idHardcode, idUsuariPropietari
                        FROM dispositius
                        WHERE id = %s"""
                params = (idDispositiu, )
                dades = db.executaQuery(query, params)
                
                idHardcode = dades[0][0]
            
            except Exception as e:
                return jsonify({'success': False, 'error': f"Error al consultar dades: {str(e)}"}), 500
            
            else:
                if len(dades) == 0:
                    return jsonify({'success': False, 'error': f"No existeix cap dispositiu amb l'identificador especificat"}), 400
                else:
                    if dades[0][1] != None:
                        return jsonify({'success': False, 'error': f"El dispositiu està assignat a un altre usuari"}), 400
                    
                    else:
                        db.començaTransaccio()
                        try:
                            db.update('dispositius', {'idUsuariPropietari': idUsuari, 'nomDispositiu': nomDispositiu, 'nivellMinimReg': llindarMin, 'nivellMaximReg': llindarMax}, "id = " + str(idDispositiu))

                        except Exception as e:
                            db.rollback()
                            return jsonify({'success': False, 'error': f"Error al actualitzar dades: {str(e)}"}), 500
                        
                        else:
                            db.commit()
                            return jsonify({'success': True, 'dades': {'idHardcode': str(idHardcode)}})

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/desassignaDispositiu', methods = ['POST'])
def desassignaDispositiu():
    """
    Endpoint de Flask per desassignar un dispositiu a un usuari. Només es pot desassignar un dispositiu
    si aquest està assignat a un usuari. A més, s'esborren totes les dades del dispositiu de les taules 
    de dades corresponents a les dades de humitat i temperatura (dadesDispositius) i a la de canvis d'estat 
    de reg (canvisReg)
    """
    try: 
        try: 
            dades_json = request.json
        except Exception as e:
            return jsonify({'success': False, 'error': f"No s'ha propocionat un JSON en la sol·licitud."}), 400

        idDispositiu = dades_json.get('idDispositiu')
        idUsuari = dades_json.get('idUsuari')

        if idDispositiu is None:
            return jsonify({'success': False, 'error': f"Camp 'idDispositiu' no especificat en el JSON"}), 400
        elif idUsuari is None:
            return jsonify({'success': False, 'error': f"Camp 'idUsuari' no especificat en el JSON"}), 400
        
        else:
            try:
                query = """SELECT *
                        FROM dispositius
                        WHERE id = %s
                        AND idUsuariPropietari = %s"""
                params = (idDispositiu, idUsuari, )
                dades = db.executaQuery(query, params)
            
            except Exception as e:
                return jsonify({'success': False, 'error': f"Error al consultar dades: {str(e)}"}), 500
            
            else:
                if len(dades) == 0:
                    return jsonify({'success': False, 'error': f"No existeix cap dispositiu amb l'identificador especificat"}), 400
                else:
                    db.començaTransaccio()
                    try:
                        db.update('dispositius', {'idUsuariPropietari': None, 'nomDispositiu': None, 'nivellMinimReg': None, 'nivellMaximReg': None}, "id = " + str(idDispositiu))
                        db.delete('dadesDispositius', 'idDispositiu =' + str(idDispositiu))
                        db.delete('canvisReg', 'idDispositiu =' + str(idDispositiu))

                    except Exception as e:
                        db.rollback()
                        return jsonify({'success': False, 'error': f"Error al actualitzar dades: {str(e)}"}), 500
                    
                    else:
                        db.commit()
                        return jsonify({'success': True})

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/modificaContrasenya', methods = ['POST'])
def modificaContrasenya():
    """
    Endpoint de Flask per modificar la contrasenya d'un usuari. Per tal de modificar-la és necessari
    indicar la contrasenya actual i que aquesta sigui correcta.
    """
    try:
        try: 
            dades_json = request.json
        except Exception as e:
            return jsonify({'success': False, 'error': f"No s'ha propocionat un JSON en la sol·licitud."}), 400

        idUsuari = dades_json.get('idUsuari')
        contrasenya = dades_json.get('contrasenya')
        novaContrasenya = dades_json.get('novaContrasenya')

        if idUsuari is None:
            return jsonify({'success': False, 'error': f"Camp 'idUsuari' no especificat en el JSON"}), 400
        elif contrasenya is None:
            return jsonify({'success': False, 'error': f"Camp 'contrasenya' no especificat en el JSON"}), 400
        elif novaContrasenya is None:
            return jsonify({'success': False, 'error': f"Camp 'novaContrasenya' no especificat en el JSON"}), 400
        
        try: 
            dades = db.executaQuery("SELECT contrasenya_hash FROM usuaris WHERE id = %s", (idUsuari, ))

        except Exception as e:
            return jsonify({'success': False, 'error': f"Error al consultar dades: {str(e)}"}), 500
        
        else:     
            if len(dades) == 0: # l'usuari no es troba a la bbdd
                return jsonify({'success': False, 'error': "l'usuari " + str(idUsuari) + " no es troba a la base de dades"}), 400
            else: # l'usuari es troba a la bbdd
                contrasenya_hash_db = dades[0][0]
                contrasenya_hash_usuari = hashlib.sha256(contrasenya.encode()).hexdigest()

                if contrasenya_hash_db == contrasenya_hash_usuari:
                    novaContrasenya_hash = hashlib.sha256(novaContrasenya.encode()).hexdigest()
                    try:
                        db.començaTransaccio()
                        db.update('usuaris', {'contrasenya_hash': novaContrasenya_hash}, "id = " + str(idUsuari))
                    except Exception as e:
                        return jsonify({'success': False, 'error': f"Error al modificar la contrasenya: {str(e)}"}), 500
                    else:
                        db.commit()
                        return jsonify({'success': True})
                else:
                    return jsonify({'success': False, 'error': "contrasenya incorrecta"}), 400

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/modificaLlindars', methods = ['POST'])
def modificaLLindars():
    """
    Endpoint de Flask per modificar els llindars d'un dispositiu. S'emmagatzemen els llindars modificats
    per si es demana en la petició GET /obtenirModificacionsLlindars. Si ja hi ha algun canvi de
    llindar entrat, se'l substitueix.
    """
    try: 
        try: 
            dades_json = request.json
        except Exception as e:
            return jsonify({'success': False, 'error': f"No s'ha propocionat un JSON en la sol·licitud."}), 400

        idDispositiu = dades_json.get('idDispositiu')
        llindarMin = dades_json.get('llindarMinimReg')
        llindarMax = dades_json.get('llindarMaximReg')

        if idDispositiu is None:
            return jsonify({'success': False, 'error': f"Camp 'idDispositiu' no especificat en el JSON"}), 400
        elif llindarMin is None:
            return jsonify({'success': False, 'error': f"Camp 'llindarMinimReg' no especificat en el JSON"}), 400
        elif llindarMax is None:
            return jsonify({'success': False, 'error': f"Camp 'llindarMaximReg' no especificat en el JSON"}), 400
        
        else:
            
            try: 
                params = (idDispositiu, )
                query = """SELECT idHardcode 
                    FROM dispositius 
                    WHERE id = %s"""
                dades_dispositiu = db.executaQuery(query, params)

            except Exception as e:
                return jsonify({'success': False, 'error': f"Error al consultar dades: {str(e)}"}), 500
            
            else:    
                idHardcode = dades_dispositiu[0][0]
                
                db.començaTransaccio()
                try:
                    db.update('dispositius', {'nivellMinimReg': llindarMin, 'nivellMaximReg': llindarMax}, "id = " + str(idDispositiu))

                except Exception as e:
                    db.rollback()
                    return jsonify({'success': False, 'error': f"Error al actualitzar dades: {str(e)}"}), 500
                
                else:
                    db.commit()
                    
                    posLlindarDispo = __posicio_llindarDispositiu(idHardcode)
                    if posLlindarDispo != -1: # el dispositiu té un llindar modificat guardat
                        llindarsModificats.pop(posLlindarDispo)
                    
                    # en aquest punt sabem que no es troba cap llindar del dispositiu guardat
                    llindarsModificats.append({'idHardcode': idHardcode, \
                                            'llindarMinimReg': llindarMin, \
                                                'llindarMaximReg': llindarMax})
                    
                    return jsonify({'success': True})

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/obtenirUsuaris', methods = ['GET'])
def obtenirUsuaris():
    """
    Endpoint de Flask per obtenir dades de la taula usuaris. Permet obtenir les dades d'un usuari
    en concret o de tots els usuaris. Cal tenir en compte que mai es poden obtenir les contrasenyes
    de forma directa.
    """
    try:
        idUsuari = request.args.get('idUsuari')
        emailUsuari = request.args.get('emailUsuari')

        if idUsuari:
            # Obtenir les dades d'un usuari específic
            query = "SELECT id, email, nomUsuari, dataCreacioUsuari FROM usuaris WHERE id = %s"
            params = (idUsuari, )
        elif emailUsuari:
            # Obtenir les dades d'un usuari específic
            query = "SELECT id, email, nomUsuari, dataCreacioUsuari FROM usuaris WHERE email = %s"
            params = (emailUsuari, )
        else:
            # Obtenir les dades de tots els usuaris
            query = "SELECT id, email, nomUsuari, dataCreacioUsuari FROM usuaris"
            params = ()

        try: 
            dades_usuaris = db.executaQuery(query, params)

        except Exception as e:
            return jsonify({'success': False, 'error': f"Error al consultar dades: {str(e)}"}), 500
        
        else:     
            dades_formatejades = [
                {
                    "id": usuari[0],
                    "email": usuari[1],
                    "nomUsuari": usuari[2],
                    "dataCreacioUsuari": usuari[3].strftime("%Y-%m-%d %H:%M:%S") if usuari[3] else None
                }
                for usuari in dades_usuaris
            ]
            return jsonify({'success': True, 'dades': dades_formatejades})

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500
       
@app.route('/obtenirDispositius', methods = ['GET'])
def obtenirDispositius():
    """
    Endpoint de Flask per obtenir dades de la taula dispositius.

    Mètode: GET
    Paràmetres de la URL:
    - idUsuari [opcional]: id de l'usuari del qual es volen obtenir les dades dels seus dispositius assignats.
    - nomDispositiu [opcional]: nom del dispositiu del qual es volen obtenir les dades. Sempre ha d'anar acompanyat
        d'un email d'un usuari, ja que diferents usuaris volen tenir dispositius amb el mateix nom.
    - idDispositiu [opcional]: id del dispositiu del qual es poden obtenir les dades.
    """
    try:
        idUsuari = request.args.get('idUsuari')
        nomDispositiu = request.args.get('nomDispositiu')
        idDispositiu = request.args.get('idDispositiu')

        if idDispositiu:
            # Obtenir les dades d'un dispositiu específic
                query = """SELECT id, idHardcode, idUsuariPropietari, nomDispositiu, nivellMinimReg, nivellMaximReg
                        FROM dispositius
                        WHERE id = %s"""
                params = (idDispositiu, )

        elif idUsuari:
            if nomDispositiu:
                # Obtenir les dades d'un nom de dispositiu i usuari
                query = """SELECT id, idHardcode, idUsuariPropietari, nomDispositiu, nivellMinimReg, nivellMaximReg
                        FROM dispositius 
                        WHERE idUsuariPropietari = %s AND nomDispositiu = %s"""
                params = (idUsuari, nomDispositiu)

            else:
                # Obtenir les dades d'un usuari específic
                query = """SELECT id, idHardcode, idUsuariPropietari, nomDispositiu, nivellMinimReg, nivellMaximReg
                        FROM dispositius
                        WHERE idUsuariPropietari = %s"""
                params = (idUsuari, )

        else:
            # Obtenir les dades de tots els dispositius
            query = "SELECT id, idHardcode, idUsuariPropietari, nomDispositiu, nivellMinimReg, nivellMaximReg FROM dispositius"
            params = ()

        try: 
            dades_dispositius = db.executaQuery(query, params)

        except Exception as e:
            return jsonify({'success': False, 'error': f"Error al consultar dades: {str(e)}"}), 500
        
        else:     
            dades_formatejades = [
                {
                    "id": dispo[0],
                    "idHardcode": dispo[1],
                    "idUsuariPropietari": dispo[2],
                    "nomDispositiu": dispo[3],
                    "llindarMinimReg": dispo[4],
                    "llindarMaximReg": dispo[5]
                }
                for dispo in dades_dispositius
            ]
            return jsonify({'success': True, 'dades': dades_formatejades})

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/obtenirDispositiusDesassignats', methods = ['GET'])
def obtenirDispositiusDesassignats():
    """
    Endpoint de Flask per obtenir els dispositius que no estan assignats a cap usuari, és a dir que
    la columna idUsuariPropietari = NULL.
    """
    try:
        query = """SELECT * 
                FROM dispositius 
                WHERE idUsuariPropietari IS NULL"""
        try:
            dades_dispositius = db.executaQuery(query)

        except Exception as e:
            return jsonify({'success': False, 'error': f"Error al consultar dades: {str(e)}"}), 500
        
        else:     
            dades_formatejades = [
                {
                    "idDispositiu": dispo[0],
                    "idHardcode": str(dispo[1])
                }
                for dispo in dades_dispositius
            ]
            return jsonify({'success': True, 'dades': dades_formatejades})

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/comprovacioDispositiuInserit', methods = ['GET'])
def comprovacioDispositiuInserit():
    """
    Endpoint de Flask per comprovar si un dispositiu ha sigut inserit a la base de dades i està assignat.
    """
    try:
        idHardcode = request.args.get('idHardcode')
        
        if idHardcode is None:
            return jsonify({'success': False, 'error': f"'idHardcode' no especificat"}), 400
        
        try: 
            params = (idHardcode, )
            query = """SELECT idUsuariPropietari 
                FROM dispositius 
                WHERE idHardcode = %s"""
            dades_dispositiu = db.executaQuery(query, params)

        except Exception as e:
            return jsonify({'success': False, 'error': f"Error al consultar dades: {str(e)}"}), 500
        
        else:  
            if(len(dades_dispositiu)): # el dispositiu està a la base de dades
                idUsuariPropietari = dades_dispositiu[0][0]
                if(idUsuariPropietari):
                    return jsonify({'success': True, 'dispositiuTrobat': True, "assignat": True})
                else:
                    return jsonify({'success': True, 'dispositiuTrobat': True, "assignat": False})
            else: # el dispositiu no està a la base de dades
                return jsonify({'success': True, 'dispositiuTrobat': False, "assignat": False})

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500
    
@app.route('/obtenirDadesDispositius', methods = ['GET'])
def obtenirDadesDispositius():
    """
    Endpoint de Flask per obtenir dades de la taula dadesDispositius.
    """
    try:
        idUsuari = request.args.get('idUsuari')
        idDispositiu = request.args.get('idDispositiu')
        dataInici = request.args.get('dataInici')
        dataFi = request.args.get('dataFi')

        if idDispositiu:
            if dataInici:
                if dataFi:
                    #obtenir les dades d'un interval de temps d'un dispositiu
                    query = """SELECT dades.idDispositiu, dades.dataHora, dades.dadaHum, dades.dadaTemp 
                            FROM dadesDispositius dades 
                            INNER JOIN dispositius dispo 
                                ON dispo.id = dades.idDispositiu 
                            WHERE idDispositiu = %s 
                                AND dataHora >= %s
                                AND dataHora <= %s"""
                    params = (idDispositiu, dataInici, dataFi)

                else:
                    #obtenir les dades a partir d'una data d'un dispositiu
                    query = """SELECT dades.idDispositiu, dades.dataHora, dades.dadaHum, dades.dadaTemp 
                            FROM dadesDispositius dades 
                            INNER JOIN dispositius dispo 
                                ON dispo.id = dades.idDispositiu 
                            WHERE idDispositiu = %s 
                                AND dataHora >= %s"""
                    params = (idDispositiu, dataInici)

            else: 
                #obtenir totes les dades d'un dispositiu
                query = """SELECT dades.idDispositiu, dades.dataHora, dades.dadaHum, dades.dadaTemp 
                        FROM dadesDispositius dades 
                        INNER JOIN dispositius dispo 
                            ON dispo.id = dades.idDispositiu 
                        WHERE idDispositiu = %s"""
                params = (idDispositiu, )

        elif idUsuari:
            if dataInici:
                if dataFi:
                    #obtenir les dades d'un interval de temps d'un usuari
                    query = """SELECT dades.idDispositiu, dades.dataHora, dades.dadaHum, dades.dadaTemp 
                        FROM dadesDispositius dades 
                        INNER JOIN dispositius dispo 
                            ON dispo.id = dades.idDispositiu
                        WHERE dispo.idUsuariPropietari = %s
                            AND dataHora >= %s
                            AND dataHora <= %s"""
                    params = (idUsuari, dataInici, dataFi)

                else:
                    #obtenir les dades a partir d'una data d'un usuari
                    query = """SELECT dades.idDispositiu, dades.dataHora, dades.dadaHum, dades.dadaTemp 
                        FROM dadesDispositius dades 
                        INNER JOIN dispositius dispo 
                            ON dispo.id = dades.idDispositiu 
                        WHERE dispo.idUsuariPropietari = %s
                            AND dataHora >= %s"""
                    params = (idUsuari, dataInici)
            else:
                #obtenir totes les dades d'un usuari
                query = """SELECT dades.idDispositiu, dades.dataHora, dades.dadaHum, dades.dadaTemp 
                        FROM dadesDispositius dades 
                        INNER JOIN dispositius dispo 
                            ON dispo.id = dades.idDispositiu 
                        WHERE dispo.idUsuariPropietari = %s"""
                params = (idUsuari, )
        
        else:
            # Obtenir totes les dades
            query = "SELECT idDispositiu, dataHora, dadaHum, dadaTemp FROM dadesDispositius"
            params = ()

        try: 
            dades = db.executaQuery(query, params)

        except Exception as e:
            return jsonify({'success': False, 'error': f"Error al consultar dades: {str(e)}"}), 500
        
        else:     
            dades_formatejades = [
                {
                    "idDispositiu": dada[0],
                    "dataHora": dada[1],
                    "dadaHum": dada[2],
                    "dadaTemp": dada[3]
                }
                for dada in dades
            ]
            return jsonify({'success': True, 'dades': dades_formatejades})

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/obtenirCanvisReg', methods = ['GET'])
def obtenirCanvisReg():
    """
    Endpoint de Flask per obtenir dades de la taula canvisReg.
    """
    try:
        idUsuari = request.args.get('idUsuari')
        idDispositiu = request.args.get('idDispositiu')
        dataInici = request.args.get('dataInici')
        dataFi = request.args.get('dataFi')

        if idDispositiu:
            if dataInici:
                if dataFi:
                    #obtenir les dades d'un interval de temps d'un dispositiu
                    query = """SELECT reg.idDispositiu, reg.dataHora, reg.estatReg 
                            FROM canvisReg reg 
                            INNER JOIN dispositius dispo 
                                ON dispo.id = reg.idDispositiu 
                            WHERE reg.idDispositiu = %s 
                                AND dataHora >= %s
                                AND dataHora <= %s"""
                    params = (idDispositiu, dataInici, dataFi)

                else:
                    #obtenir les dades a partir d'una data d'un dispositiu
                    query = """SELECT reg.idDispositiu, reg.dataHora, reg.estatReg 
                            FROM canvisReg reg
                            INNER JOIN dispositius dispo 
                                ON dispo.id = reg.idDispositiu 
                            WHERE reg.idDispositiu = %s 
                                AND dataHora >= %s"""
                    params = (idDispositiu, dataInici)

            else: 
                #obtenir totes les dades d'un dispositiu
                query = """SELECT reg.idDispositiu, reg.dataHora, reg.estatReg 
                        FROM canvisReg reg 
                        INNER JOIN dispositius dispo 
                            ON dispo.id = reg.idDispositiu 
                        WHERE reg.idDispositiu = %s"""
                params = (idDispositiu, )

        elif idUsuari:
            if dataInici:
                if dataFi:
                    #obtenir les dades d'un interval de temps d'un usuari
                    query = """SELECT reg.idDispositiu, reg.dataHora, reg.estatReg 
                        FROM canvisReg reg
                        INNER JOIN dispositius dispo 
                            ON dispo.id = reg.idDispositiu 
                        WHERE dispo.idUsuariPropietari = %s
                            AND dataHora >= %s
                            AND dataHora <= %s"""
                    params = (idUsuari, dataInici, dataFi)

                else:
                    #obtenir les dades a partir d'una data d'un usuari
                    query = """SELECT reg.idDispositiu, reg.dataHora, reg.estatReg 
                        FROM canvisReg reg
                        INNER JOIN dispositius dispo 
                            ON dispo.id = reg.idDispositiu 
                        WHERE dispo.idUsuariPropietari = %s
                            AND dataHora >= %s"""
                    params = (idUsuari, dataInici)
            else:
                #obtenir totes les dades d'un usuari
                query = """SELECT reg.idDispositiu, reg.dataHora, reg.estatReg 
                        FROM canvisReg reg
                        INNER JOIN dispositius dispo 
                            ON dispo.id = reg.idDispositiu 
                        WHERE dispo.idUsuariPropietari = %s"""
                params = (idUsuari,)
        
        else:
            # Obtenir totes les dades
            query = "SELECT idDispositiu, dataHora, estatReg FROM canvisReg"
            params = ()

        try: 
            dades = db.executaQuery(query, params)

        except Exception as e:
            return jsonify({'success': False, 'error': f"Error al consultar dades: {str(e)}"}), 500
        
        else:     
            dades_formatejades = [
                {
                    "idDispositiu": dada[0],
                    "dataHora": dada[1],
                    "estatReg": dada[2],
                }
                for dada in dades
            ]
            return jsonify({'success': True, 'dades': dades_formatejades})

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/obtenirUltimReg', methods = ['GET'])
def obtenirUltimReg():
    """
    Endpoint de Flask per obtenir les dades del últim reg d'un dispositiu
    """
    try:
        idDispositiu = request.args.get('idDispositiu')

        if idDispositiu is None:
            return jsonify({'success': False, 'error': f"'idDispositiu' no especificat"}), 400

        try: 
            params_lastReg = (idDispositiu, )
            query_lastReg = """SELECT estatReg, dataHora
                            FROM canvisReg 
                            WHERE idDispositiu = %s
                            ORDER BY dataHora DESC 
                            LIMIT 1"""
            dades_lastReg = db.executaQuery(query_lastReg, params_lastReg)

        except Exception as e:
            return jsonify({'success': False, 'error': f"Error al consultar la hora del últim canviReg: {str(e)}"}), 500

        else:
            if len(dades_lastReg) == 0: # no s'ha regat mai
                dataHoraIniciReg = ""
                dataHoraFiReg = ""

            else:
                dataHoraLastReg = dades_lastReg[0][1]
                valorLastReg = dades_lastReg[0][0]

                if valorLastReg == 1: # s'està regant actualment
                    dataHoraIniciReg = dataHoraLastReg
                    dataHoraFiReg = ""
                
                else:
                    try: 
                        params_lastlastReg = (idDispositiu, dataHoraLastReg)
                        query_lastlastReg = """SELECT estatReg, dataHora
                                            FROM canvisReg 
                                            WHERE idDispositiu = %s 
                                            AND dataHora < %s 
                                            ORDER BY dataHora DESC 
                                            LIMIT 1"""
                        dades_lastlastReg = db.executaQuery(query_lastlastReg, params_lastlastReg)

                    except Exception as e:
                        return jsonify({'success': False, 'error': f"Error al consultar la hora del penúltim canviReg: {str(e)}"}), 500
                    
                    else:
                        if len(dades_lastlastReg) == 0: # no s'ha regat mai
                            dataHoraIniciReg = ""
                            dataHoraFiReg = ""
                        else: # s'ha començat i acabat de regar
                            dataHoraIniciReg = dades_lastlastReg[0][1]
                            dataHoraFiReg = dataHoraLastReg

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500
    
    else:
        dades_formatejades = [{"dataHoraInici": dataHoraIniciReg, "dataHoraFi": dataHoraFiReg}]
        return jsonify({'success': True, 'dades': dades_formatejades})
    
@app.route('/obtenirUltimRegUsuari', methods = ['GET'])
def obtenirUltimRegUsuari():
    """
    Endpoint de Flask per obtenir les dades del últim reg de tots els dispositiu d'un usuari
    """
    try:
        idUsuari = request.args.get('idUsuari')

        if idUsuari is None:
            return jsonify({'success': False, 'error': f"'idUsuari' no especificat"}), 400

        try: 
            params_lastRegUsuari = (idUsuari, )
            query_lastRegUsuari = """SELECT canv.idDispositiu, canv.estatReg, canv.dataHora, disp.nomDispositiu
                            FROM (SELECT idDispositiu, estatReg, MAX(dataHora) AS dataHora 
                                FROM canvisReg 
                                WHERE estatReg = 1 
                                GROUP BY idDispositiu) AS canv
                            INNER JOIN dispositius AS disp
                                ON disp.id = canv.idDispositiu
                            WHERE disp.idUsuariPropietari = %s 
                                AND estatReg = 1
                            """
            dades_lastRegUsuari = db.executaQuery(query_lastRegUsuari, params_lastRegUsuari)

        except Exception as e:
            return jsonify({'success': False, 'error': f"Error al consultar la hora del últim canviReg dels dispositius d'un usuari: {str(e)}"}), 500

        else:
            if len(dades_lastRegUsuari) == 0: # no s'ha regat mai
                idDispositiu = ""
                nomDispositiu = ""
                dataHoraIniciReg = ""
                dataHoraFiReg = ""
                dades_formatejades = [{"idDispositiu": idDispositiu, "nomDispositiu": nomDispositiu, "dataHoraInici": dataHoraIniciReg, "dataHoraFi": dataHoraFiReg}]
                return jsonify({'success': True, 'dades': dades_formatejades})

            else:
                dades_formatejades = []
                for ultimaDadaDisp in dades_lastRegUsuari:
                    idDispositiu = ultimaDadaDisp[0] 
                    valorLastRegDisp = ultimaDadaDisp[1]
                    dataHoraLastRegDisp = ultimaDadaDisp[2]
                    nomDispositiu = ultimaDadaDisp[3]

                    try: 
                        params_lastlastReg = (idDispositiu, dataHoraLastRegDisp)
                        query_lastlastReg = """SELECT estatReg, dataHora
                                            FROM canvisReg 
                                            WHERE idDispositiu = %s 
                                            AND dataHora > %s 
                                            AND estatReg = 0
                                            LIMIT 1"""
                        dades_lastlastReg = db.executaQuery(query_lastlastReg, params_lastlastReg)
                        
                        
                    except Exception as e:
                        return jsonify({'success': False, 'error': f"Error al consultar la hora de la ultima parada de reg: {str(e)}"}), 500
                    
                    else:
                        if len(dades_lastlastReg) == 0: # s'ha començat a regar però no s'ha acabat
                            dataHoraIniciReg = dataHoraLastRegDisp
                            dataHoraFiReg = ""
                            dades_formatejades.append({"idDispositiu": idDispositiu, "nomDispositiu": nomDispositiu, "dataHoraInici": dataHoraIniciReg, "dataHoraFi": dataHoraFiReg})
                        else: # s'ha començat i acabat de regar
                            dataHoraIniciReg = dataHoraLastRegDisp
                            dataHoraFiReg = dades_lastlastReg[0][1]
                            dades_formatejades.append({"idDispositiu": idDispositiu, "nomDispositiu": nomDispositiu, "dataHoraInici": dataHoraIniciReg, "dataHoraFi": dataHoraFiReg})
                    
                return jsonify({'success': True, 'dades': dades_formatejades})                
            
    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

@app.route('/obtenirUltimaDadaDispositiu', methods = ['GET'])
def obtenirUltimaDadaDispositiu():
    """
    Endpoint de Flask per obtenir les últimes dades de la taula dadesDispositius.
    """
    try:
        idDispositiu = request.args.get('idDispositiu')
        idUsuari = request.args.get('idUsuari')

        if idDispositiu:
            query = """SELECT dispo.id, dispo.nomDispositiu, dades.dataHora, dades.dadaHum, dades.dadaTemp 
            FROM dadesDispositius dades
            INNER JOIN dispositius dispo
                ON dispo.id = dades.idDispositiu
            WHERE idDispositiu = %s
            ORDER BY dataHora DESC 
            LIMIT 1"""
            params = (idDispositiu, )

            try: 
                dades = db.executaQuery(query, params)

            except Exception as e:
                return jsonify({'success': False, 'error': f"Error al consultar dades: {str(e)}"}), 500
            
            else:     
                if len(dades) == 0:
                    dades_formatejades = []
                else:
                    dada = dades[0]
                    dades_formatejades = [
                        {
                            "idDispositiu": dada[0],
                            "nomDispositiu": dada[1],
                            "dataHora": dada[2],
                            "dadaHum": dada[3],
                            "dadaTemp": dada[4]
                        }
                    ]
                return jsonify({'success': True, 'dades': dades_formatejades})
            
        elif idUsuari:
            #obtenim els dispositius d'un usuari
            query = "SELECT id FROM dispositius WHERE idUsuariPropietari = %s"
            params = (idUsuari, )
            try:
                dispos = db.executaQuery(query, params)
            except Exception as e:
                return jsonify({'success': False, 'error': f"Error al consultar els dispositius de l'usuari: {str(e)}"}), 500
            else:
                dades_formatejades = []
                if len(dispos) != 0:
                    query = """SELECT dispo.id, dispo.nomDispositiu, dades.dataHora, dades.dadaHum, dades.dadaTemp 
                            FROM dadesDispositius dades
                            INNER JOIN dispositius dispo
                                ON dispo.id = dades.idDispositiu
                            WHERE idDispositiu = %s
                            ORDER BY dataHora DESC 
                            LIMIT 1"""
                    for dispo in dispos:
                        params = (dispo[0], )
                        try: 
                            dades = db.executaQuery(query, params)

                        except Exception as e:
                            return jsonify({'success': False, 'error': f"Error al consultar dades del dispositiu {str(dispo[0])}: {str(e)}"}), 500
                        
                        else:     
                            if len(dades) != 0:
                                dada = dades[0]
                                dades_formatejades.append(
                                    {
                                        "idDispositiu": dada[0],
                                        "nomDispositiu": dada[1],
                                        "dataHora": dada[2],
                                        "dadaHum": dada[3],
                                        "dadaTemp": dada[4]
                                    }
                                )

            return jsonify({'success': True, 'dades': dades_formatejades})

        else:
            return jsonify({'success': False, 'error': f"'idDispositiu' ni 'idUsuari' no especificat"}), 400

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500
    
@app.route('/obtenirModificacionsLlindars', methods = ['GET'])
def obtenirModificacionsLlindars():
    """
    Endpoint de flask per obtenir la última modificació en els llindars de reg de dispositius.
    Si es demana d'un dispositiu, com que ja s'ha comunicat el canvi en el llindar, es borra de la llista.
    """
    try:
        idHardcode = request.args.get('idHardcode')
                
        if idHardcode:
            posLlindarDispo = __posicio_llindarDispositiu(idHardcode)
            if posLlindarDispo == -1: # el dispositiu no té un llindar modificat guardat
                return jsonify({'success': True, 'dades': []})
            else:
                llindars = llindarsModificats.pop(posLlindarDispo)
                return jsonify({'success': True, 'dades': llindars})

        else:
            return jsonify({'success': True, 'dades': llindarsModificats})

    except Exception as e:
        return jsonify({'success': False, 'error': f"Error no controlat: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host = '0.0.0.0', port = 5000)

