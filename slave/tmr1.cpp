#include "tmr1.h"
// #include <avr/io.h>
// #include <avr/interrupt.h>
#include <Arduino.h>
#include <stdio.h>
#include "printf2serial.h"


static uint16_t n_segons;
static volatile uint16_t n_segons_restant;
static volatile uint16_t tick;
static volatile tmr0_callback_t callback;

ISR(TIMER0_COMPA_vect) {
    tick--;
    if (tick == 0) {
        n_segons_restant--;
        tick = 500;
        if (n_segons_restant == 0){ //s'arriba al nombre de segons desitjat
            n_segons_restant = n_segons;
            callback();
        }
    }
}

void setup_tmr0(uint16_t time, tmr0_callback_t f) {
    if (time > 65535) {
        time = 65535;
    }
    n_segons = time;
    n_segons_restant = n_segons;
    tick = 500; //Cada interrupció succeix cada 2 ms, per tant, necessitem 500 per obtenir 1 segon
    callback = f;
    // Configurar Timer0 per generar una interrupció cada 2 milisegons
    TCCR0A = _BV(WGM01);
    TCCR0B = _BV(CS01) | _BV(CS00); // mode CTC i prescaler 64
    OCR0A = 248; 
    TIMSK0 = _BV(OCIE0A); 
}

void stop_tmr0() {
    // Parar el timer
    TCCR0B = 0; // mode CTC i prescaler 64
}