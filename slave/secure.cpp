#include <Arduino.h>
#include <CRC32.h>
#include "secure.h"

void encrypt_xor(const char * missatge, char * missatgeXifrat, byte key) {
  int i = 0;
  while (missatge[i] != '\0') {
    missatgeXifrat[i] = missatge[i] ^ key;
    i++;
  }
  missatgeXifrat[i] = '\0';
}

void decrypt_xor(const char * missatgeXifrat, char * missatge, byte key) {
  encrypt_xor(missatgeXifrat, missatge, key);  // XOR és la seva inversa
}


uint32_t calcularCRC32(char * missatge, size_t llargada) {
  const uint32_t polinomio = 0xEDB88320L;
  uint32_t crc = 0xFFFFFFFF;

  for (int i = 0; i < llargada; i++) {
      crc ^= missatge[i];
      for (int j = 0; j < 8; ++j) {
          crc = (crc >> 1) ^ ((crc & 1) ? polinomio : 0);
      }
  }
  return crc ^ 0xFFFFFFFF;
}

bool verificarCRC32(const char * missatge, size_t llargada, uint32_t crcEsperat) {
    uint32_t crcCalculat = calcularCRC32(missatge, llargada);
    return crcCalculat == crcEsperat;
}

void calcularCRC(uint8_t * crc, const char * missatge, size_t llargada) {
  // Calcular el CRC del missatge
  uint32_t crc32 = calcularCRC32(missatge, llargada);

  // Copiar els bytes de crc32 a crc
  for (int i = 0; i < 4; i++) {
    crc[i] = (crc32 >> (i * 8)) & 0xFF;
  }
}

bool verificarCRC(const char * missatge, size_t llargada, const uint8_t * crc) {
  // Calcular el CRC del missatge
  uint32_t crc_calculat = calcularCRC32(missatge, llargada);

  // Copiar els bytes del crc calculat
  uint8_t crc_calculat_array[4];
  for (int i = 0; i < 4; i++) {
    crc_calculat_array[i] = (crc_calculat >> (i * 8)) & 0xFF;
  }

  // Comparar el CRC calculat amb el CRC rebut
  for (int i = 0; i < 4; i++) {
    if (crc_calculat_array[i] != crc[i]) {
      return false; // Els CRC no coincideixen
    }
  }

  return true; // El CRC és correcte
}


