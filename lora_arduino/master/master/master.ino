#include <SPI.h>
#include <LoRa.h>

byte localAddress = 0x00; // adreça del dispositiu master

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

void sendMessage(byte destinationAddress, byte msgIdResponse, String outgoing){
  // send packet
  LoRa.beginPacket();
  LoRa.write(destinationAddress);
  LoRa.write(localAddress);
  LoRa.write(msgIdResponse); //id del missatge que es respon

  byte CRC = 0x00; // substituir per calcul de CRC
  LoRa.write(CRC);

  LoRa.write(outgoing.length());

  LoRa.print(outgoing);
  LoRa.endPacket();
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
