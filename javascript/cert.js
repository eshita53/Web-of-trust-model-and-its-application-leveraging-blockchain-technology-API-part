/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
'use strict';

module.exports = {};
const nrc = require('node-run-cmd'),
  fs = require('fs');
var path = require('path');
var fc = require('filecompare');
function chars(str) {
  let s = '';
  for (let i = 0; i < str.length; i++) {
    if ((str[i] >= 'a' && str[i] <= 'z') || (str[i] >= 'A' && str[i] <= 'Z')) {
      s += str[i];
    }
  }
  return s;
}
var dir = process.cwd()
console.log(dir)

let createCertificate = function (message, folderPath) {
  // function createCertificate(message) {
  let promise = new Promise(function (resolve, reject) {

    console.log(process.cwd())
    process.chdir(folderPath)
     console.log(process.cwd())
    fs.writeFileSync('inputFile.txt', message);

    nrc.run([
      'openssl ecparam -genkey -name prime256v1 -noout -out private.pem',
      'openssl ec -in private.pem -pubout -out public.pem',
    ]).then((data) => {
      return nrc.run([
        'openssl dgst -sha256 -sign private.pem -out inputFile.txt.sha256 inputFile.txt',
        //'openssl dgst -sha256 -verify public.pem -signature input.txt.sha256.txt input.txt'
      ]);
    }).then((data) => {
      let signature, pubKey;
      let base64data;
      let VERIFY_DATA = '';

      let check = async (verify) => {
        if (chars(verify) == chars('Verified OK')) {
          try {
            signature = fs.readFileSync('inputFile.txt.sha256');
            base64data = signature.toString('base64');
            // bas= base64.b64encode(sig)
            //= btoa(encodedString);
            pubKey = fs.readFileSync('public.pem', 'utf8');
            console.log('Hello from certificate function');
            // console.log(pubKey)

            let returnObj = {};
            returnObj.signature = base64data;
            returnObj.pubKey = pubKey;


            resolve(returnObj);

          } catch (e) {
            reject(e.stack);
          }
        }
        else {
          reject('output does not match');
        }
      };

      async function onDataHandler(data) {
        VERIFY_DATA += data;
      }

      nrc.run('openssl dgst -sha256 -verify public.pem -signature inputFile.txt.sha256 inputFile.txt', { onData: onDataHandler })
        .then((data) => {
          resolve(check(VERIFY_DATA));
        });
    });
  });
  return promise;
};


// let userPromise = createCertificate('Manha');
// userPromise.then(function (obj) {
//   console.log(obj.signature + '\n\n' + obj.pubKey);
// }).catch((err) => {
//   console.log('Error: ' + err);
// });


////new function 
let userVerify = function (privateBuf, pubKey) {
  // function createCertificate(message) {
  // console.log(privateBuf + 'asche private key ')
  process.chdir(dir)
  console.log('asche public key' + pubKey)
  let promise = new Promise(function (resolve, reject) {
    fs.writeFileSync('privateKey2.pem', privateBuf);
    nrc.run([
      'openssl ec -in privateKey2.pem -pubout -out publicKey2.pem'
    ]).then((code) => {
      var readPubKey = fs.readFileSync('publicKey2.pem')
      console.log('new banano public key' + readPubKey)

      // console.log(pubKey);
      // console.log('---------------------');
      // console.log(readPubKey);

      if (readPubKey.toString() === pubKey.toString()) {
        try {
           fs.unlinkSync('privateKey2.pem');
           fs.unlinkSync('publicKey2.pem');
          var sendData = 'Done'
          console.log("inside userverify :", sendData)
          resolve(sendData)
        } catch (e) {
          reject(e.stack);
        }
      } else {
        console.log('output does not match');

        reject('output does not match');
      }

    });
  });
  return promise;
};


module.exports.createCertificate = createCertificate;
module.exports.userVerify = userVerify;
module.exports.chars = chars;


// let userPromise = userVerify('Manha');
// userPromise.then(function (obj) {
//   console.log(obj.signature + '\n\n' + obj.pubKey);
// }).catch((err) => {
//   console.log('Error: ' + err);
// });

// var readPrivKey = fs.readFileSync('private.pem')
// var readPubKey = fs.readFileSync('public.pem')

// let userPromise = userVerify(readPrivKey, readPubKey);
// userPromise.then(function (obj) {
//     console.log(obj);
// }).catch((err) => {
//     console.log('Error: ' + err);
// });