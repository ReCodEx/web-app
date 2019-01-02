export const createUserNameComparator = locale => (u1, u2) =>
  u1.name.lastName.localeCompare(u2.name.lastName, locale) ||
  u1.name.firstName.localeCompare(u2.name.firstName, locale) ||
  u1.privateData.email.localeCompare(u2.privateData.email, locale);
