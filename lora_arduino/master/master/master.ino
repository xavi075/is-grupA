#include <SPI.h>
#include <LoRa.h>

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
}

void loop() {
  
}

void sendMessage(String outgoing){
  // send packet
  LoRa.beginPacket();
  LoRa.print(outgoing);
  LoRa.endPacket();
}

void onReceive(int packetSize){
  Serial.print("On receive --> ");
  if (packetSize == 0) return;
  // received a packet
  Serial.print("Received packet '");

  //char missatge[20];
  //int i = 0;
  String missatge = "";
  // read packet
  while (LoRa.available()) {
    char caracter = (char)LoRa.read();
    missatge += caracter;      
    Serial.print(caracter);
  }
  //if(missatge[0] == 'h' && missatge[1] == 'e' && missatge[2] == 'l' && missatge[3] == 'l' && missatge[4] == 'o'){
  //  digitalWrite(4,LOW);
  //  sendMessage("Bye \n");
  //  Serial.println("Bye");
  //}
  if (missatge == "hello"){
    sendMessage("Bye\n");
    Serial.println("Bye");
  }
  LoRa.receive();
}
