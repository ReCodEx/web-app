/* eslint eqeqeq: "off", no-console: ["error", { allow: ["log", "error", "debug"] }] */
const modificationWatchdogValues = {};

export const modificationWatchdog = (name, value, verbose = false) => {
  if (modificationWatchdogValues[name] === undefined) {
    // First time the value is being registered ...
    console.log(`Value '${name}' was created.`);
    if (verbose) {
      console.log(value);
    }
  } else if (modificationWatchdogValues[name] !== value) {
    console.log(`Value '${name}' was changed.`);
    if (verbose) {
      console.log(modificationWatchdogValues[name]);
      console.log(value);
    }
  }
  modificationWatchdogValues[name] = value;
  return value;
};

// This should be called from componentWillReceiveProps(nextProps), for instance.
export const logPropsChanges = (className, props, nextProps) => {
  let changed = false;
  for (const p in props) {
    if (props[p] !== nextProps[p]) {
      if (!changed) {
        changed = true;
        console.log(`${className} props changed.`);
      }

      if (props[p] != nextProps[p]) {
        console.log(`Property '${p}' changed.`);
        console.log(props[p]);
        console.log(nextProps[p]);
      } else {
        console.log(`Property '${p}' was recreated with the same value.`);
      }
    }
  }
  if (changed) console.log('----------');
};
