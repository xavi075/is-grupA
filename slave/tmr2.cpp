// #include <avr/io.h>//it includes <avr/sfr_defs.h>, <avr/portpins.h>, <avr/common.h>, <avr/version.h>
// #include "Arduino.h"
#include "tmr2.h"
// 249 8
void setup_tmr2(uint8_t ocr2a,uint16_t tmr2_pre){
  TCCR2A = _BV(WGM21);//CTC mode: TOP=OCRA 
  TIMSK2= _BV(OCIE2A);//Bit 1 – OCIE2A: Timer/Counter2 Output Compare Match A Interrupt Enable
  OCR2A=ocr2a;//TOP value

  tmr2_set(tmr2_pre);
}

void tmr2_set(uint16_t tmr2_pre){
  //tmr2_pre 1,default=8,32,64,128,256,1024
  //TMR2=prescaler*(ocr2a+1)*T_clk
  switch (tmr2_pre){
  case 0: TCCR2B=0;break; // per parar el timer
  case 1:TCCR2B=1;break;
  case 8:TCCR2B=2;break;
  case 32:TCCR2B=3;break;
  case 64:TCCR2B=4;break;
  case 128:TCCR2B=5;break;
  case 256:TCCR2B=6;break;
  case 1024:TCCR2B=7;break;
  default:TCCR2B=2;break;
  }
}
