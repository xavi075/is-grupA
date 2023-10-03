# generic flags
CC=avr-gcc
CPPFLAGS=-DF_CPU=16000000UL
CFLAGS=-Wall -std=c99 -Ofast -mmcu=atmega328p -fshort-enums 
LDFLAGS=-std=c99 -mmcu=atmega328p

CPRINTFLAGS=-Wl,-u,vfprintf
LDPRINTFLAGS=-lprintf_flt -lm

# joining flags
FLAGS=$(CFLAGS) $(CPPFLAGS) $(LDFLAGS) $(CPRINTFLAGS) $(LDPRINTFLAGS)

# target device
DEVICE=/dev/ttyACM0
DEVICE_1=/dev/ttyACM1

# sources
SRC_c:= adc.c gpio_device.c lora.c modulator.c printf2serial.c serial_device.c spi.c tmr1.c tmr2.c
SRC:=$(wildcard *.h) $(SRC_c)
SRC+=Makefile

SRC_c_master:= $(SRC_c) master.c
SRC_c_slave:= $(SRC_c) slave.c

# directives
.PHONY : all load_% picocom veryclean clean touch 

master: master.c
	$(CC) $(FLAGS) $(SRC_c_master) -o master
	avr-objcopy -Oihex master master.hex

implanta_master:
	avrdude -c arduino -p atmega328p -P $(DEVICE) -U master.hex
	picocom -b 115200 -r -l $(DEVICE)

slave: slave.c
	$(CC) $(FLAGS) $(SRC_c_slave) -o slave
	avr-objcopy -Oihex slave slave.hex

implanta_slave:
	avrdude -c arduino -p atmega328p -P $(DEVICE) -U slave.hex
	picocom -b 115200 -r -l $(DEVICE)

tmr1: $(SRC)
	$(CC) $(FLAGS) $(SRC_c) -o tmr1
	avr-objcopy -Oihex tmr1 tmr1.hex
	avrdude -c arduino -p atmega328p -P $(DEVICE) -U tmr1.hex

tmr2: $(SRC)
	$(CC) $(FLAGS) $(SRC_c) -o tmr2
	avr-objcopy -Oihex tmr2 tmr2.hex
	avrdude -c arduino -p atmega328p -P $(DEVICE) -U tmr2.hex

all: load_main size clean

%.s: %.c
	$(CC) $(CFLAGS) -S $<



%.hex: %
	avr-objcopy -Oihex $< $@

load_%: %.hex
	avrdude -c arduino -p atmega328p -P $(DEVICE) -U $<

clean:
	rm -f *~ *.hex *.s *.o master slave

picocom:
	picocom -b115200 $(DEVICE)

size: sender
	avr-size -C --mcu=atmega328p sender

touch:
	touch $(SRC)

veryclean: clean
	rm -f README.tex README.pdf README.ics README.html
