const middleware = store => next => action => {
  let verbose = false;
  if (verbose) {
    console.log(action);
  } else {
    console.log(action.type);
  }

  let res = next(action);

  if (verbose) {
    console.log('State After Actions:');
    console.log('--------------------');
    console.log(store.getState().assignments);
  }

  return res;
};

export default middleware;
