#include <SPI.h>
#include <LoRa.h>

byte msgId = 0; // comptador dels missatges de sortida
byte localAddress = 0xAA; // adreça del dispositiu
byte masterAddress = 0x00; // adreça del dispositiu master

void setup() {
  Serial.begin(9600);
  while (!Serial);

  Serial.println("LoRa Slave");

  LoRa.setPins(10,5,2); //Per sensor
  while(!LoRa.begin(866E6));
  Serial.println("Starting LoRa!");

  //register the receive callback
  LoRa.onReceive(onReceive);
  //put the radio into receive mode
  LoRa.receive();
  
  pinMode(4,OUTPUT);
  digitalWrite(4,HIGH);
}

void loop() {
  Serial.print("Sending packet: ");
  Serial.println(msgId);

  sendMessage("hello");
  LoRa.receive();

  //delay(300000);
  //delay(60000);
  delay(10000);
}

void sendMessage(String outgoing){
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
