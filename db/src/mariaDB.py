import mysql.connector
import datetime

class mariaDBConn:
    """
    Classe que proporciona una interfície per interactura amb una base de dades MariaDB.

    Permet establir una connexió, realitzar les operacions bàsiques, gestionar transaccions
    gestionar transacciones y obtener información sobre las tablas y columnas de la base de datos.

    A continuació es pot veure un exemple bàsic d'ús dels mètodes de la classe. Cal tenir en compte
    que per tal de que aquests doctests i els de tots els mètodes funcionin és necessari crear 
    l'usuari 'ferran' amb contrasenya '3007' i s'ha d'haver creat la base de dades anomenada
    'integracioSistemes' amb la taula provesDoctests tal i com es pot veure al fitxer 
    'integracioSistemes.sql'.

    >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
    >>> db.conecta()
    >>> db.començaTransaccio()
    >>> try:
    ...     db.insert('provesDoctests', {'nomProva': 'prova1', 'dataHoraProva': '2002-07-30', 'dadaProva': 24.56})
    ... except:
    ...     db.rollback()
    ...     print("S'ha produit un error")
    ... else:
    ...     db.commit()
    ... finally:
    ...     db.executaQuery("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests ORDER BY id DESC LIMIT 1")
    [('prova1', datetime.datetime(2002, 7, 30, 0, 0), Decimal('24.56'))]

    >>> db.començaTransaccio()
    >>> try:
    ...     db.insert('provesDoctests', {'nomProva': 'prova2', 'dataHoraProva': '2002-13-30', 'dadaProva': 51.14})
    ... except Exception as e:
    ...     db.rollback()
    ...     print(e)
    ... else:
    ...     db.commit()
    ... finally:
    ...     db.executaQuery("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests ORDER BY id DESC LIMIT 1")
    1292 (22007): Incorrect datetime value: '2002-13-30' for column `integracioSistemes`.`provesDoctests`.`dataHoraProva` at row 1
    [('prova1', datetime.datetime(2002, 7, 30, 0, 0), Decimal('24.56'))]
    
    """

    def __init__(self, host, nomUsuari, contrasenya, baseDades):
        """
        Constructor. Estableix les variables de instància per conectar-se a una base de dades mariaDB.

        Args:
            host (string): ubicació o direcció de la màquina on es troba allotjada la base de dades.
            nomUsuari (string): nom d'usuari per autentificar-se a la base de dades.
            contrasenya (string): clau associada al nom d'usuari anterior per autentificar-nos.
            baseDades (string): nom de la base de dades a la que es vol accedir.

        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        """
        self.host = host
        self.nomUsuari = nomUsuari
        self.__contrasenya = contrasenya
        self.baseDades = baseDades

    def __del__(self):
        """
        Es crida si l'objecta és destruit i serveix per evitar que aquest es destrueixi sense que la
        connexió amb la base de dades hagi sigut tancada.

        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        >>> db.conecta()
        >>> del db
        """
        self.desconecta()

    def conecta(self):
        """
        Estableix la connexió a la base de dades utilitzant els paràmetres proporcionats en el constructor.

        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        >>> db.conecta()
        >>> db.desconecta()
        """
        self.conexio = mysql.connector.connect(
            host = self.host,
            user = self.nomUsuari,
            password = self.__contrasenya,
            database = self.baseDades
        )

    def desconecta(self):
        """
        Tanca la connexió amb la base de dades.

        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        >>> db.conecta()
        >>> db.desconecta()
        """
        if self.conexio:
            self.conexio.close()
            self.conexio = None

    def isconectat(self):
        """
        Informa si el usuario está conectado a la base de datos

        Returns:
            bool: True si està conectat i False si o ho està.

        Tanca la connexió amb la base de dades.
        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        >>> db.conecta()
        >>> db.isconectat()
        True
        >>> db.desconecta()
        >>> db.isconectat()
        False
        """
        if self.conexio:
            return True
        else:
            return False

    def executaQuery(self, query, valors = None):
        """
        Executa operacions select SQL per consultar dades de la base de dades a la base de dades.

        Args:
            query (string): consulta SQL a executar.
            valors (tuple, optional): valors d'enllaç (per a consultes parametritzades)

        Returns:
            list of tuple: llista de tuples de les dades obtingudes. Cada fila de la base de dades es
                correspon a una tupla.

        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        >>> db.conecta()
        >>> db.insert('provesDoctests', {'nomProva': 'prova1', 'dataHoraProva': '2002-07-30', 'dadaProva': 1})
        >>> db.insert('provesDoctests', {'nomProva': 'prova2', 'dataHoraProva': '2002-07-30', 'dadaProva': 2})
        >>> db.insert('provesDoctests', {'nomProva': 'prova3', 'dataHoraProva': '2002-07-30', 'dadaProva': 3})
        >>> db.executaQuery("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests ORDER BY id DESC LIMIT 3")
        [('prova3', datetime.datetime(2002, 7, 30, 0, 0), Decimal('3.00')), ('prova2', datetime.datetime(2002, 7, 30, 0, 0), Decimal('2.00')), ('prova1', datetime.datetime(2002, 7, 30, 0, 0), Decimal('1.00'))]
        >>> db.executaQuery("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests WHERE dataHoraProva = %s ORDER BY id DESC LIMIT 3", (datetime.datetime(2002, 7, 30, 0, 0), ))
        [('prova3', datetime.datetime(2002, 7, 30, 0, 0), Decimal('3.00')), ('prova2', datetime.datetime(2002, 7, 30, 0, 0), Decimal('2.00')), ('prova1', datetime.datetime(2002, 7, 30, 0, 0), Decimal('1.00'))]
        >>> db.executaQuery("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests WHERE nomProva = %s ORDER BY id DESC LIMIT 1", ('prova2', ))
        [('prova2', datetime.datetime(2002, 7, 30, 0, 0), Decimal('2.00'))]
        >>> db.executaQuery("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests WHERE dadaProva >= %s ORDER BY id DESC LIMIT 2", (2, ))
        [('prova3', datetime.datetime(2002, 7, 30, 0, 0), Decimal('3.00')), ('prova2', datetime.datetime(2002, 7, 30, 0, 0), Decimal('2.00'))]
        >>> db.desconecta()
        """
        cursor = self.conexio.cursor()
        cursor.execute(query, valors)
        resultat = cursor.fetchall()
        cursor.close()
        return resultat
    
    def fetch(self, query, valors = None):
        """
        Executa operacions select SQL per consultar dades de la base de dades a la base de dades i
        obtenir-les en una estructura més agradable que en el mètode executaQuery.

        Args:
            query (string): consulta SQL a executar.
            valors (tuple, optional): valors d'enllaç (per a consultes parametritzades)

        Returns:
            list of dict: llista de diccionaris de les dades obtingudes. Cada fila de la base de dades es
                correspon a un diccionari.

        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        >>> db.conecta()
        >>> db.insert('provesDoctests', {'nomProva': 'prova1', 'dataHoraProva': '2002-07-30', 'dadaProva': 1})
        >>> db.insert('provesDoctests', {'nomProva': 'prova2', 'dataHoraProva': '2002-07-30', 'dadaProva': 2})
        >>> db.insert('provesDoctests', {'nomProva': 'prova3', 'dataHoraProva': '2002-07-30', 'dadaProva': 3})
        >>> db.fetch("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests ORDER BY id DESC LIMIT 3")
        [{'nomProva': 'prova3', 'dataHoraProva': datetime.datetime(2002, 7, 30, 0, 0), 'dadaProva': Decimal('3.00')}, {'nomProva': 'prova2', 'dataHoraProva': datetime.datetime(2002, 7, 30, 0, 0), 'dadaProva': Decimal('2.00')}, {'nomProva': 'prova1', 'dataHoraProva': datetime.datetime(2002, 7, 30, 0, 0), 'dadaProva': Decimal('1.00')}]
        >>> db.fetch("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests WHERE dataHoraProva = %s ORDER BY id DESC LIMIT 3", (datetime.datetime(2002, 7, 30, 0, 0), ))
        [{'nomProva': 'prova3', 'dataHoraProva': datetime.datetime(2002, 7, 30, 0, 0), 'dadaProva': Decimal('3.00')}, {'nomProva': 'prova2', 'dataHoraProva': datetime.datetime(2002, 7, 30, 0, 0), 'dadaProva': Decimal('2.00')}, {'nomProva': 'prova1', 'dataHoraProva': datetime.datetime(2002, 7, 30, 0, 0), 'dadaProva': Decimal('1.00')}]
        >>> db.fetch("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests WHERE nomProva = %s ORDER BY id DESC LIMIT 1", ('prova2', ))
        [{'nomProva': 'prova2', 'dataHoraProva': datetime.datetime(2002, 7, 30, 0, 0), 'dadaProva': Decimal('2.00')}]
        >>> db.fetch("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests WHERE dadaProva >= %s ORDER BY id DESC LIMIT 2", (2, ))
        [{'nomProva': 'prova3', 'dataHoraProva': datetime.datetime(2002, 7, 30, 0, 0), 'dadaProva': Decimal('3.00')}, {'nomProva': 'prova2', 'dataHoraProva': datetime.datetime(2002, 7, 30, 0, 0), 'dadaProva': Decimal('2.00')}]
        >>> db.desconecta()
        """
        cursor = self.conexio.cursor(dictionary=True)
        cursor.execute(query, valors)
        resultat = cursor.fetchall()
        cursor.close()
        return resultat

    def insert(self, nomTaula, valors):
        """
        Insereix dades a una taula de la base de dades.

        Args:
            nomTaula (string): nom de la taula on es volen inserir els valors.
            valors (dict): valors que es volen inserir amb el valor que es vol inserir per a cada columna.

        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        >>> db.conecta()
        >>> db.insert('provesDoctests', {'nomProva': 'prova1', 'dataHoraProva': '2002-07-30', 'dadaProva': 24.56})
        >>> db.commit()
        >>> db.executaQuery("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests ORDER BY id DESC LIMIT 1")
        [('prova1', datetime.datetime(2002, 7, 30, 0, 0), Decimal('24.56'))]
        >>> db.desconecta()
        """
        cursor = self.conexio.cursor()
        placeholders = ", ".join(["%s"] * len(valors))
        columnes = ", ".join(valors.keys())
        query = f"INSERT INTO {nomTaula } ({columnes}) VALUES ({placeholders})"
        cursor.execute(query, list(valors.values()))
        cursor.close()

    def update(self, nomTaula, valors, condicio):
        """
        Actualitza els valors indicats d'una taula de la base de dades.

        Args:
            nomTaula (string): nom de la taula de la qual es volen actualitzar els valors.
            valors (dict): columnes que es volen actualitzar amb el valor que es vol actualitzar per a cada columna.
            condicio (string): condició que s'ha de complir per indicar les columnes que es volen
                                actualitzar els valors.

        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        >>> db.conecta()
        >>> db.insert('provesDoctests', {'nomProva': 'prova1', 'dataHoraProva': '2002-07-30', 'dadaProva': 24.56})
        >>> db.commit()
        >>> condicio = 'id = ' + str(db.executaQuery("SELECT id FROM provesDoctests ORDER BY id DESC LIMIT 1")[0][0])
        >>> db.update('provesDoctests', {'nomProva': 'prova1Modificada'}, condicio)
        >>> db.commit()
        >>> db.executaQuery("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests ORDER BY id DESC LIMIT 1")
        [('prova1Modificada', datetime.datetime(2002, 7, 30, 0, 0), Decimal('24.56'))]
        >>> db.desconecta()
        """
        cursor = self.conexio.cursor()
        set_values = ', '.join([f"{key} = %s" for key in valors.keys()])
        query = f"UPDATE {nomTaula} SET {set_values} WHERE {condicio}"
        cursor.execute(query, list(valors.values()))
        cursor.close()

    def delete(self, nomTaula, condicio):
        """
        Elimina les files d'una taula de la base de dades que compleixen la condició.

        Args:
            nomTaula (string): nom de la taula de la qual es volen eliminar els valors.
            condicio (string): condició que s'ha de complir per indicar les columnes que es volen esborrar.

        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        >>> db.conecta()
        >>> db.insert('provesDoctests', {'nomProva': 'prova1', 'dataHoraProva': '2002-07-30', 'dadaProva': 24.56})
        >>> db.insert('provesDoctests', {'nomProva': 'prova2', 'dataHoraProva': '2002-07-30', 'dadaProva': 9.54})
        >>> db.commit()
        >>> db.executaQuery("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests ORDER BY id DESC LIMIT 1")
        [('prova2', datetime.datetime(2002, 7, 30, 0, 0), Decimal('9.54'))]
        >>> condicio = 'id = ' + str(db.executaQuery("SELECT id FROM provesDoctests ORDER BY id DESC LIMIT 1")[0][0])
        >>> db.delete('provesDoctests', condicio)
        >>> db.commit()
        >>> db.executaQuery("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests ORDER BY id DESC LIMIT 1")
        [('prova1', datetime.datetime(2002, 7, 30, 0, 0), Decimal('24.56'))]
        >>> db.desconecta()
        """
        cursor = self.conexio.cursor()
        query = f"DELETE FROM {nomTaula} WHERE {condicio}"
        cursor.execute(query)
        cursor.close()

    def començaTransaccio(self):
        """
        S'inicia una transacció a la base de dades. Una transacció és un conjunt d'operacions de base de
        dades que es consideren una unitat lògica i que s'han de completar en la seva totalitat o no
        completar-se en absolut.

        Durant una transacció, les operacions no es reflexen a la base de dades fins que es confirma la
        transacció (es produeix un commit).

        Qualsevol error que es produeixi durant la transacció (abans del commit) provoca un rollback.

        En aquesta funció no es realitzaran doctests ja que el seu funcionament es verifica en els doctests
        de les funcions commit() i rollback().
        """
        # assegurem que no obrim una nova transacció si n'hi ha una d'oberta
        if self.conexio.is_connected() and self.conexio.in_transaction:
            self.conexio.commit()
        self.conexio.start_transaction()

    def commit(self):
        """
        Confirma totes les operacions d'una transacció i les operacions realitzades en ella s'apliquen de
        forma permanent a la base de dades.

        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        >>> db.conecta()
        >>> db.començaTransaccio()
        >>> db.insert('provesDoctests', {'nomProva': 'prova1', 'dataHoraProva': '2002-07-30', 'dadaProva': 24.56})
        >>> db.insert('provesDoctests', {'nomProva': 'prova2', 'dataHoraProva': '2002-07-30', 'dadaProva': 89.09})
        >>> db.commit()
        >>> db.executaQuery("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests ORDER BY id DESC LIMIT 2")
        [('prova2', datetime.datetime(2002, 7, 30, 0, 0), Decimal('89.09')), ('prova1', datetime.datetime(2002, 7, 30, 0, 0), Decimal('24.56'))]
        """
        self.conexio.commit()

    def rollback(self):
        """
        Reverteix totes les operacions realitzades en la transacció i deixa la base de dades en l'estat
        abans de que s'iniciés la transacció.

        Aquesta funció és imprescindible per controlar situacions d'error sense deixar la base de dades
        en un estat indesitjat.

        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        >>> db.conecta()
        >>> db.començaTransaccio()
        >>> db.insert('provesDoctests', {'nomProva': 'prova1', 'dataHoraProva': '2002-07-30', 'dadaProva': 24.56})
        >>> db.insert('provesDoctests', {'nomProva': 'prova2', 'dataHoraProva': '2002-07-30', 'dadaProva': 89.09})
        >>> db.commit()
        >>> db.insert('provesDoctests', {'nomProva': 'prova3', 'dataHoraProva': '2002-07-30', 'dadaProva': 76.34})
        >>> db.insert('provesDoctests', {'nomProva': 'prova4', 'dataHoraProva': '2002-07-30', 'dadaProva': 89.1})
        >>> db.rollback()
        >>> db.executaQuery("SELECT nomProva, dataHoraProva, dadaProva FROM provesDoctests ORDER BY id DESC LIMIT 2")
        [('prova2', datetime.datetime(2002, 7, 30, 0, 0), Decimal('89.09')), ('prova1', datetime.datetime(2002, 7, 30, 0, 0), Decimal('24.56'))]
        """
        self.conexio.rollback()

    def infoTaules(self):
        """
        Proporciona informació de les taules de la base de dades.

        Returns:
            list of str: nom de cadascuna de les taules de la base de dades.

        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        >>> db.conecta()
        >>> db.infoTaules()
        ['dadesDispositius', 'dispositius', 'provesDoctests', 'usuaris']
        >>> db.desconecta()
        """
        cursor = self.conexio.cursor()
        cursor.execute("SHOW TABLES")
        taules = [taula[0] for taula in cursor.fetchall()]
        cursor.close()

        return taules

    def infoColumnes(self, nomTaula):
        """
        Proporciona informació de les columnes d'una taula de la base de dades.

        Args:
            nomTaula (string): nom de la taula de la qual es vol obtenir informació de les columnes

        Returns:
            list of tuple: llista de tuples que conté dos elements: el nom de la columna (str) i el tipus
                de dada (str).

        >>> db = mariaDBConn('localhost', 'ferran', '3007', 'integracioSistemes')
        >>> db.conecta()
        >>> db.infoColumnes('provesDoctests')
        [('id', 'int'), ('nomProva', 'varchar'), ('dataHoraProva', 'datetime'), ('dadaProva', 'decimal')]
        >>> db.desconecta()
        """
        cursor = self.conexio.cursor()

        cursor.execute(f"""SELECT COLUMN_NAME, DATA_TYPE 
                       FROM INFORMATION_SCHEMA.COLUMNS 
                       WHERE TABLE_SCHEMA = '{self.baseDades}' 
                       AND TABLE_NAME = '{nomTaula}'""")

        columnes = [columna for columna in cursor.fetchall()]
        cursor.close()
        return columnes

