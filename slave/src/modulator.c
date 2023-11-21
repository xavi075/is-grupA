#include <avr/io.h>
#include <stdbool.h>
#include "gpio_device.h"

pin_t ENTRADA_SENSOR;

void modulator_init(void){
    ENTRADA_SENSOR = pin_bind(&PORTD, 6, Output);
    TCCR0A = _BV(COM0A0) | _BV(WGM01);
    TCCR0B = _BV(CS00);
    OCR0A = 3; /* OCR1A = Fclk/(2*N*f)-1 = 16*10^6/(2*1*2*10^6)-1 = 3 */

}

void modulator_set(bool l){
    if(l){
        TCCR0B |= _BV(CS00);
        TCCR0A |= _BV(COM0A0);
        pin_w(ENTRADA_SENSOR, true);
    } else {
        TCCR0B &= ~_BV(CS00);
        TCCR0A &= ~_BV(COM0A0);
        pin_w(ENTRADA_SENSOR, false);
    }
}

