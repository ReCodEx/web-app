/**
 * @module actionTypesFactory
 */

const defaultPrefix = resourceName => `recovid/resource/${resourceName}`;
const twoPhaseActions = ['ADD', 'UPDATE', 'REMOVE', 'FETCH', 'FETCH_MANY'];
const onePhaseActions = ['INVALIDATE'];

export const getActionTypes = (prefix, actions, postfixes = ['']) =>
  actions.reduce(
    (acc, action) => ({
      ...acc,
      ...postfixes.reduce(
        (acc, postfix) => ({
          ...acc,
          [`${action}${postfix}`]: `${prefix}/${action}${postfix}`,
        }),
        {}
      ),
    }),
    {}
  );

/**
 * @param {string} resourceName Name of the resource
 * @param {string} prefix       Unique prefix for the actions
 */
const actionTypesFactory = (resourceName, prefix = defaultPrefix(resourceName)) => ({
  ...getActionTypes(prefix, twoPhaseActions, ['', '_PENDING', '_FULFILLED', '_REJECTED']),
  ...getActionTypes(prefix, onePhaseActions),
});

export default actionTypesFactory;
