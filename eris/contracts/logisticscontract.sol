contract LogisticsContract {
  struct Package {
    bytes32 name;
    int temperature;
  }

  struct Party {
    bytes32 name;
    bytes32 handOverParty;
    bool owner;
    bool transporting;
    bool transported;
    bool breached;
    int breachTemperature;
    bool handedOver;
    int handedOverTemperature;
  }

  Package package;
  mapping(bytes32 => Party) parties;

  bytes32 contractOwner;
  int contractTemperature;
  Party currentParty;

  function createContract(
    bytes32 _packageName, 
    int _packageTemperature, 
    bytes32 _contractOwner, 
    int _contractTemperature) 
  {
    package.name = _packageName;
    package.temperature = _packageTemperature;
    contractOwner = _contractOwner;
    contractTemperature = _contractTemperature;
  }

  function addParties(bytes32[] _parties, bytes32[] _handOverParties) {
    for(uint i = 0; i < _parties.length; i++) {
      addParty(_parties[i], _handOverParties[i]);
    }
  }

  function addParty(bytes32 _name, bytes32 _handOverParty) {
    parties[_name] = Party( {
      name: _name,
      handOverParty: _handOverParty,
      owner: false,
      transporting: false,
      transported: false,
      breached: false,
      breachTemperature: 0,
      handedOver: false,
      handedOverTemperature: 0
    });
  }

  function startContract() {
    currentParty = parties[contractOwner];
  }

  function startTransporting() {
    if(!currentParty.breached && !currentParty.transported) currentParty.transporting = true;
  }

  function stopTransporting() {
    if(currentParty.transporting) {
      currentParty.transporting = false;
      currentParty.transported = true;
    }
  }

  function handOver() {
    if (!currentParty.breached && currentParty.transported) {
      currentParty.handedOver = true;
      currentParty.handedOverTemperature = package.temperature;
      currentParty = parties[currentParty.handOverParty];
    }
  }

  function setPackageTemperature(int _temperature) {
    package.temperature = _temperature;
    if(package.temperature > contractTemperature) {
      currentParty.breached = true;
      currentParty.breachTemperature = package.temperature;
      currentParty.transporting = false;
    }
  }

  function getCurrentOwner() constant returns (bytes32 owner) {
    return currentParty.name;
  }

  function getPackageTemperature() constant returns (int temperature) {
    return package.temperature;
  }

  function getIsBreached() constant returns (bool breached) {
    return currentParty.breached;
  }

  function getBreachedTemperature() constant returns (int temperature) {
    return currentParty.breachTemperature;
  }
}