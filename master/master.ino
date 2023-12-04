// Lora amb c
#include "lora.h"
#include "lora_mem.h"
#include "spi.h"

// Lora amb ino
// #include <SPI.h>
// #include "LoRa.h"



#include <Arduino.h>
#include "modulator.h"
// #include <avr/interrupt.h>
// #include <avr/io.h>//it includes <avr/sfr_defs.h>, <avr/portpins.h>, <avr/common.h>, <avr/version.h>
#include <stdint.h>
// #include <stdbool.h>
// #include <math.h>
#include "serial_device.h"
#include "utils.h"
#include <stdio.h>
#include "printf2serial.h"
// #include <avr/sleep.h>
#include <util/delay.h>
// #include <avr/wdt.h>
#include <string.h>
#include "gpio_device.h"


//void parse_lora( uint8_t * buf, uint8_t len, uint8_t status );
volatile bool flag = false;

void setup(){
  Serial.begin(9600);
  

  pinMode(8,OUTPUT);
  pinMode(7,OUTPUT);
  Serial.println("Start lora init");
  while (!lora_init());
  Serial.println("Lora init passed");
  sei();
}


void loop(void){
    register_lora_rx_event_callback( parse_lora );
    while(1){
      //uint8_t message[] = "G3:?H\0";
      //lora_putd(message, 6);
      //delay(4000);
      //digitalWrite(8,LOW);
      lora_event();
      if(flag){
        uint8_t message[6];
        message[0] = 'G';
        message[1] = '3';
        message[2] = ':';
        message[3] = 'N';
        message[4] = 'O';
        message[5] = '\0';
        lora_putd(message, 6);
        flag = false;
      }

      if (Serial.available() > 0) {
        String inputString = Serial.readStringUntil('\n');
        //Serial.println(inputString);
        if (inputString == "?H"){
          //Serial.println("G3:?H");
          uint8_t message[] = "G3:?H\0";
          lora_putd(message, 6);
        } else if (inputString == "?B"){
          //Serial.println("G3:?B");
          uint8_t message[] = "G3:?B\0";
          lora_putd(message, 6);
        }
      }
    } 
 }      

void parse_lora( uint8_t * buf, uint8_t len, uint8_t status ) {
  // Serial.println("Re parcero bro");
	// if( status == IRQ_PAYLOAD_CRC_ERROR_MASK ) {
	// 	return;
	// }
  //Serial.print("Per aqui");
  //digitalWrite(8,HIGH);
    if (buf[0] == 'G' && buf[1] == '3' && buf[2] == ':'){
      //digitalWrite(8,HIGH);
      if(buf[3] == "P" && buf[4] == "?"){

        flag = true;
      }
      
      digitalWrite(8,HIGH);
      // uint8_t message[] = "G3:OK\0";
      // lora_putd(message, 6);
      
      Serial.print(char(buf[3]));
      Serial.print(char(buf[4]));
      Serial.print(char(buf[5]));
      Serial.print(char(buf[6]));
      Serial.print(char(buf[7]));
      Serial.print(char(buf[8]));
      Serial.print(char(buf[9]));
      Serial.print(char(buf[10]));
      Serial.print(char(buf[11]));
      Serial.print(char(buf[12]));
      Serial.print(char(buf[13]));
      Serial.print(char(buf[14]));
      Serial.print(char(buf[15]));
      Serial.print(char(buf[16]));
      Serial.print(char(buf[17]));
      Serial.print(char(buf[18]));
      Serial.print(char(buf[19]));
      Serial.print(char(buf[20]));
      Serial.print(char(32));
      
    }
}