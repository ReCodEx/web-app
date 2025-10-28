export const createUserNameComparator = locale => (u1, u2) => {
  if (!u1 && !u2) {
    return 0; // both users are missing
  }

  if (!u1 || !u2) {
    return !u2 ? -1 : 1; // one of the users is missing (missing users should be sorted at the end)
  }

  return (
    // ultimate fallback (since email may not be visible to regular users)
    // email is used in rare cases when two users have the same name
    (u1.name.lastName.localeCompare(u2.name.lastName, locale) ||
    u1.name.firstName.localeCompare(u2.name.firstName, locale) ||
    (u1.privateData && u2.privateData && u1.privateData.email.localeCompare(u2.privateData.email, locale)) || u1.id.localeCompare(u2.id))
  );
};
