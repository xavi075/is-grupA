// #include <avr/io.h>
#include "gpio_device.h"
#include <stdint.h>

pin_t pin_bind(volatile uint8_t *port, uint8_t pin, pin_direction_t d) {
    pin_t pin_aux;
    volatile uint8_t *ddr;

    pin_aux.port = port;
    ddr = pin_aux.port - 1;
    pin_aux.pin_mask = pin;

    if (d == Input) {
        *ddr &= ~_BV(pin_aux.pin_mask);
        *port |= _BV(pin);
    }
    else if (d == InputNP) {
        *ddr &= ~_BV(pin_aux.pin_mask);
        *port &= _BV(pin);
    }
    else {
        *ddr |= _BV(pin_aux.pin_mask);
    }
    return pin_aux;
}

void pin_w(pin_t p, bool v) {
    if (v)
        *p.port |= _BV(p.pin_mask);
    else 
        *p.port &= ~_BV(p.pin_mask); 
}

bool pin_r(pin_t p) {
    volatile uint8_t *pin;
    pin = p.port - 2;

    return (*pin & _BV(p.pin_mask));
    
}

void pin_toggle(pin_t p) {
    *(p.port) ^= _BV(p.pin_mask);
}

void pin_unbind(pin_t *const p) {
    
}