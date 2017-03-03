// requires
var fs = require ('fs');
var prompt = require('prompt');
var erisC = require('eris-contracts');
var eris = require('./eris/libs/eris-wrapper');

// NOTE. On Windows/OSX do not use localhost. find the
// url of your chain with:
// docker-machine ls
// and find the docker machine name you are using (usually default or eris).
// for example, if the URL returned by docker-machine is tcp://192.168.99.100:2376
// then your erisdbURL should be http://192.168.99.100:1337/rpc
var erisdbURL = "http://192.168.99.100:1337/rpc";

// get the abi and deployed data squared away
var contractData = require('./eris/jobs_output.json');
var idisContractAddress = contractData["deployStorageK"];
var contractContractAddress = contractData["deployContractK"];
var idisAbi = JSON.parse(fs.readFileSync("./eris/abi/" + idisContractAddress));
var contractAbi = JSON.parse(fs.readFileSync("./eris/abi/" + contractContractAddress));

// properly instantiate the contract objects manager using the erisdb URL
// and the account data (which is a temporary hack)
var accountData = require('./eris/accounts.json');
var contractsManager = erisC.newContractManagerDev(erisdbURL, accountData.simplechain_full_000);

// properly instantiate the contract objects using the abi and address
var idisContract = contractsManager.newContractFactory(idisAbi).at(idisContractAddress);
var contractContract = contractsManager.newContractFactory(contractAbi).at(contractContractAddress);

idisContract.ValueSet(
        function (error, eventSub) {
            if(error) { throw error; }
            //eventSubNew = eventSub; // ignoring this for now
        },
        function (error, event) {
            console.log('Value Set'); 
            getValue(changeValue);
        });

function createContract(callback) {
  var packageName = eris.str2hex("Perishable");
  var packageTemperature = -5;
  var contractTemperature = 0;
  var parties = [
    eris.str2hex('Producer'), 
    eris.str2hex('International-Carrier'), 
    eris.str2hex('Local-Carrier')
  ];

  var handOverParties = [
    eris.str2hex('International-Carrier'),
    eris.str2hex('Local-Carrier'),
    eris.str2hex('Local-Carrier')
  ];
  
  contractContract.createContract(
    packageName, 
    packageTemperature, 
    eris.str2hex('Producer'), 
    contractTemperature, 
    function(error, result) {
      if(error) {
        console.log(error);
      } else {
        console.log('Contract created ...');
        contractContract.addParties(parties, handOverParties, function(error, result) {
          if(error) {
            console.log(error);
          } else {
            console.log('Parties added ...');
            contractContract.startContract(function(error, result){
              console.log('Contract Started ...');
              callback();
            }); 
          }
        })
      }
    }
  );
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function trackPackage() {
  setTimeout(() => {
    var temperatureToSet = getRandomInt(-5, 0);
    contractContract.setPackageTemperature(temperatureToSet, function(error, result) {
      if(error) console.log(error);
      else {
        contractContract.getPackageTemperature(function(error, result) {
          // console.log('Temperature Set: ' + result.toNumber());
          trackPackage();
        });
      }
    });    
  }, 200);
}

function transport(callback) {
  contractContract.startTransporting(function(error, result) {
    contractContract.getCurrentOwner(function(error, result) {
      var owner = eris.hex2str(result);
      console.log('Current Owner: ' + owner);
      setTimeout(() => {
        contractContract.stopTransporting(function(error, result) {
          console.log('Transportation done ...');
          callback(owner);
        });        
      }, 5000);
    })
  });
}

var stdin = process.openStdin();

function performTransport() {
  prompt.message = "What scenario you are interested to test? handover or breach (h/b)";
  prompt.delimiter = "\t";
  prompt.start();
  prompt.get(['value'], function (error, result) {
    if (error) { throw error }
    console.log(result.value);
    if(result.value === 'h') {
      transport(function(owner) {
        contractContract.handOver(function(error, result) {
          contractContract.getCurrentOwner(function(error, result) {
            if(eris.hex2str(result) != owner) {
              performTransport();
            } else {
              contractContract.getIsBreached(function(error, breached) {
                if(error) console.log(error);
                else {
                  if(breached) {
                    console.log('Cannot handover. Contract is breached by: ' + owner);
                  }
                }
                process.exit();
              })
              
            }
          });
        });
      });
    } else {
      contractContract.setPackageTemperature(1, function(error, result) {
        contractContract.getCurrentOwner(function(error, result) {
          var owner = eris.hex2str(result);
          console.log('Breached Party: ' + owner);
          contractContract.getBreachedTemperature(function(error, result) {
            console.log('Breached Temperature: ' + result.toNumber());
            performTransport();
          });
        });
      });
    }
  });
}

function startTransport() {
  trackPackage();
  performTransport();
}

createContract(startTransport);