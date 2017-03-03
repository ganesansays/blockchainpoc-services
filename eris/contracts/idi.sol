contract IdisContractsFTW {
  uint storedData;

  event ValueSet();

  function set(uint x) {
    storedData = x;
    ValueSet();
  }

  function get() constant returns (uint retVal) {
    return storedData;
  }
}