import withTango from "./withTango"
/**
 * Adds support for TangoJS Attribute.
 *
 *
 * A timer will periodically polled the Attribute.i
 * No event system supported yet.
 * Prototype that mixes does not need to implement any function.
 *
 * Extra properties you can bind with:
 *   - value: value of the TangoJS Attribute
 *   - unit: Unit of the TangoJS Attribute
 *   - setPoint: last set point
 *   - writable: True if the atriibute can be set 
 *   - qualityColor:  Quality factor of the current attribute
 *   - InputType: indicate which component is suitable for setting the value
 */
withTangoAttribute = Polymer.dedupingMixin(base => {
  
  // Note that this scope is executed exactly once! Do not try to put hidden variables here.
  class extends withTango(base) {
    constructor() {
      super();

      const timer = Symbol.for('timer')
      
    }

    static get properties() {
      return {
	pollPeriod: {
	  type: Number,
	  value: 1000,
	  observer: 'onPollPeriodChange'
	},
        showQuality: {
          type: 'boolean',
          observer: 'showQualityChanged'
        },
        showName: {
          type: 'boolean',
          observer: 'showNameChanged'
        },
        showUnit: {
          type: 'boolean',
          observer: 'showUnitChanged'
        },
        precision: {
          type: 'number',
          observer: 'precisionChanged'
        }
      };
    }

    proxyChanged(proxy){
      if (proxy){
        this.restartPollingTimer()

      } else {
        this.stopPollingTimer()
      }
    }

    onPollPeriodChange(newValue, oldValue) {
      if (this.proxy) {
	console.log('poll period changed '+newValue)
        this.restartPollingTimer()
      }
    }
    
    createProxy(model) {
      const [_, devname, name] = model.match(/^(.+)\/([A-Za-z0-9_]+)$/)
      console.log('creating a proxy')
      const proxy =  new tangojs.core.api.AttributeProxy(devname, name)
      // update the info
      // Probably to refactor
      proxy.get_info().then(i => this._setInfo(i))
      return proxy
    }

    infoChanged(info) { 
      var unit = info.display_unit 
      if(unit === "No display unit") {
        // filter this, why it even works that way? 
        // here, if no unit is set, proper empty string is returned 
        this.unit = info.unit

      } else {
	this.unit = unit
      }

      this.writable = info.writable

      this.updateInputType(info)
    }

    /*
     *  READING Function
     *
     */

    readProxy(proxy) {
      //console.log('reading a proxy.')
      return proxy.read()
    }

    onModelRead (deviceAttributes) {
      const attribute = deviceAttributes[this.model];
      this.attribute = attribute;
      this.updateValue(attribute)
    }

    onModelError(error) {
      console.error(error)
      this.updateValueAndQuality('-error-', tangojs.core.tango.AttrQuality.ATTR_INVALID)
    }

	  
    restartPollingTimer() {
      console.log('restartPolling with period '+this.pollPeriod)
      this.stopPollingTimer()

      this.timer = setInterval(() => {
        const promisedResults = Object
          .keys(this.proxy)
          .map(m => this.readProxy(this.proxy[m]).then(x => [m, x]))

        Promise.all(promisedResults)
          .then(results => {
            const resultsMap = results.reduce(
              (acc, [m, x]) => (acc[m] = x, acc),
              {})
            this.onModelRead(resultsMap)
          })
          .catch(error => {
            this.onModelError(error)
          })
      }, this.pollPeriod) // FIXME: poolPeriod may be stored in mixin closure.
    }

    stopPollingTimer() {
      clearInterval(this.timer)
    }

    updateValue(data) {
      this.qualityColor = this.getQualityColor(data.quality)
      if(this.precision){
        this.value = data.value.toFixed(this.precision)
      } else {
        this.value = data.value
      }
      if(this.writable){
	this.setPoint = data.w_value
      }
    }

    getQualityColor (quality) {
      switch (quality) {
        case tangojs.core.tango.AttrQuality.ATTR_VALID: return '#80FF00'
        case tangojs.core.tango.AttrQuality.ATTR_INVALID: return '#880088'
        case tangojs.core.tango.AttrQuality.ATTR_ALARM: return '#FF0000'
        case tangojs.core.tango.AttrQuality.ATTR_CHANGING: return '#0080FF'
        case tangojs.core.tango.AttrQuality.ATTR_WARNING: return '#FFFF00'
        default: return '#0000FF'
      }
    }

    toggleVisibility (node, show) {
      // node.style.visibility = show ? 'visible' : 'hidden'
      node.style.display = show ? 'inline-block' : 'none'
    }

    onShowQualityChange (showQuality) {
      this.toggleVisibility(this.dom.led, showQuality)
    }

    onShowNameChange (showName) {
      this.toggleVisibility(this.dom.name, showName)
    }

    onShowUnitChange (showUnit) {
      this.toggleVisibility(this.dom.unit, showUnit)
    }

    onPrecisionChange (precision) {
      this.precision = precision
    }

    /*
     * WRITING FUNCTION
     * 
     */

    write(e){
      if (e.keyCode == 13 || e.which == 13) {
        const t = e.target
        const deviceAttribute = new tangojs.core.api.DeviceAttribute({
          value: (t.type == 'checkbox' ? t.checked : t.value)
        })

        this.proxy[this.model]
          .write(deviceAttribute)
          .catch(e => console.error(e))

        e.preventDefault();
      }
    }

    updateInputType(info){
      this.inputType = this.getInputTypeFromAttributeInfo(info)

      if (info.data_format != window.tangojs.core.tango.AttrDataFormat.SCALAR) {
        console.warn(`Unsupported data format ${info.data_format}.`)
        this.writable = false
      }
    }

    getInputTypeFromAttributeInfo (info) {
      const DT = window.tangojs.core.tango.AttributeDataType

      switch (info.data_type) {
        case DT.ATT_BOOL.value: return 'checkbox'
        case DT.ATT_SHORT.value:
        case DT.ATT_LONG.value:
        case DT.ATT_LONG64.value:
        case DT.ATT_FLOAT.value:
        case DT.ATT_DOUBLE.value:
        case DT.ATT_UCHAR.value:
        case DT.ATT_USHORT.value:
        case DT.ATT_ULONG.value:
        case DT.ATT_ULONG64.value: return 'number'
        case DT.ATT_STRING.value: return 'text'
        case DT.ATT_STATE.value:
        case DT.DEVICE_STATE.value:
        case DT.ATT_ENCODED.value:
        case DT.ATT_NO_DATA.value:
        default: return undefined
      }
    }

    setWriteProxy(info){
      // TODO: Move to TangoJS.core.AttributeProxy
      const { READ, WRITE, READ_WRITE, READ_WITH_WRITE } =
        window.tangojs.core.tango.AttrWriteType

      const [_, devname, name] = this.model.match(/^(.+)\/([A-Za-z0-9_]+)$/)

      switch (attributeInfo.writable) {
        case READ:
          this.writeProxy = null
          break
        case WRITE:
        case READ_WRITE:
          this.writeProxy = this.proxy
          break
        case READ_WITH_WRITE:
          this.writeProxy = new window.tangojs.core.api.AttributeProxy(
            this.proxy.devicename,
            attributeInfo.writable_attr_name)
          break
      }
    }
  }
}
