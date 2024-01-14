#ifndef _TMR1_
#define _TMR1_
#include <stdint.h>
/*Si el valor de time és major a 65535 (valor màxim de un unsigned int de 16 bits), 
automàticament es modificarà el seu valor pel valor màxim permès (65535)*/
typedef void (*tmr0_callback_t)(void);
void setup_tmr0(uint16_t time, tmr0_callback_t f);
void stop_tmr0(void);
#endif