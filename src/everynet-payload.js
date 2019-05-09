
/* https://www.decentlab.com/support */

var DecentLabDecoder = {
    PROTOCOL_VERSION: 2,
    SENSORS: [
      {length: 2,
       values: [{name: 'Distance',
                 convert: function (x) { return x[0]; },
                 unit: 'mm'},
                {name: 'Number of valid samples',
                 convert: function (x) { return x[1]; }}]},
      {length: 1,
       values: [{name: 'Battery voltage',
                 convert: function (x) { return x[0] / 1000; },
                 unit: 'V'}]}
    ],
  
    read_int: function (bytes) {
      return (bytes.shift() << 8) + bytes.shift();
    },

    base64ToHex: function(msg){
        const buffer = Buffer.from(msg, 'base64');
        return buffer.toString('hex');
    },
  
    decode: function (msg) {
      msg = this.base64ToHex(msg);
      var bytes = msg;
      var i, j;
      if (typeof msg === 'string') {
        bytes = [];
        for (i = 0; i < msg.length; i += 2) {
          bytes.push(parseInt(msg.substring(i, i + 2), 16));
        }
      }
  
      var version = bytes.shift();
      if (version != this.PROTOCOL_VERSION) {
        return {error: "protocol version " + version + " doesn't match v2"};
      }
  
      var deviceId = this.read_int(bytes);
      var flags = this.read_int(bytes);
      var result = {'Protocol version': version, 'Device ID': deviceId};
      // decode payload
      for (i = 0; i < this.SENSORS.length; i++, flags >>= 1) {
        if ((flags & 1) !== 1)
          continue;
  
        var sensor = this.SENSORS[i];
        var x = [];
        // convert data to 16-bit integer array
        for (j = 0; j < sensor.length; j++) {
          x.push(this.read_int(bytes));
        }
  
        // decode sensor values
        for (j = 0; j < sensor.values.length; j++) {
          var value = sensor.values[j];
          if ('convert' in value) {
            result[value.name] = {value: value.convert(x),
                                  unit: value.unit};
          }
        }
      }
      return result;
    }
  };
  
  var decode = (bytes) => {
      return DecentLabDecoder.decode(bytes);
  }

  module.exports = decode;
  