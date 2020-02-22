/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
let bodyParser = require('body-parser');
const express = require('express'),
    http = require('http'),
    cookieParser = require('cookie-parser'),
    fs = require('fs-extra'),
    shell = require('shelljs'),
    sha256 = require('js-sha256'),
    multer = require('multer'),
    request = require('request'),
    nrc = require('node-run-cmd'),
    crypto = require('crypto');
///loadig another js file
const jsFile = require('./cert.js');
let app = express();
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.use(express.static(__dirname + '/web/Login_v13')); 
app.set('views', __dirname + '/web/Login_v13');
var upload = multer(
    // dest: 'uploads/',
    // storage: multer.memoryStorage()
);
app.use(cookieParser());
var directory = path.join(process.cwd(), 'USER')

console.log('Current Directory',directory)
const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');

function makeid(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function createFolder(directory) {
    try {
        // if (!fs.existsSync(directory)) {
        //fs.mkdirSync(directory)
        fs.ensureDir(directory, err => {
            console.log(err) // => null
            // dir has now been created, including the directory it is to be placed in
        })
        console.log('Created Directory')
        // }
    } catch (err) {
        console.error(err)
    }
}
async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');


        ///Making user directory

        //////////////////////////////////////////////////
        //////////////////////////////////// putting a boundary to keep new code seperate from old code
        /////
        //   // Create application/x-www-form-urlencoded parser
        app.use(bodyParser.json());
        app.use(bodyParser.raw());
        app.use(bodyParser.text());
        app.use(bodyParser.urlencoded({ extended: false }));

        app.use(express.static('files')); //we'll put the files in the "files" folder

        // app.get('/', function (req, res) {

        //     console.log('User directory' + directory)
            
        //     res.sendFile(__dirname + '/files/' + 'index.html');
        // });
        // app.get('/UserHomePage', function (req, res) {
        //     res.sendFile(__dirname + '/files/' + 'home.html');
        // });

        //let's create a post request endpoint
        app.get('/', async(req,res)=>{
             if (req.cookies.Key == null){
                createFolder(directory)
                res.sendFile(path.join(__dirname + '/web/Login_v13/signUp.html'));
             }else{
                res.redirect('/home');
             }
        })
        app.get('/register', async(req,res)=>{
            if (req.cookies.Key == null){
               res.sendFile(path.join(__dirname + '/web/Login_v13/signUp.html'));
            }else{
               res.redirect('/login');
            }
       })
       app.get('/login', async(req,res)=>{
        if (req.cookies.Key == null){
           res.sendFile(path.join(__dirname + '/web/Login_v13/login.html'));
        }else{
            res.sendFile(path.join(__dirname + '/web/Login_v13/home.html'));
        }
   })

       app.get('/home', async(req,res)=>{
        if (req.cookies.Key == null){
           res.sendFile(path.join(__dirname + '/web/Login_v13/signUp.html'));
        }else{
           res.redirect('/showAllUserCertificate')
        }
   })
   console.log("Hello RME")
        app.post('/register', async (req, res) => {
            try {
                //console.log('User directory' + directory)
                let name = req.body.name;
                var email = req.body.email;
                let password = req.body.password;
                var folderDirectory = path.join(directory, email)
                createFolder(folderDirectory)
                // console.log(folderDirectory)
                let message = name + email;
                console.log(message);
                let signature, pubKey;
                /// calling another js file
                console.log('record added');
                let userRegister = jsFile.createCertificate(message, folderDirectory);
                console.log('record added');
                userRegister.then(function (obj) {
                    signature = obj.signature;
                    pubKey = obj.pubKey;
                    console.log('You are in userRegister function');
                    // Current Date
                    let date_ob = new Date();
                    let date = ("0" + date_ob.getDate()).slice(-2);
                    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                    let year = date_ob.getFullYear();
                    let yearnew = date_ob.getFullYear() + 1;
                    let hours = date_ob.getHours();
                    let minutes = date_ob.getMinutes();
                    let newMin = date_ob.getMinutes() + 5;
                    let seconds = date_ob.getSeconds();
                    // prints date in YYYY-MM-DD format
                    // prints date & time in YYYY-MM-DD HH:MM:SS format
                    var date1 = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
                    var date2 = yearnew + "-" + month + "-" + date + " " + hours + ":" + newMin + ":" + seconds;
                    var validityDate = "Validity from " + " " + date1 + " " + "Validity  till" + " " + date2;
                    ///////
                    //validityDate = "TKD";
                    console.log("Hello RME")
                   // let result = await contract.submitTransaction('createUser', name.toString(), email.toString(), pubKey.toString(), signature.toString(), validityDate.toString(), password.toString());
                    let promise = contract.submitTransaction('createUser', name.toString(), email.toString(), pubKey.toString(), signature.toString(), validityDate.toString(), password.toString());
                    promise.then((data) => {
                        
                        console.log(data);
                         res.cookie("Email",email)
                      //   console.log(data.Key)
                         console.log(" hello from cookie",req.cookies.Email)

                      //   console.log("Hello from user registration")
                        res.redirect('/login');

                        // let msg = {
                        //     status: 'success',
                        //     message: 'User Created'
                        // };
                        // res.setHeader('content-type', 'text/json');
                        // res.send(msg);
                    }).catch((err) => {
                        console.log(err);
                        // let msg = {
                        //     status: 'failure',
                        //     message: err.toString()
                        // };
                        // res.setHeader('content-type', 'text/json');
                        // res.send(msg);
                    });
                }, err => {
                    console.log(error);
                });
            } catch (error) {
                console.error(`Failed to evaluate transaction last: ${error}`);
                process.exit(1);
            }
        });
        app.post('/login', upload.single('myFile'), async (req, res) => {

            let privateBuf = req.file.buffer;
            // console.log("private pem file: ", req.file.buffer)
            let email = req.body.email;
            let password = req.body.password;


            console.log('Log in function app.js', email, password + '\n')
            console.log('Calling chaincode function')

            let promise = contract.evaluateTransaction('login', email, password);
            promise.then((data) => {
                let userObj = JSON.parse(data.toString());
                let pubkey = userObj.PublicKey;
                console.log('User publlic key came from Chaincode ' + pubkey)
                var userlogin = jsFile.userVerify(privateBuf, pubkey);

                userlogin.then(function (obj) {
                    // try{
                    console.log(obj)
                    var result = 'Done'
                    if (jsFile.chars(obj) === jsFile.chars(result)) {

                        res.sendFile(path.join(__dirname + '/web/Login_v13/home.html'));
                      //  res.redirect('/home')

                        // let msg = {
                        //     status: 'success',
                        //     message: 'Log in successfull'
                        // };
                        // res.setHeader('content-type', 'text/json');
                        // res.send(msg);
                    }
                    // }catch (err){
                    //     console.log(error)
                    // }
                }, err => {
                    // let msg = {
                    //     status: 'failure',
                    //     message: err.toString()
                    // };
                    // res.setHeader('content-type', 'text/json');
                    // res.send(msg);
                });
            }).catch((err) => {
                console.log(err);

                let msg = {
                    status: 'failure',
                    message: err.toString()
                };

                res.setHeader('content-type', 'text/json');
                res.send(msg);
            });

        });

        //await sleep(2)
        app.get('/showAllUserCertificate', async (req, res) => {
            // try {
            //     const result = await contract.evaluateTransaction('AllUser');
            //     var resultData = result.toString();
            //     res.send(resultData);
            //     ///res.send(html);
            // } catch (err) {
            //     next(err + 'hi');
            // }
            let promise = contract.evaluateTransaction('AllUser');
            promise.then((data) => {
                console.log(data);
                
                res.render('home.html', {
                    candidates: data.values
                });
                // let msg = {
                //     status: 'success',
                //     data: JSON.stringify(data),
                //     message: ''
                // };
                // res.setHeader('content-type', 'text/json');
                // res.send(msg);



            }).catch((err) => {
                // console.log(err);
                // let msg = {
                //     status: 'failure',
                //     message: err.toString()
                // };
                // res.setHeader('content-type', 'text/json');
                // res.send(msg);
            });

        });
        
        app.post('/endoserTransaction', async (req, res) => {


            // let endAdd = req.body.EnAddress,
                let cnAdd = req.body.recieverAddress,
                amount = req.body.amount;
           console.log(req.cookies.Email, cnAdd, amount)
            let promise = contract.submitTransaction('EndorserTransaction', req.cookies.Email, cnAdd, amount);
            promise.then((data) => {
               // console.log(data);
                //contract.submitTransaction('EndorserTransaction', req.cookies.Email , cnAdd, amount);
                let msg = {
                    status: 'success',
                    message: 'Endorser Has given money'
                };
                res.setHeader('content-type', 'text/json');
                res.send(msg);
            }).catch((err) => {
                console.log(err);
                let msg = {
                    status: 'failure',
                    message: err.toString()
                };
                res.setHeader('content-type', 'text/json');
                res.send(msg);
            });
        });
        app.post('/certificateHolderTransaction', async (req, res) => {
            let cnEmail = req.cookies.Email,
                enAdd = req.body.EnAddress,
                amount = req.body.amount;
            let promise = contract.submitTransaction('CertificateHolderTransaction', cnEmail, enAdd, amount);
            promise.then((data) => {
                console.log(data);
              //  contract.submitTransaction('EndorserTransaction', cnEmail , enAdd, amount);
                let msg = {
                    status: 'success',
                    message: 'Certificate holder Has return money'
                };
                res.setHeader('content-type', 'text/json');
                res.send(msg);
            }).catch((err) => {
                console.log(err);
                let msg = {
                    status: 'failure',
                    message: err.toString()
                };
                res.setHeader('content-type', 'text/json');
                res.send(msg);
            });
        });
        let server = app.listen(8081, function () {
            let host = server.address().address;
            let port = server.address().port;

            console.log('Example app listening at http://%s:%s', host, port);
        });

        ////////////////////////////////////
        //////////////////////////////////////////////////


    } catch (error) {
        console.error(`Failed to evaluate transaction last: ${error}`);
        process.exit(1);
    }
}

main();