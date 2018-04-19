import util = require("util");


class CacheEntry {
  public id: string;
  public tenant: string;


  constructor(id: string, tenant: string) {
    this.id = id;
    this.tenant = tenant;
  }
};

/**
 * Class responsible for device cache management and cache lookup
 */
class CacheHandler {

  // The cache.
  // TODO: this would be better placed in a Redis instance.
  cache: {
    [device: string]: CacheEntry;
  }

  constructor() {
    this.cache = {};
  }


  /**
   * Perform a cache lookup.
   * @param device Device eui
   * @returns The cached device data
   */
  lookup(device: string) : CacheEntry | null {
    if (device in this.cache) {
      return this.cache[device];
    } else {
      return null;
    }
  }
}

export { CacheHandler };
export { CacheEntry };