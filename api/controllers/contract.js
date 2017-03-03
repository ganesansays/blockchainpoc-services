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
  contracts: contracts,
  contract: contract,
  startContract: startContract  
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function contracts(req, res) {
  res.json(['onlycontract']);
}

function contract(req, res) {
	var name = req.swagger.params.contractName.value || 'onlycontract';
	res.json({contractName: name, contractTemperature: 0});
}

function startContract(req, res) {
	var name = req.body.contractName.value || 'onlycontract';
	var contractTemperature = req.body.contractTemperature.value || 0;
	var packageName = eris.str2hex("Perishable");
  var packageTemperature = -5;

  var parties = [
    eris.str2hex('Producer'), 
    eris.str2hex('InternationalCarrier'), 
    eris.str2hex('LocalCarrier')
  ];

  var handOverParties = [
    eris.str2hex('InternationalCarrier'),
    eris.str2hex('LocalCarrier'),
    eris.str2hex('LocalCarrier')
  ];
  
	var contractContract = erisContract.erisContract();

	contractContract.createContract(
    packageName, 
    packageTemperature, 
    eris.str2hex('Producer'), 
    contractTemperature, 
    function(error, result) {
      if(error) {
        console.log(error);
				res.json({message: 'Error occured starting contract'});
      } else {
        console.log('Contract created ...');
        contractContract.addParties(parties, handOverParties, function(error, result) {
          if(error) {
            console.log(error);
						res.json({message: 'Error occured starting contract'});
          } else {
            console.log('Parties added ...');
            contractContract.startContract(function(error, result){
              if(error) {
								console.log(error);
								res.json({message: 'Error occured starting contract'});
							}
							console.log('Contract Started ...');
							res.json({message: name + ' contract started!'});
            }); 
          }
        });
      }
    }
  );
}