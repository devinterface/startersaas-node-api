import _ from "lodash";

class BaseSerializer {
  constructor() {
    this.properties = [];
    this.useCamelCase = true;
  }

  serialize(data) {
    const serializedData = {};
    const keys = Object.keys(data);
    for (const key of keys) {
      const value = data[key];
      if (value !== undefined) {
        const serializedKey = this.useCamelCase ? toCamelCase(key) : key;
        if (Array.isArray(value)) {
          serializedData[serializedKey] = value.map((item) => {
            return this.serialize(item);
          });
        } else {
          serializedData[serializedKey] = value;
        }
      }
    }
    return serializedData;
  }

  index(objects) {
    return objects.map((obj) => this.show(obj));
  }

  show(object) {
    return this.serialize(object);
  }
}

function toCamelCase(str) {
  return _.camelCase(str.replace(/_/g, ""));
}

export default BaseSerializer;
