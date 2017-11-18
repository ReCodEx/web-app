const middleware = isDev => store => next => action => {
  /* eslint no-console: ["error", { allow: ["log", "error"] }] */
  let verbose = false && isDev;
  var actionType = action.type;
  if (verbose) {
    console.log('Starting ' + actionType);
    console.log(action);
  } else if (isDev) {
    console.log(actionType);
  }

  try {
    var res = next(action);
  } catch (e) {
    console.error('Exception thrown when processing action ' + actionType);
    if (isDev) console.error(e);
    throw e;
  }
  if (verbose) {
    console.log('State After Action ' + actionType);
    console.log(store.getState().groups);
    console.log('--------------------');
  }

  return res;
};

export default middleware;
