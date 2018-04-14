/**
 * Adds support for TangoJS based component
 *
 * Prototype that mixes this in should expose following functions:
 * - createProxy  {function(model: string): (AttributeProxy|DeviceProxy)}
 *
 * Following functions and properties are added:
 * - proxy {Object}
 * - model {String}
 * - info {Object}
 * - onModelChange {function(model: string): undefined}
 */
withTango = Polymer.dedupingMixin(base => {
  
  // Note that this scope is executed exactly once! Do not try to put hidden variables here.
  class extends base {
    constructor() {
      super();
    }

    static get properties() {
      return {
	proxy: {
          type: Object,
	  readOnly: true,
	  observer: 'proxyChanged'
        },
	model: {
	  type: String,
	  observer: 'onModelChange'
	},
	info: {
          type: Object,
	  readOnly: true,
	  observer: 'infoChanged'
        }
      };
    }

    onModelChange(model, oldValue) {
      if (model) {
	console.log('model changed '+model)
        this._setProxy(
	  (Array.isArray(model) ? model : [model])
            .reduce((p, m) => (p[m] = this.createProxy(m), p), {})
	)
      } else {
        this._setProxy(null)
      }
    }

  }
}
