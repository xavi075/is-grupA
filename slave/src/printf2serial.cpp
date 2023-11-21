// #include <avr/io.h>
#include <Arduino.h>
#include <stdio.h>

#include "printf2serial.h"

static int uart_putchar(char c, FILE *stream){
  if (c == '\n')
    uart_putchar('\r', stream);
  loop_until_bit_is_set(UCSR0A, UDRE0);
  UDR0 = c;
  return 0;
}

// static FILE mystdout = FDEV_SETUP_STREAM(uart_putchar, NULL,_FDEV_SETUP_WRITE);
static FILE mystdout = *fdevopen(uart_putchar, NULL);

void init_stdout(void){
  stdout = &mystdout;
}
