#!/bin/bash
cd .. 
cd ../first-network/

./byfn.sh down

cd ../fabcar

docker rm -f $(docker ps -aq)

docker rmi -f $(docker images | grep fabcar | awk '{print $3}')
./startFabric.sh
cd javascript
rm -rf wallet
cd USER
rm -rf *
cd ..
node enrollAdmin.js && node registerUser.js && nodemon app.js

