// Lora amb c
#include "lora.h"
#include "lora_mem.h"
#include "spi.h"

// Lora amb ino
// #include <SPI.h>
// #include "LoRa.h"



#include <Arduino.h>
//#include "modulator.h"
// #include <avr/interrupt.h>
// #include <avr/io.h>//it includes <avr/sfr_defs.h>, <avr/portpins.h>, <avr/common.h>, <avr/version.h>
#include <stdint.h>
// #include <stdbool.h>
// #include <math.h>
//#include "serial_device.h"
#include "utils.h"
#include <stdio.h>
#include "printf2serial.h"
// #include <avr/sleep.h>
#include <util/delay.h>
// #include <avr/wdt.h>
#include <string.h>
//#include "gpio_device.h"


void parse_lora( uint8_t * buf, uint8_t len, uint8_t status );
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
      lora_event();
      
       if (Serial.available() > 0) {
        
        char valor = Serial.read(); 
        if (valor == 'N'){
          delay(10);
          valor = Serial.read(); 
         
          
          if (valor == 'O'){
            cli();
            delay(10);
            
            //valor = Serial.read();
            //if(valor == '\n'){
            
            uint8_t missatge[6];
            missatge[0] = 'G';
            missatge[1] = '3';
            missatge[2] = ':';
            missatge[3] = 'N';
            missatge[4] = 'O';
            missatge[5] = '\0';
            lora_putd(missatge, 6);
            
            //printf("G3:NO\n");
            delay(100);
            sei();
            //register_lora_rx_event_callback( parse_lora );

            digitalWrite(8,HIGH);
            flag = true;
            //}
          }
        } else if(valor == 'O') {
          delay(10);
          valor = Serial.read(); 
         
          
          if (valor == 'K'){
            cli();
            delay(10);
            digitalWrite(7,HIGH); 
            //valor = Serial.read();
            //if(valor == '\n'){
            
            uint8_t missatge[6];
            missatge[0] = 'G';
            missatge[1] = '3';
            missatge[2] = ':';
            missatge[3] = 'O';
            missatge[4] = 'K';
            missatge[5] = '\0';
            lora_putd(missatge, 6);
            
            //printf("G3:NO\n");
            delay(100);
            sei();
            //register_lora_rx_event_callback( parse_lora );

            digitalWrite(8,HIGH);
            flag = true;
            //}
          }
        }
        
        //String inputString = Serial.readStringUntil('\n');
        
        //if (inputString == "?H"){
        //  //Serial.println("G3:?H");
        //  uint8_t message[] = "G3:?H\0";
        //  lora_putd(message, 6);
        //} else if (inputString == "?B"){
        //  //Serial.println("G3:?B");
        //  uint8_t message[] = "G3:?B\0";
        //  lora_putd(message, 6);
        //} else if (inputString == "NO"){
        //  uint8_t message[] = "G3:NO\0";
        //  lora_putd(message, 6);
        //  delay(1000);
        //  flag = true;
        //}
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
      //if(buf[3] == "P" && buf[4] == "?"){
      //  flag = true;
      //}
      // uint8_t message[] = "G3:OK\0";
      // lora_putd(message, 6);
      
      
      printf("%s\n", &buf[3]);     
    }
}
