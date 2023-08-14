"use strict";
// import CryptoJS from 'crypto-js';
// import { generateMnemonic } from "@polkadot/util-crypto/mnemonic/bip39";
//
// const encrypt = (raw: string, secret: string) => {
//   return CryptoJS.AES.encrypt(raw, secret).toString();
// }
//
// const mlEncrypt = (raw: string, secrets: string[]) => {
//   return secrets.reduce((_raw, secret) => {
//     return encrypt(_raw, secret);
//   }, raw)
// }
//
// const decrypt = (cipher: string, secret: string) => {
//   const decrypted = CryptoJS.AES.decrypt(cipher, secret);
//   return decrypted.toString(CryptoJS.enc.Utf8);
// }
//
// const mlDecrypt = (cipher: string, secrets: string[]) => {
//   return secrets.reverse().reduce((_cipher, secret) => {
//     return decrypt(_cipher, secret);
//   }, cipher);
// }
//
// const mnemonic = generateMnemonic(12);
// const passphrase = ['trang', 'huong', 'hoa', 'nhai', 'vui', 'lam']
//
// const cipher = mlEncrypt(mnemonic, passphrase);
//
// console.log(cipher);
//
// const raw = mlDecrypt(cipher, passphrase);
// console.log(raw);
//
