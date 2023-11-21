#ifndef _TMR2_
#define _TMR2_

#include <stdint.h>

void setup_tmr2(uint8_t ocr2a,uint16_t tmr2_pre);
//tmr2_pre 1,default=8,32,64,128,256,1024
//TMR2=prescaler*(ocr2a+1)*T_clk

void tmr2_set(uint16_t tmr2_pre);
#endif
