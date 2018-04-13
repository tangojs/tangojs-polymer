import withTango from './withTango'
/**
 * Adds support for TangoJS Commmand.
 *
 *
 * Prototype that mixes does not need to implement any function.
 *
 * Extra function and properties you can bind with:
 *   - result: result of the last execution
 *   - name: name of the command
 *   - execute: feature to bind with an event
 */
withTangoCommand = Polymer.dedupingMixin(base => {
  
  // Note that this scope is executed exactly once! Do not try to put hidden variables here.
  class extends withTango(base) {
    constructor() {
      super();
    }

    static get properties() {
      return {
	arguments: {
	  type: String,
	},
      };
    }

    createProxy(model) {
      const [_, devname, name] = model.match(/^(.+)\/([A-Za-z0-9_]+)$/)
      console.log('creating a proxy')
      return new tangojs.core.api.CommandProxy(devname, name)
    }

    proxyChanged(proxy){
      this.proxy[this.model].get_info().then(i => this._setInfo(i))
    }

    infoChanged(info) { 
      this.name = info.cmd_name
    }

    execute(event){
      const devDataIn = new tangojs.core.api.DeviceData(this.arguments)
      console.log('command proxy:'+this.proxy)
      this.proxy[this.model].inout(devDataIn).then(devDataOut => {
        this.result = devDataOut
	// What to do else?
	//this.dispatchEvent(new CommandButtonResultEvent(devDataOut))
      })
    }	    

  }
}

