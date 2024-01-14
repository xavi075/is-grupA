// #include <avr/io.h>
// #include <stdbool.h>
#include <Arduino.h>

// pin_t ENTRADA_SENSOR;

void modulator_init(void){
    // ENTRADA_SENSOR = pin_bind(&PORTB, 1, Output);
    pinMode(9, OUTPUT);
    // TCCR0A = _BV(COM0A0) | _BV(WGM01);
    TCCR1A = _BV(COM1A0);
    TCCR1B = _BV(CS10) | _BV(WGM12); //No prescaler
    // OCR0A = 1; /* OCR1A = Fclk/(2*Preescaler*f)-1 = 8*10^6/(2*1*2*10^6)-1 = 1 */
    OCR1A = 7;
}
 
void modulator_set(bool l){
    if(l){
        TCCR1B |= _BV(CS10);
        TCCR1A |= _BV(COM1A0);
        // pin_w(ENTRADA_SENSOR, true);
        digitalWrite(9, HIGH);

    } else {
        TCCR1B &= ~_BV(CS10);
        TCCR1A &= ~_BV(COM1A0);
        // pin_w(ENTRADA_SENSOR, false);
        digitalWrite(9, LOW);
    }
}

