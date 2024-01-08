#include <SPI.h>
#include <LoRa.h>
#include <avr/sleep.h>
#include <avr/power.h>

// per llegir el valor de la temperatura
#include <OneWire.h>
#include <DallasTemperature.h>

#include "adc.h"
#include "modulator.h"
#include "secure.h"
#include "tmr0.h"
#include "tmr2.h"

// Definició dels estats que pot tenir el slave
enum estats_slave {
  sleep,
  wait_resp,
  llegintDades,
  wait_OK_comprovacioReg,
  wait_OK_bombaON,
  wait_OK_bombaOFF,
  bombaEngegada
};
volatile estats_slave estat;

uint8_t localAddress[4] = {0xAA, 0x00, 0x00, 0x00}; // adreça del dispositiu
uint8_t masterAddress[4] = {0x00, 0x00, 0x00, 0x00}; // adreça del dispositiu master
int interval_s = 10; // interval de temps entre comunicacions amb master

const int num_comunicacions_llegirDades = 2; // variable per indicar cada quantes comunicacions amb el master es llegeixen dades
int num_comunicacions_llegirDades_restants = num_comunicacions_llegirDades; // comunicacions restants per a llegir dades

volatile uint8_t msgId = 0; // comptador dels missatges de sortida
volatile uint8_t lastMsgId; // variable per emmagatzemar l'últim identificador de missatge enviat
String lastOutgoing; // variable per emmagatzemar l'últim missatge
volatile bool lastMsgRespos_flag = true; // flag per indicar si l'últim missatge enviat s'ha respos
const int intervalRepeticioMsg_s = 10; // interval de temps per repetir missatges 
volatile int num_msgRep; // comptador dels cops que s'ha repetit l'últim missatge

// flag per indicar que s'està comunicant amb el master i que no s'ha d'entrar en mode sleep
volatile bool comunicacioMasterFlag = false; 

volatile float llindarMinReg; // llindar a partir del qual es comença a regar
volatile float llindarMaxReg; // llindar a partir del qual es para de regar

const int num_mostresHumitat = 128; // nombre total de mostres d'humitat que es llegiran per cada lectura
volatile int num_mostresHumitat_restants = num_mostresHumitat - 1; // per emmagatzemar el nombre de mostres d'humitat que queden per acabar la lectura
volatile int contenidor_valorHumitat; // variable en la qual es sumaran totes les mostres d'humitat per a després realitzar la mitjana
volatile bool dadesLlegidesFlag; // flag per indicar que s'han llegit totes les mostres d'humitat
float valorHumitat; // variable per emmagatzemar el valor d'humitat llegit

const int pin_temperatura = 14; // pin per on es llegeix la temperatura
OneWire oneWire(pin_temperatura);
DallasTemperature sensors(&oneWire);
float valorTemperatura; // variable per emmagatzemar el valor de temperatura llegit

const int interval_LecturaDades_bombaON_s = 10; // interval de temps per llegir la humitat novament per comprovar si s'ha regat suficient

const int pin_bomba = 6; // pin per activar i desactivar la bomba

// canvia l'estat i el printa
void canviaEstat(estats_slave nouEstat) {
  estat = nouEstat;
  printaEstat();
}

// printa l'estat actual. Únicament serveix per debugar
void printaEstat() {
  switch (estat) {
    case sleep:
      Serial.println("Estat sleep");
      break;
    case wait_resp:
      Serial.println("Estat wait_resp");
      break;
    case llegintDades:
      Serial.println("Estat llegintDades");
      break;
    case wait_OK_comprovacioReg:
      Serial.println("Estat wait_OK_comprovacioReg");
      break;
    case wait_OK_bombaON:
      Serial.println("Estat wait_OK_bombaON");
      break;
    case wait_OK_bombaOFF:
      Serial.println("Estat wait_OK_bombaOFF");
      break;
    case bombaEngegada:
      Serial.println("Estat bombaEngegada");
      break;
    default:
      Serial.println("Estat no reconegut");
      break;
  }
}

// per iniciar la comunicació amb el master. Surt de l'estat sleep i activa el flag
// de comunicació amb el master
void iniciaComunicacioMaster() {
  comunicacioMasterFlag = true;
  canviaEstat(wait_resp);

  sendMessage("preg");

  LoRa.receive();
}

// per finalitzar la comunicació amb el master. Posa el dispositiu amb mode sleep
// i reinicia el timer 0 per tal de que torni a començar la comunicació.
// Canvia al estat sleep i desactiva el flag de comunicació amb el master
void acabaComunicacioMaster() {
  if (num_comunicacions_llegirDades_restants > 0) num_comunicacions_llegirDades_restants--;

  comunicacioMasterFlag = false;
  canviaEstat(sleep);
  setup_tmr0(interval_s, iniciaComunicacioMaster);

}

// modifica els llindars de reg del dispositiu
void canviaLlindars(float llindarMin, float llindarMax) {
  Serial.println("Canviant llindars");
  
  llindarMinReg = llindarMin;
  llindarMaxReg = llindarMax;

  
  Serial.print("llindarMin: ");
  Serial.println(llindarMinReg);
  Serial.print("llindarMax: ");
  Serial.println(llindarMaxReg);
}

// s'executa en la interrupció del timer 0 per tornar a calcular el valor de l'humitat després de regar un cert temps.
// Inicia la lectura de dades i modifica l'estat a llegintDades
void bombaEngegada_to_llegintDades() {
  iniciaLectura();
  canviaEstat(llegintDades);
}

// inicia la lectura de dades d'humitat. Això implica engegar el modulator i les interrupcions del timer 2
void iniciaLectura() {
  modulator_set(true);
  tmr2_set(8);
  start_ADC();

  dadesLlegidesFlag = false;
  num_mostresHumitat_restants = num_mostresHumitat - 1;
}

// atura la lectura de dades d'humitat. Això implica aturar el modulator i les interrupcions del timer 2
void aturaLectura () {
  modulator_set(false);
  tmr2_set(0);
}

// envia les dades d'humitat i de temperatura especificades en el format que espera el master ("d-H:100T:40")
void enviaDades() {
  String humitat_string = String(valorHumitat);
  String temperatura_string = String(valorTemperatura);

  sendMessage("d-H:" + humitat_string + "T:" + temperatura_string);
}

// envia l'estat del reg
void enviaEstatReg(String estatReg) {
  sendMessage("r-" + estatReg);
}

// engega la bomba
void engegaBomba() {
  digitalWrite(pin_bomba, HIGH);
}

// para la bomba
void paraBomba() {
  digitalWrite(pin_bomba, LOW);
}

// consulta l'estat de la bomba. True si està engegada i False si està parada
bool comprovaReg() {
  return (digitalRead(pin_bomba) == 1);
}

void setup() {
  Serial.begin(9600);
  while (!Serial);

  Serial.println("LoRa Slave");

  delay(5000);

  LoRa.setPins(10,5,2); //Per sensor
  while(!LoRa.begin(866E6));
  Serial.println("Starting LoRa!");

  delay(200);

  // iniciem el el timer0 per a la comunicació amb el master 
  setup_tmr0(interval_s, iniciaComunicacioMaster);

  // iniciem el modulator, el timer2 i l'ADC (utilitzats en la lectura de dades d'humitat)
  modulator_init();
  setup_tmr2(124, 8);
  setup_ADC(1,5,16);

  // per llegir la temperatura
  sensors.begin();

  //register the receive callback
  LoRa.onReceive(onReceive);
  //put the radio into receive mode
  LoRa.receive();

  // configurem el mode de baix consum
  set_sleep_mode(SLEEP_MODE_IDLE);
  sleep_enable();

  // iniciem l'estat del slave a sleep
  estat = sleep;

  // inicialitzem els valors per defecte dels llindars de reg
  llindarMinReg = 50;
  llindarMaxReg = 75;

  // inicialitzem el pin de la bomba com a sortida i activem el pin ENA (PC3 = A3/17)
  pinMode(pin_bomba, OUTPUT);
  pinMode(17, OUTPUT);
  digitalWrite(17, HIGH);
  
  pinMode(4,OUTPUT);
  digitalWrite(4,HIGH);
}

void loop() {
  if (!comunicacioMasterFlag) {
    sleep_mode();
  }

  if (estat == llegintDades) {
    if (dadesLlegidesFlag) { // s'han acabat de llegir les dades
      // en tots els casos aturem la lectura de dades
      aturaLectura();

      // càlcul del valor mitjà d'humitat
      float avg_humitat = contenidor_valorHumitat / num_mostresHumitat;

      // càlcul per obtenir l'humitat en percentatge
      valorHumitat = ((255 - avg_humitat)/255)*100;
      Serial.println(valorHumitat);

      // obtenim la temperatura
      sensors.requestTemperatures();  // Solicitar la temperatura al sensor
      valorTemperatura = sensors.getTempCByIndex(0);  // Obtener la temperatura en grados Celsius
      Serial.println(valorTemperatura);

      if (!comprovaReg()) { // la bomba està OFF
        enviaDades(); // enviem els valors d'humitat llegits
        // modifiquem l'estat
        canviaEstat(wait_OK_comprovacioReg);
      }
      else { // la bomba està ON
        if (valorHumitat < llindarMaxReg) { // seguim amb la bomba ON i llegintDades
          setup_tmr0(interval_LecturaDades_bombaON_s, bombaEngegada_to_llegintDades);
          // modifiquem l'estat
          canviaEstat(bombaEngegada);
        }
        else { // iniciem procediment per parar la bomba
          enviaEstatReg("OFF");
          // modifiquem l'estat
          canviaEstat(wait_OK_bombaOFF);
        }
      }
      
    }
  }
}

// per enviar un missatge al master per LoRa
void sendMessage(String outgoing){
  Serial.print("Sending packet: ");
  Serial.println(msgId);

  // send packet
  LoRa.beginPacket();
  LoRa.write(masterAddress, 4);
  LoRa.write(localAddress, 4);
  LoRa.write(msgId);
  
  //uint8_t crc[4] = {0x00, 0x00, 0x00, 0x00}; // substituir per calcul de CRC
  uint8_t crc[4];
  calcularCRC(crc, outgoing.c_str(), outgoing.length());
  LoRa.write(crc, 4);

  LoRa.write(outgoing.length());

  LoRa.print(outgoing);
  LoRa.endPacket();

  // guardem el missatge i el msgId enviat i marquem que no s'ha respòs
  lastOutgoing = outgoing;
  lastMsgId = msgId;
  lastMsgRespos_flag = false;

  // activem la repetició del missatge per si el master no respon
  num_msgRep = 0;
  setup_tmr0(intervalRepeticioMsg_s, repetirMissatge);

  if (msgId < 255) msgId++;
  else msgId = 0;

  LoRa.onReceive(onReceive);
  LoRa.receive();
}

// per tornar a enviar l'últim missatge enviat
void repetirMissatge() {
  // comprovem si s'ha respos a l'últim missatge
  if (lastMsgRespos_flag) return;

  // comprovem si el missatge s'ha repetit més de 5 cops, en aquest cas tanquem la comunicació amb el master
  if (num_msgRep >= 5) {
    acabaComunicacioMaster();
    return;
  }
  else num_msgRep++;

  Serial.print("Repeating packet: ");
  Serial.println(lastMsgId);

  // send packet
  LoRa.beginPacket();
  LoRa.write(masterAddress, 4);
  LoRa.write(localAddress, 4);
  LoRa.write(lastMsgId);
  
  //uint8_t crc[4] = {0x00, 0x00, 0x00, 0x00}; // substituir per calcul de CRC
  uint8_t crc[4];
  calcularCRC(crc, lastOutgoing.c_str(), lastOutgoing.length());
  LoRa.write(crc, 4);

  LoRa.write(lastOutgoing.length());

  LoRa.print(lastOutgoing);
  LoRa.endPacket();

  // activem la repetició del missatge per si el master continua sense respondre
  setup_tmr0(intervalRepeticioMsg_s, repetirMissatge);

  LoRa.onReceive(onReceive);
  LoRa.receive();
}

// Per llegir un missatge LoRa. S'executa quan es rep un missatge per LoRa
void onReceive(int packetSize){
  if (packetSize) {
    
    // read packet header bytes
    uint8_t recipient[4];
    LoRa.readBytes(recipient, 4);
    uint8_t senderAddress[4];
    LoRa.readBytes(senderAddress, 4);
    byte incomingMsgId = LoRa.read();
    uint8_t incomingCRC[4];
    LoRa.readBytes(incomingCRC, 4);
    byte incomingLength = LoRa.read();

    //comprovem si som el receptor del paquet
    if (memcmp(recipient, localAddress, 4) != 0) {
      Serial.println("Aquest missatge no és per mi.");
      return;
    }

    String incoming = "";
    // llegim el paquet rebut
    while (LoRa.available()) {
      incoming += (char)LoRa.read();
    }

    // desxifrem el paquet rebut
    // char outgoingDesxifrat[incoming.length()];
    // decrypt_xor(incoming.c_str(), outgoingDesxifrat, 0xAA);
    // Serial.println(outgoingDesxifrat);

    // received a packet
    Serial.print("Received packet: ");
    Serial.println(incoming);
    
    // verifiquem el CRC rebut i la longitud indicada
    if (!verificarCRC(incoming.c_str(), incomingLength, incomingCRC)) {
      Serial.print("CRC incorrecte: ");
      for (int i = 0; i < 4; i++)
        Serial.print(incomingCRC[i], HEX);
      return;
      Serial.println();
    }

    // comprovem si s'està responent a l'últim missatge enviat
    if (incomingMsgId == lastMsgId) { // resposta a l'últim missatge rebuda
      lastMsgRespos_flag = true;
      // aturem l'enviament del repetiment l'últim missatge
      stop_tmr0();
    }
    else {      
      Serial.println("El missatge no es correspon a l'últim missatge enviat");
      return;
    }

    // realizem una acció o una altra depenent de l'estat en el que ens trobem
    switch (estat) {
      case sleep:
        break;

      case wait_resp:
        Serial.println(num_comunicacions_llegirDades_restants);

        if (strcmp(incoming.c_str(), "NOASS") == 0)  {
          acabaComunicacioMaster();
        }
        else if (strcmp(incoming.c_str(), "NO") == 0)  {
          if (num_comunicacions_llegirDades_restants == 0) {
            num_comunicacions_llegirDades_restants = num_comunicacions_llegirDades;
            iniciaLectura();
            canviaEstat(llegintDades);
          }
          else {
            acabaComunicacioMaster();
          }
        }
        else if (incoming.startsWith("CP-")) {
          // Obtenim el llidarMin i el llindarMax a modificar
          int posMin = incoming.indexOf("min:");
          int posMax = incoming.indexOf("max:");
          float llindarMin = incoming.substring(posMin + 4, posMax).toFloat();
          float llindarMax = incoming.substring(posMax + 4).toFloat();  

          canviaLlindars(llindarMin, llindarMax);
          
          if (num_comunicacions_llegirDades_restants == 0) {
            num_comunicacions_llegirDades_restants = num_comunicacions_llegirDades;
            iniciaLectura();
            canviaEstat(llegintDades);
          }
          else {
            acabaComunicacioMaster();
          }
        }
        break;

      case wait_OK_comprovacioReg:

        if (strcmp(incoming.c_str(), "OK") == 0)  { // rebem la confirmació
          
          if (valorHumitat < llindarMinReg) {
            enviaEstatReg("ON");
            // modifiquem l'estat
            canviaEstat(wait_OK_bombaON);
          }

          else {
            enviaEstatReg("OFF");
            // modifiquem l'estat
            canviaEstat(wait_OK_bombaOFF);
          }
        }

      case wait_OK_bombaON:

        if (strcmp(incoming.c_str(), "OK") == 0)  { // rebem la confirmació
          engegaBomba();
          setup_tmr0(interval_LecturaDades_bombaON_s, bombaEngegada_to_llegintDades);
          // modifiquem l'estat
          canviaEstat(bombaEngegada);
        }

      case wait_OK_bombaOFF:

        if (strcmp(incoming.c_str(), "OK") == 0)  { // rebem la confirmació
          paraBomba();
          acabaComunicacioMaster();
        }

      default:
        Serial.println("Estat no reconegut");
        break;
    }
    

    LoRa.onReceive(onReceive);
    LoRa.receive();
  }
}

// interrupció del timer 2 que serveix per llegir les mostres d'humitat
ISR(TIMER2_COMPA_vect){
    uint8_t value=read8_ADC();
    start_ADC();
    num_mostresHumitat_restants --;
    contenidor_valorHumitat += value;
    if (num_mostresHumitat_restants == 0){ // ja s'han llegit totes les mostres que es volien
        dadesLlegidesFlag = 1;
    }
}  
