const pick = (object: { [key: string]: any }, keys: string[]) => {
  const newObject: { [key: string]: any } = {};

  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, newObject);
};

export default pick;
