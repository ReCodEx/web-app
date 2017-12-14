const middleware = (
  noDOM,
  verbose,
  fullException
) => store => next => action => {
  /* eslint no-console: ["error", { allow: ["log", "error", "debug"] }] */
  var actionType = action.type;
  if (verbose) {
    console.debug('Starting ' + actionType);
    console.debug(action);
  } else if (noDOM) {
    console.debug(actionType);
  }

  try {
    var res = next(action);
  } catch (e) {
    console.log('Exception thrown when processing action ' + actionType);
    if (fullException) console.error(e);
    throw e;
  }
  if (verbose) {
    console.debug('State After Action ' + actionType);
    console.debug(store.getState().groups);
    console.debug('--------------------');
  }

  return res;
};

export default middleware;
