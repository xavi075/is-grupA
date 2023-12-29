#include <SPI.h>
#include <LoRa.h>
#include <avr/sleep.h>
#include <avr/power.h>

#include "tmr0.h"
#include "secure.h"

uint8_t msgId = 0; // comptador dels missatges de sortida
uint8_t localAddress[4] = {0xAA, 0x00, 0x00, 0x00}; // adreça del dispositiu
uint8_t masterAddress[4] = {0x00, 0x00, 0x00, 0x00}; // adreça del dispositiu master
int interval_s = 10; // interval de temps entre comunicacions amb master

// flag per indicar que s'està comunicant amb el master i que no s'ha d'entrar en mode sleep
volatile bool comunicacioMasterFlag = false; 

// per iniciar la comunicació amb el master
void iniciaComunicacioMaster() {
  comunicacioMasterFlag = true;

  sendMessage("hello");
  LoRa.receive();
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

  if (msgId < 255) msgId++;
  else msgId = 0;
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
