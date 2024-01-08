#include <SPI.h>
#include <LoRa.h>

#include "secure.h"

uint8_t localAddress[4] = {0x00, 0x00, 0x00, 0x00}; // adreça del dispositiu master

// printa una adreça en hexadecimal pel port sèrie. Facilita la comunicació pel port sèrie
void printaAddress(uint8_t address[4]) {
  for (int i = 0; i < 4; i++) {
    // ens assegurem que sempre es printin dos dígits hexadeximals
    if (address[i] < 0x10) {
      Serial.print("0");
    }
    Serial.print(address[i], HEX);
  }
}

String llegeixPortSerie() {
  while (!Serial.available());
  
  String resposta;
  while (Serial.available() > 0) {
    // Lee el byte recibido
    char byteRecibido = Serial.read();

    resposta.concat(byteRecibido);
  }
  Serial.print("RESPOSTA = ");
  Serial.println(resposta);
  return resposta;
}

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

  
  // xifrem el paquet
  // char outgoingXifrat[outgoing.length()];
  // Serial.println(outgoing);
  // encrypt_xor(outgoing.c_str(), outgoingXifrat, 0xAA);
  // Serial.println(outgoing);
  // Serial.println(outgoingXifrat);
  
  //char outgoingDesxifrat[outgoing.length()];
  //decrypt_xor(outgoingXifrat, outgoingDesxifrat, 0xAA);
  //Serial.println(outgoingDesxifrat);


  LoRa.print(outgoing);
  
  
  LoRa.endPacket();
  
  Serial.print("Sending packet: ");
  Serial.println(outgoing);
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

    // if (strcmp(incoming.c_str(), "hello") == 0)  {
    //   digitalWrite(4,LOW);
    //   sendMessage(senderAddress, incomingMsgId, "Bye");
    // }

    // si el missatge és "preg" demanem si hi ha algun canvi de paràmetres
    if (strcmp(incoming.c_str(), "preg") == 0)  {
      // enviem missatge pel port sèrie
      Serial.print("?-");
      printaAddress(senderAddress);
      Serial.println();

      // llegim la resposta
      //String resposta = llegeixPortSerie();
    
      // retornem la resposta al slave. La resposta pot ser "NO", "NOASS" o semblant a "CP-min:45.0max:70.6"
      // sendMessage(senderAddress, incomingMsgId, resposta.c_str());
      // Serial.print("Sending packet: ");
      // Serial.println(resposta);

      sendMessage(senderAddress, incomingMsgId, "NO");
    }

    // si el missatge comença per "d-", significa que ens està enviant les dades d'humitat i temperatura
    else if (incoming.startsWith("d-"))  {
      // trobem la posició de "H:" i de "T:"
      int posH = incoming.indexOf("H:");
      int posT = incoming.indexOf("T:"); 
      
      // comprova si el format és l'esperat
      if (posH == -1 || posT == -1) return;

      // enviem missatge pel port sèrie
      Serial.print("d-");
      printaAddress(senderAddress);
      Serial.print("-");
      Serial.print(incoming.substring(posH));
      Serial.println();

      // // llegim la resposta
      // String resposta = llegeixPortSerie();
      
      // // si ha anat bé, informem al slave enviant "OK"
      // if (strcmp(resposta.c_str(), "OK") == 0) {
      //   sendMesssage(senderAddress, incomingMsgId, resposta.c_str());
      //   Serial.print("Sending packet: ");
      //   Serial.println(resposta);
      // }

      sendMessage(senderAddress, incomingMsgId, "OK");
    }

    // si el missatge comença per -r, signigica que està enviant l'estat del reg
    else if (incoming.startsWith("r-"))  {
      // obtenim la subcadena posterior a "r-""
      String estat = incoming.substring(2);

      // enviem missatge pel port sèrie
      Serial.print("r-");
      printaAddress(senderAddress);
      Serial.print("-");
      Serial.print(estat);
      Serial.println();

      // // llegim la resposta
      // String resposta = llegeixPortSerie();
      // Serial.print("RESPOSTA: ");
      // Serial.println(resposta);

      // // si ha anat bé, informem al slave enviant "OK"
      // if (strcmp(resposta.c_str(), "OK") == 0) {
      //   sendMesssage(senderAddress, incomingMsgId, resposta.c_str());
      //   Serial.print("Sending packet: ");
      //   Serial.println(resposta);
      // }

      sendMessage(senderAddress, incomingMsgId, "OK");
    }

    LoRa.receive();
    LoRa.onReceive(onReceive);
  }
  Serial.println("LoRa Receiver");
}
