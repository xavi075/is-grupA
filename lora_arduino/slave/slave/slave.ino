#include <SPI.h>
#include <LoRa.h>
#include <avr/sleep.h>
#include <avr/power.h>

#include "tmr0.h"
#include "secure.h"

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

const uint8_t localAddress[4] = {0xAA, 0x00, 0x00, 0x00}; // adreça del dispositiu
const uint8_t masterAddress[4] = {0x00, 0x00, 0x00, 0x00}; // adreça del dispositiu master
const int interval_s = 10; // interval de temps entre comunicacions amb master

volatile uint8_t msgId = 0; // comptador dels missatges de sortida
volatile uint8_t lastMsgId; // variable per emmagatzemar l'últim identificador de missatge enviat
String lastOutgoing; // variable per emmagatzemar l'últim missatge
volatile bool lastMsgRespos_flag = true; // flag per indicar si l'últim missatge enviat s'ha respos
const int intervalRepeticioMsg_s = 10; // interval de temps per repetir missatges 
volatile int num_msgRep; // comptador dels cops que s'ha repetit l'últim missatge

// flag per indicar que s'està comunicant amb el master i que no s'ha d'entrar en mode sleep
volatile bool comunicacioMasterFlag = false; 

// per iniciar la comunicació amb el master
void iniciaComunicacioMaster() {
  comunicacioMasterFlag = true;

  //sendMessage("hello");
  sendMessage("?"); 
  LoRa.receive();
}

// per finalitzar la comunicació amb el master. Posa el dispositiu amb mode sleep
// i reinicia el timer 0 per tal de que torni a començar la comunicació
void acabaComunicacioMaster() {
  comunicacioMasterFlag = false;
  setup_tmr0(interval_s, iniciaComunicacioMaster);
}

// modifica els llindars de reg del dispositiu
void canviaLlindars(float llindarMin, float llindarMax) {
  // per fer
}

// inicia la lectura de dades d'humitat i de temperatura
void iniciaLectura() {
  // per fer
}

// envia les dades d'humitat i de temperatura especificades en el format que espera el master ("d-H:100T:40")
void enviaDades(float humitat, float temperatura) {
  String humitat_string = String(humitat);
  String temperatura_string = String(temperatura);

  sendMessage("d-H:" + humitat_string + "T:" + temperatura_string);
}

// comprova l'estat en el que es troba la bomba i retorna el valor adequat
bool comprovaReg() {
  // per fer
}

// envia l'estat del reg
void enviaEstatReg(String estatReg) {
  sendMessage("r-" + estatReg);
}

// engega la bomba
void engegaBomba() {
  // per fer
}

// para la bomba
void paraBomba() {
  // per fer
}

void setup() {
  Serial.begin(9600);
  while (!Serial);

  Serial.println("LoRa Slave");

  LoRa.setPins(10,5,2); //Per sensor
  while(!LoRa.begin(866E6));
  Serial.println("Starting LoRa!");

  // iniciem el el timer per a la comunicació amb el master 
  setup_tmr0(interval_s, iniciaComunicacioMaster);

  //register the receive callback
  LoRa.onReceive(onReceive);
  //put the radio into receive mode
  LoRa.receive();

  // configurem el mode de baix consum
  set_sleep_mode(SLEEP_MODE_IDLE);
  sleep_enable();

  // iniciem l'estat del slave a sleep
  estat = sleep;
  
  pinMode(4,OUTPUT);
  digitalWrite(4,HIGH);
}

void loop() {
  if (!comunicacioMasterFlag) {
    sleep_mode();
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

  // activem la repetició del missatge per si el master no responent
  num_msgRep = 0;
  setup_tmr0(intervalRepeticioMsg_s, repetirMissatge);

  if (msgId < 255) msgId++;
  else msgId = 0;
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

  Serial.print("Sending packet: ");
  Serial.println(msgId);

  // send packet
  LoRa.beginPacket();
  LoRa.write(masterAddress, 4);
  LoRa.write(localAddress, 4);
  LoRa.write(msgId);
  
  //uint8_t crc[4] = {0x00, 0x00, 0x00, 0x00}; // substituir per calcul de CRC
  uint8_t crc[4];
  calcularCRC(crc, lastOutgoing.c_str(), lastOutgoing.length());
  LoRa.write(crc, 4);

  LoRa.write(lastOutgoing.length());

  LoRa.print(lastOutgoing);
  LoRa.endPacket();

  // activem la repetició del missatge per si el master continua sense respondre
  setup_tmr0(intervalRepeticioMsg_s, repetirMissatge);
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

    String incoming = "";
    // llegim el paquet enviat
    while (LoRa.available()) {
      incoming += (char)LoRa.read();
    }

    // received a packet
    Serial.print("Received packet: ");
    Serial.println(incoming);
    
    // verifiquem el CRC rebut i la longitud indicada
    if (!verificarCRC(incoming.c_str(), incomingLength, incomingCRC)) {
      Serial.print("CRC incorrecte: ");
      for (int i = 0; i < 4; i++)
        Serial.print(incomingCRC[i], HEX);
      return;
    }

    if (strcmp(incoming.c_str(), "Bye") == 0)  {
      sendMessage("ByeACK");
      Serial.println("Sending packet: ByeACK");
      comunicacioMasterFlag = false;
    }

    LoRa.onReceive(onReceive);
    LoRa.receive();
  }
}
