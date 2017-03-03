'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
var eris = require('../../eris/libs/eris-wrapper');
var erisContract = require('../../eris/eris-init');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
  parties: parties,
  party: party,
  startTransporting: startTransporting,
  stopTransporting: stopTransporting,
  handOver: handOver
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function parties(req, res) {
  res.json(['Producer', 'InternationCarrier', 'Consumer']);
}

function party(req, res) {
	var name = req.swagger.params.partyName.value || 'onlyparty';
	res.json({
      name: name,
      handOverParty: 'handOverParty',
      owner: false,
      transporting: false,
      transported: false,
      breached: false,
      breachTemperature: 0,
      handedOver: false,
      handedOverTemperature: 0
    });
}

function startTransporting(req, res) {
  var contractContract = erisContract.erisContract();
  contractContract.startTransporting(function(error, result) {
    contractContract.getCurrentOwner(function(error, result) {
      var owner = eris.hex2str(result);
      res.json({message: owner + ' started transporting'});
    })
  });
}

function stopTransporting(req, res) {
  var contractContract = erisContract.erisContract();
  contractContract.stopTransporting(function(error, result) {
    contractContract.getCurrentOwner(function(error, result) {
      var owner = eris.hex2str(result);
      res.json({message: owner + ' stopped transporting'});
    })
  });
}

function handOver(req, res) {
  var contractContract = erisContract.erisContract();
  contractContract.handOver(function(error, result) {
    contractContract.getIsBreached(function(error, breached) {
      contractContract.getCurrentOwner(function(error, ownerHex) {
        var owner = eris.hex2str(ownerHex);
        if(error) console.log(error);
        else {
          if(breached) {
            res.json({message: 'Contract breached by ' + owner});
          } else {
            res.json({message: 'No more party left to hand over. Current owner ' + owner});
          }
        }  
      });
    });
  });
}