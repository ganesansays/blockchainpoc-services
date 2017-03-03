'use strict';

// requires
var fs = require ('fs');
var prompt = require('prompt');
var erisC = require('eris-contracts');
var eris = require('./libs/eris-wrapper');

(function () {
  var contractContract;
  function init() {
    // NOTE. On Windows/OSX do not use localhost. find the
    // url of your chain with:
    // docker-machine ls
    // and find the docker machine name you are using (usually default or eris).
    // for example, if the URL returned by docker-machine is tcp://192.168.99.100:2376
    // then your erisdbURL should be http://192.168.99.100:1337/rpc
    var erisdbURL = "http://192.168.99.100:1337/rpc";

    // get the abi and deployed data squared away
    var contractData = require('./jobs_output.json');
    var idisContractAddress = contractData["deployStorageK"];
    var contractContractAddress = contractData["deployContractK"];
    
    //Path looks strange. '.' referres to project base dir.
    var idisAbi = JSON.parse(fs.readFileSync("./eris/abi/" + idisContractAddress));
    var contractAbi = JSON.parse(fs.readFileSync("./eris/abi/" + contractContractAddress));

    // properly instantiate the contract objects manager using the erisdb URL
    // and the account data (which is a temporary hack)
    var accountData = require('./accounts.json');
    var contractsManager = erisC.newContractManagerDev(erisdbURL, accountData.simplechain_full_000);

    // properly instantiate the contract objects using the abi and address
    var idisContract = contractsManager.newContractFactory(idisAbi).at(idisContractAddress);
    contractContract  = contractsManager.newContractFactory(contractAbi).at(contractContractAddress);
  }

  function erisContract() {
    console.log('Contract: ' + contractContract);
    return contractContract;
  }

  module.exports = {
      'erisContract': erisContract,
      'init': init
  };
}());