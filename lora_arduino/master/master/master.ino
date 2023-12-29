#include <SPI.h>
#include <LoRa.h>

#include "secure.h"

uint8_t localAddress[4] = {0x00, 0x00, 0x00, 0x00}; // adreça del dispositiu master

void setup() {
  Serial.begin(9600);
  while (!Serial);

  Serial.println("LoRa Master");

  //LoRa.setPins(10,5,2); //Per sensor
  while(!LoRa.begin(866E6));
  Serial.println("Starting LoRa!");

  //register the receive callback
  LoRa.onReceive(onReceive);
  //put the radio into receive mode
  LoRa.receive();
  
  pinMode(4,OUTPUT);
  digitalWrite(4,HIGH);
  delay(5000);
}

void loop() {
  // delay(5000);
  // Serial.println("Nada por aqui");
}

// per enviar un missatge a qualsevol esclau responent a un missatge per LoRa
void sendMessage(uint8_t destinationAddress[], byte msgIdResponse, String outgoing){
  // send packet
  LoRa.beginPacket();
  LoRa.write(destinationAddress, 4);
  LoRa.write(localAddress, 4);
  LoRa.write(msgIdResponse); //id del missatge que es respon

  //uint8_t crc[4] = {0x00, 0x00, 0x00, 0x00}; // substituir per calcul de CRC
  uint8_t crc[4];
  calcularCRC(crc, outgoing.c_str(), outgoing.length());
  LoRa.write(crc, 4);

  LoRa.write(outgoing.length());

  LoRa.print(outgoing);
  LoRa.endPacket();
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

    if (strcmp(incoming.c_str(), "hello") == 0)  {
      digitalWrite(4,LOW);
      sendMessage(senderAddress, incomingMsgId, "Bye");
      Serial.println("Sending packet: Bye");
    }

    LoRa.receive();
    LoRa.onReceive(onReceive);
  }
  Serial.println("LoRa Receiver");
}
