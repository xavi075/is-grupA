#include "tmr1.h"
#include <avr/io.h>
#include <avr/interrupt.h>
#include <stdio.h>
#include "printf2serial.h"


static uint16_t a;
static volatile uint16_t tick;
static volatile tmr1_callback_t callback;

ISR(TIMER1_COMPA_vect) {
    tick--;
    if (tick == 0) {
        callback();
        tick = a;
    }   
}

void setup_tmr1(uint16_t time, tmr1_callback_t f) {
    if (time > 65535) {
        time = 65535;
    }
    a = time;        
    tick = a;
    callback = f;
    // Configurar Timer1 per generar una interrupció cada 1 segon
    TCCR1A = 0;
    TCCR1B = _BV(WGM12) | _BV(CS12) | _BV(CS10); // mode CTC i prescaler 1024
    OCR1A = 15624; 
    TIMSK1 = _BV(OCIE1A); 
}
