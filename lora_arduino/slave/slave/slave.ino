#include <SPI.h>
#include <LoRa.h>

#include "tmr0.h"

byte msgId = 0; // comptador dels missatges de sortida
byte localAddress = 0xAA; // adreça del dispositiu
byte masterAddress = 0x00; // adreça del dispositiu master
int interval_s = 10; // interval de temps entre comunicacions amb master

// per iniciar la comunicació amb el master
void iniciaComunicacioMaster() {
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
  
  pinMode(4,OUTPUT);
  digitalWrite(4,HIGH);
}

void loop() {
}

// per enviar un missatge al master per LoRa
void sendMessage(String outgoing){
  Serial.print("Sending packet: ");
  Serial.println(msgId);

  // send packet
  LoRa.beginPacket();
  LoRa.write(masterAddress);
  LoRa.write(localAddress);
  LoRa.write(msgId);
  
  byte CRC = 0x00; // substituir per calcul de CRC
  LoRa.write(CRC);

  LoRa.write(outgoing.length());

  LoRa.print(outgoing);
  LoRa.endPacket();

  msgId++;
}

// Per llegir un missatge LoRa. S'executa quan es rep un missatge per LoRa
void onReceive(int packetSize){
  if (packetSize) {
    
    // read packet header bytes
    int recipient = LoRa.read();
    byte senderAddress = LoRa.read();
    byte incomingMsgId = LoRa.read();
    byte incomingCRC = LoRa.read();
    byte incomingLength = LoRa.read();

    //comprovem si som el receptor del paquet
    if (recipient != localAddress) {
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
    
    if (strcmp(incoming.c_str(), "Bye") == 0)  {
      sendMessage("ByeACK");
      Serial.println("Sending packet: ByeACK");
    }

    LoRa.receive();
    LoRa.onReceive(onReceive);

    LoRa.receive();
  }
}
