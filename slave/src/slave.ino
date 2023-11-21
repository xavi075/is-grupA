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
#include "adc.h"
#include "tmr2.h"
#include "tmr1.h"
#include "utils.h"
#include <stdio.h>
#include "printf2serial.h"
// #include <avr/sleep.h>
#include <util/delay.h>
// #include <avr/wdt.h>
#include <string.h>
#include "gpio_device.h"

#include <OneWire.h>
#include <DallasTemperature.h>

#define N 128
#define TEMPS 10


volatile uint8_t value;
// uint8_t temperatura;

const int pin_temperatura = 14;
OneWire oneWire(pin_temperatura);
DallasTemperature sensors(&oneWire);

static volatile float avg = 0;
static volatile float avg_percent = 0;
static uint8_t avg_str[10];
volatile uint16_t i;
volatile bool flag = false;
volatile uint8_t n = N-1;

// uint8_t llindar_min = 50;
// uint8_t llindar_max = 75; 

// pin_t REGAR;
// pin_t LED_R; 

// typedef enum {regant, parat} estat_reg_t;
// estat_reg_t estat_reg = parat;

void floatToList(float hum, float temp, uint8_t list[20]);
void parse_lora( uint8_t * buf, uint8_t len, uint8_t status );
void activa_lectura(void);
void envia(void);
void envia_resposta(void);
void envia_temperatura(void);


void setup(){
  // pin_t REGAR;
  // pin_t LED_R;
  Serial.begin(9600);
  // adc
  // bona
  setup_ADC(1,5,16);//(adc_input,v_ref,adc_pre)


  //adc_input (0-5 (default=5),8 Tª, 14 1.1V, 15 GND 
  //v_ref 0 (AREF), 1(1.1V), default=5 (5V)
  //adc_pre 2,4,8,16(default),32,64,128

  // bona
  start_ADC();//actual value will be read next sampling time

  // tmr2 frequència de 8kHz

// bona
  setup_tmr2(124,8);//(ocr2a, tmr2_pre)


  //tmr2_pre 1,default=8,32,64,128,256,1024
  //TMR2=prescaler*(ocr2a+1)*T_clk

  modulator_init();
  
  setup_tmr0(TEMPS, activa_lectura);

  // REGAR = pin_bind(&PORTD, 6, Output);
  // LED_R = pin_bind(&PORTD, 4, Output);
  pinMode(4, OUTPUT); //LED Blau

  Serial.println("Start lora init");
  while (!lora_init());
  Serial.println("Lora init passed");

  sensors.begin();


  sei();
}

void floatToList(float hum, float temp, uint8_t list[20]) {
    char str_hum[7];
    char str_temp[6];
    dtostrf(hum, 3, 2, str_hum);
    dtostrf(temp, 3, 1, str_temp);
    int i;
    int j;
    list[0] = 'G';
    list[1] = '3';
    list[2] = ':';
    for (i = 0; i < 7; i++) {
        if (i < strlen(str_hum)) {
            list[i+3] = str_hum[i];
        } else {
            list[i+3] = '/';
            break;
        }
    }
    for (j = 0; j < 6; j++) {
        if (j < strlen(str_temp)) {
            list[j+i+4] = str_temp[j];
        } else {
            list[j+i+4] = '\0';
        }
    }
}

void activa_lectura(void){
    tmr2_set(8);
    modulator_set(true);
}

void envia(void){
  // pinMode(18, OUTPUT); //LED Blau
  lora_putd(avg_str, 20);
}

void envia_resposta(void){
  pinMode(18, OUTPUT); //LED Blau
  lora_putd(avg_str, 20);
}

void envia_temperatura(void){
    Serial.println("Prova");
}

// void envia_estat_bomba(void){
//     if (estat_reg == regant) {
//         uint8_t message[] = "G3:BOMBA ON\0";
//         printf("%s\n", message);
//         // lora_putd(message, 12);
//     }
//     else if (estat_reg == parat) {
//         uint8_t message[] = "G3:BOMBA OFF\0";
//         printf("%s\n", message);
//         // lora_putd(message, 13);
//     }
// }


void loop(void){
    register_lora_rx_event_callback( parse_lora );
    // register_lora_rx_event_callback( envia_temperatura );
    while(1){
        lora_event();
        if(flag){
          tmr2_set(0);
          modulator_set(false);
          avg_percent = ((240-avg_percent)/115)*100;
          // floatToList(avg_percent, avg_str);
          // envia_humitat();
          sensors.requestTemperatures();  // Solicitar la temperatura al sensor
          float temperatura = sensors.getTempCByIndex(0);  // Obtener la temperatura en grados Celsius
          // if (temperatura == DEVICE_DISCONNECTED_C) {
          //   Serial.print("Error Temperatura");
          // } else {
          floatToList(avg_percent, temperatura, avg_str);
          // Serial.println("Bloqueig");
          envia();
          // }
        //     // if (estat_reg == parat && avg_percent < llindar_min) {
        //     //     pin_w(REGAR, true);
        //     //     estat_reg = regant;
        //     //     // envia_estat_bomba();
        //     // }
        //     // else if (estat_reg == regant && avg_percent > llindar_max) {
        //     //     pin_w(REGAR, false);
        //     //     estat_reg = parat;
        //     //     // envia_estat_bomba();
        //     // }
          flag = false;
          // activa_lectura();
        } 
 }      
}


ISR(TIMER2_COMPA_vect){
    value=read8_ADC();
    start_ADC();
    n--;
    i += value;
    if (n == 0){
        avg = i/N;
        flag = true;
        avg_percent = avg;
        n = N;
        i = 0;
    }
}   


void parse_lora( uint8_t * buf, uint8_t len, uint8_t status ) {
  // Serial.println("Re parcero bro");
	// if( status == IRQ_PAYLOAD_CRC_ERROR_MASK ) {
	// 	return;
	// }
    if (buf[0] == 'G' && buf[1] == '3' && buf[2] == ':'){
        if(buf[3] == '?' && buf[4] == 'H'){
          // Serial.println("Recepció petició d'humitat");
          envia_resposta();
        } else if (buf[3] == '?' && buf[4] == 'B'){
            // envia_estat_bomba();
            // Serial.println("Recepció petició d'estat bomba");
            // envia();
        }
    }
}