#include "modulator.h"
#include <avr/interrupt.h>
#include <avr/io.h>//it includes <avr/sfr_defs.h>, <avr/portpins.h>, <avr/common.h>, <avr/version.h>
#include <stdint.h>
#include <stdbool.h>
#include <math.h>
#include "serial_device.h"
#include "adc.h"
#include "tmr2.h"
#include "tmr1.h"
#include "utils.h"
#include <stdio.h>
#include "printf2serial.h"
#include <avr/sleep.h>
#include <util/delay.h>
#include <avr/wdt.h>
#include <string.h>
#include "lora.h"
#include "lora_mem.h"
#include "gpio_device.h"

#define N 128
#define TEMPS 5


volatile uint8_t value;
static volatile float avg = 0;
static volatile float avg_percent = 0;
static uint8_t avg_str[10];
volatile uint16_t i;
volatile bool flag = false;
volatile uint8_t n = N-1;

uint8_t llindar_min = 50;
uint8_t llindar_max = 75; 

pin_t REGAR;

typedef enum {regant, parat} estat_reg_t;
estat_reg_t estat_reg = parat;

void floatToList(float num, uint8_t list[10]);
void parse_lora( uint8_t * buf, uint8_t len, uint8_t status );
void activa_lectura(void);
void envia(void);

void setup(){
    // adc
    setup_ADC(1,5,16);//(adc_input,v_ref,adc_pre)
    //adc_input (0-5 (default=5),8 Tª, 14 1.1V, 15 GND 
    //v_ref 0 (AREF), 1(1.1V), default=5 (5V)
    //adc_pre 2,4,8,16(default),32,64,128
    start_ADC();//actual value will be read next sampling time

    // tmr2 frequència de 4kHz
    setup_tmr2(249,8);//(ocr2a, tmr2_pre)
    //tmr2_pre 1,default=8,32,64,128,256,1024
    //TMR2=prescaler*(ocr2a+1)*T_clk

    init_stdout();
    serial_open();

    modulator_init();
    
    setup_tmr1(TEMPS, activa_lectura);

    REGAR = pin_bind(&PORTD, 6, Output);

    sei();
}

void floatToList(float num, uint8_t list[10]) {
    char str[7];
    sprintf(str, "%.2f", num);
    int i;
    list[0] = 'G';
    list[1] = '3';
    list[2] = ':';
    for (i = 0; i < 7; i++) {
        if (i < strlen(str)) {
            list[i+3] = str[i];
        } else {
            list[i+3] = '\0';
        }
    }
}

void activa_lectura(void){
    tmr2_set(8);
    modulator_set(true);
}

void envia_humitat(void){
    printf("%s\n", avg_str);
    lora_putd(avg_str, 10);
}

void envia_estat_bomba(void){
    if (estat_reg == regant) {
        uint8_t message[] = "G3:BOMBA ON\0";
        printf("%s\n", message);
        lora_putd(message, 12);
    }
    else if (estat_reg == parat) {
        uint8_t message[] = "G3:BOMBA OFF\0";
        printf("%s\n", message);
        lora_putd(message, 13);
    }
}


int main(void){
    while (!lora_init());
    setup();
    modulator_set(true);
    register_lora_rx_event_callback( parse_lora );
    while(1){
        lora_event();
        if(flag){
            tmr2_set(0);
            modulator_set(false);
            avg_percent = ((235-avg_percent)/65)*100;
            floatToList(avg_percent, avg_str);
            envia_humitat();
            if (estat_reg == parat && avg_percent < llindar_min) {
                pin_w(REGAR, true);
                estat_reg = regant;
                envia_estat_bomba();
            }
            else if (estat_reg == regant && avg_percent > llindar_max) {
                pin_w(REGAR, false);
                estat_reg = parat;
                envia_estat_bomba();
            }
            flag = false; 
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
	if( status == IRQ_PAYLOAD_CRC_ERROR_MASK ) {
		return;
	}
    if (buf[0] == 'G' && buf[1] == '3' && buf[2] == ':'){
        if(buf[3] == '?' && buf[4] == 'H'){
            envia_humitat();
        } else if (buf[3] == '?' && buf[4] == 'B'){
            envia_estat_bomba();
        }
    }
}