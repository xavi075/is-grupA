CREATE DATABASE integracioSistemes; --crear db
USE integracioSistemes; --establir-la com a predeterminada
SET autocommit = 0; -- per evitar que cada sentència es tracti com una transacció independent

-- crear les taules necessàries
CREATE TABLE usuaris ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    email VARCHAR(100) UNIQUE NOT NULL,
    nomUsuari VARCHAR(50) NOT NULL,
    contrasenya_hash VARCHAR(64) NOT NULL,
    dataCreacioUsuari DATETIME
);

CREATE TABLE dispositius (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuariPropietari INT,
    nomDispositiu VARCHAR(50),
    nivellMinimReg DECIMAL,
    nivellMaximReg DECIMAL,
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

CREATE TABLE canvisReg (
    idDispositiu INT,
    dataHora DATETIME,
    estatReg BOOLEAN,
    PRIMARY KEY (idDispositiu, dataHora),
    FOREIGN KEY (idDispositiu) REFERENCES dispositius (id) 
);

CREATE TABLE provesDoctests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomProva VARCHAR(50),
    dataHoraProva DATETIME,
    dadaProva DECIMAL (5, 2)
);

-- afegim triggers

-- triggers per verificar que no hi hagi més d'un dispositiu amb el mateix nom per al mateix usuari
DELIMITER //
CREATE TRIGGER verifica_nomDispositiu_usuari_insert
BEFORE INSERT ON dispositius
FOR EACH ROW
BEGIN
    DECLARE num_dispositius INT;

    SELECT COUNT(*) INTO num_dispositius
    FROM dispositius
    WHERE idUsuariPropietari = NEW.idUsuariPropietari
      AND nomDispositiu = NEW.nomDispositiu;

    IF num_dispositius > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El usuari ja té un dispositiu amb el mateix nom';
    END IF;
END;
//

CREATE TRIGGER verifica_nomDispositiu_usuari_update
BEFORE UPDATE ON dispositius
FOR EACH ROW
BEGIN
    DECLARE num_dispositius INT;

    IF NOT (NEW.idUsuariPropietari = OLD.idUsuariPropietari AND NEW.nomDispositiu = OLD.nomDispositiu) THEN
        SELECT COUNT(*) INTO num_dispositius
        FROM dispositius
        WHERE idUsuariPropietari = NEW.idUsuariPropietari
        AND nomDispositiu = NEW.nomDispositiu;

        IF num_dispositius > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: El usuari ja té un dispositiu amb el mateix nom';
        END IF;
    END IF;
END 
//

-- trigger per verificar que els estats del reg inserit només siguin 0 o 1
CREATE TRIGGER verifica_estatReg
BEFORE INSERT ON canvisReg
FOR EACH ROW
BEGIN
    IF NEW.estatReg NOT IN (0, 1) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: estatReg ha de ser 0 o 1';
    END IF;
END;
//

-- trigger per verificar que s'insereixi un usuari amb email repetit, solucionant d'aquesta manera
-- problemes amb el auto_increment del id
CREATE TRIGGER verifica_emailRepetit
BEFORE INSERT ON usuaris
FOR EACH ROW
BEGIN
    DECLARE num_usuaris INT;

    SELECT COUNT(*) INTO num_usuaris
    FROM usuaris
    WHERE email = NEW.email;

    IF num_usuaris > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Ja hi ha un usuari insertat amb aquest correu electrònic';
    END IF;
END;
//
DELIMITER ;
