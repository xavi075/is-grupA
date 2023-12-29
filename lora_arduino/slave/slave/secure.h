#ifndef _SECURE_
#define _SECURE_

void encrypt_xor(const char * missatge, char * missatgeXifrat, byte key) ;

void decrypt_xor(const char * missatgeXifrat, char * missatge, byte key) ;

void calcularCRC(uint8_t * crc, const char * missatge, size_t llargada) ;

bool verificarCRC(const char * missatge, size_t llargada, const uint8_t * crc) ;

#endif