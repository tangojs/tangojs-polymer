import withTango from "./withTango"
/**
 * Adds support for TangoJS Device
 *
 * Prototype that mixes does not need to implement any function.
 *
 */
withTangoAttribute = Polymer.dedupingMixin(base => {
  
  // Note that this scope is executed exactly once! Do not try to put hidden variables here.
  class extends withTango(base) {
    constructor() {
      super();
    }

    createProxy(model) {
      console.log('creating a proxy')
      const proxy =  new tangojs.core.api.DeviceProxy(model)
      // update the info
      // Probably to refactor
      proxy.get_info().then(i => this._setInfo(i))
      return proxy
    }
  }
}
