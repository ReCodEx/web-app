var pending = {};

export function eventAggregator(id, fnc, timeout) {
  if (typeof fnc !== 'function') {
    throw new Error('Argument fnc has to be a function.');
  }

  if (pending[id]) {
    // Previous event with the same ID was registered, timeout pending...
    pending[id].fnc = fnc;
  } else {
    // First event of given ID, lets start countdown ...
    const tid = setTimeout(() => {
      if (pending[id] && pending[id].fnc) {
        pending[id].fnc();
        delete pending[id];
      }
    }, timeout);
    pending[id] = {
      tid,
      fnc,
    };
  }
}

export function terminateAggregation(id, finalInvoke = false) {
  if (pending[id]) {
    clearTimeout(pending[id].tid);
    if (finalInvoke && pending[id].fnc) {
      pending[id].fnc();
    }
    delete pending[id];
  }
}
