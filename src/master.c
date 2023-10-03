#include <avr/interrupt.h>
#include <avr/io.h>
#include <stdint.h>
#include <stdbool.h>
#include <math.h>
#include "serial_device.h"
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

void parse_lora( uint8_t * buf, uint8_t len, uint8_t status );


void setup(){
    init_stdout();
    serial_open();
    sei();
}

int main(void){
    setup();
    while (!lora_init());
    register_lora_rx_event_callback( parse_lora );
    while(1){
        lora_event();
        if (serial_can_read()){
            uint8_t valor = serial_get();
            if (valor == '?'){
                valor = serial_get();
                if (valor == 'H'){
                    uint8_t message[] = "G3:?H\0";
                    lora_putd(message, 6);
                } else if (valor == 'B'){
                    uint8_t message[] = "G3:?B\0";
                    lora_putd(message, 6);
                }
            }             
        }   
    } 
}

void parse_lora( uint8_t * buf, uint8_t len, uint8_t status ) {
	if( status == IRQ_PAYLOAD_CRC_ERROR_MASK ) {
		return;
	}
    if (buf[0] == 'G' && buf[1] == '3' && buf[2] == ':'){
        printf("%s\n", &buf[3]);
    }
}