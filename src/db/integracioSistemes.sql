CREATE DATABASE integracioSistemes; --crear db
USE integracioSistemes; --establir-la com a predeterminada
SET autocommit = 0; -- per evitar que cada sentència es tracti com una transacció independent

-- crear les taules necessàries
CREATE TABLE usuaris ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    email VARCHAR(100) UNIQUE NOT NULL,
    nomUsuari VARCHAR(50) NOT NULL
);

CREATE TABLE dispositius (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuariPropietari INT,
    nomDispositiu VARCHAR(50) NOT NULL,
    FOREIGN KEY (idUsuariPropietari) REFERENCES usuaris (id)  
);

CREATE TABLE dadesDispositius (
    idDispositiu INT,
    dataHora DATETIME,
    dadaHum DECIMAL,
    dadaTemp DECIMAL,
    PRIMARY KEY (idDispositiu, dataHora),
    FOREIGN KEY (idDispositiu) REFERENCES dispositius (id) 
);

CREATE TABLE provesDoctests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomProva VARCHAR(50),
    dataHoraProva DATETIME,
    dadaProva DECIMAL (5, 2)
);