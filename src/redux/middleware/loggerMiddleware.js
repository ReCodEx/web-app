const middleware = (noDOM, verbose, fullException) => store => next => action => {
  /* eslint no-console: ["error", { allow: ["log", "error", "debug"] }] */
  const actionType = action.type;
  const logger = noDOM ? console.log : console.debug; // older nodejs do not have console.debug()
  if (verbose) {
    logger('Starting ' + actionType);
    logger(action);
  } else if (noDOM) {
    logger(actionType);
  }

  let res = null;
  try {
    res = next(action);
  } catch (e) {
    console.log('Exception thrown when processing action ' + actionType);
    if (fullException) console.error(e);
    throw e;
  }

  if (verbose) {
    logger('Result:');
    logger(res);
    logger('State After Action ' + actionType);
    logger(store.getState().groups);
    logger('--------------------');
  }

  return res;
};

export default middleware;
