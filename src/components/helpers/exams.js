/**
 * Check whether given student (user) is locked in a group
 * @param {Object} student being tested
 * @param {string|null} groupId if null, any group lock is considered
 * @param {number|null} now when the test is performed (unix ts), null = now
 * @returns {Boolean} true if the student is locked in the group
 */
export const isStudentLocked = (student, groupId = null, now = null) => {
  if (!student?.privateData?.groupLock) {
    return false; // no lock
  }

  if (!now) {
    now = Date.now() / 1000;
  }

  if (student?.privateData?.groupLockExpiration && student.privateData.groupLockExpiration < now) {
    return false; // lock expired
  }

  // if groupId is set, only lock within that group counts
  return groupId ? student.privateData.groupLock === groupId : true;
};
