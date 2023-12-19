#include <SPI.h>
#include <LoRa.h>

int counter = 0;

void setup() {
  Serial.begin(9600);
  while (!Serial);

  Serial.println("LoRa Receiver");

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
  Serial.println(counter);

  sendMessage("hello");
  LoRa.receive();
  counter++;

  delay(5000);
}

void sendMessage(String outgoing){
  // send packet
  LoRa.beginPacket();
  LoRa.print(outgoing);
  LoRa.endPacket();
}

void onReceive(int packetSize){
  if (packetSize) {
    // received a packet
    Serial.print("Received packet '");

    char missatge[20];
    int i = 0;
    // read packet
    while (i < packetSize) {
      char caracter = (char)LoRa.read();
      missatge[i] = caracter;
      i++;      
      Serial.print(caracter);
    }
    /*if(missatge[0] == 'h' && missatge[1] == 'e' && missatge[2] == 'l' && missatge[3] == 'l' && missatge[4] == 'o'){
      digitalWrite(4,LOW);
    }*/

    sendMessage("Bye ACK\n");
    Serial.println("Bye ACK");

    LoRa.receive();
  }
}
