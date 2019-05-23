import util = require("util");


export class CacheEntry {
  public id: string;
  public tenant: string;


  constructor(id: string, tenant: string) {
    this.id = id;
    this.tenant = tenant;
  }

  public equals(other: CacheEntry) {
    return (this.id === other.id && this.tenant === other.tenant);
  }
};

/**
 * Class responsible for device cache management and cache lookup
 */
export class CacheHandler {

  // The cache.
  // TODO: this would be better placed in a Redis instance.
  cache: {
    [device: string]: CacheEntry[];
  }

  constructor() {
    this.cache = {};
  }

  /**
   * Perform a cache lookup.
   * @param device Device eui
   * @returns The cached device data
   */
  lookup(device: string) : CacheEntry[] | null {
    if (device in this.cache) {
      return this.cache[device];
    } else {
      return null;
    }
  }
  
  /**
   * Add a cache entry.
   * @param loraId Lora Id
   * @param entry Cache Entry
   */
  add(loraId: string, entry: CacheEntry){
    if(this.cache[loraId] == undefined) this.cache[loraId] = [];
    this.cache[loraId].push(entry);
  }

  /**
   * Remove a cache entry.
   * @param cacheEntry Device cache entry
   */
  remove(cacheEntry: CacheEntry) {
    let loraIds = Object.keys(this.cache);
    loraIds.forEach(loraId => {
      this.cache[loraId].forEach((storedCache, index) => {
        if (storedCache.equals(cacheEntry)) {
          this.cache[loraId].splice(index, 1);
        }
      });
    }); 
  }

}