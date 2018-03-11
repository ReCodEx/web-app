export const compareAssignments = (a, b) => {
  // first compare by deadline
  if (a.firstDeadline < b.firstDeadline) {
    return -1;
  } else if (a.firstDeadline === b.firstDeadline) {
    // then compare by second deadline - if one of them does not have any,
    // it is lower -> higher position in the table
    if (a.allowSecondDeadline !== b.allowSecondDeadline) {
      // one has the second deadline and the other not
      return a.allowSecondDeadline ? 1 : -1;
    } else {
      // if both have second deadline, compare them
      if (a.allowSecondDeadline === true) {
        if (a.secondDeadline < b.secondDeadline) {
          return -1;
        } else if (a.secondDeadline > b.secondDeadline) {
          return 1;
        }
        // if second deadlines are equal, continue
      }

      // none of them have second deadline or they are queal, compare creation times
      return b.createdAt - a.createdAt;
    }
  } else {
    return 1;
  }
};
