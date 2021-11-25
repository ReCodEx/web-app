/**
 * @module actionTypesFactory
 */

import { arrayToObject } from '../../../helpers/common';

const defaultPrefix = resourceName => `recodex/resource/${resourceName}`;
const twoPhaseActions = ['ADD', 'UPDATE', 'REMOVE', 'FETCH', 'FETCH_MANY'];
const onePhaseActions = ['INVALIDATE'];

export const defaultActionPostfixes = ['', '_PENDING', '_FULFILLED', '_REJECTED'];
export const createActionsWithPostfixes = (baseName, prefix, postfixes = defaultActionPostfixes) =>
  arrayToObject(
    postfixes,
    postfix => `${baseName}${postfix}`,
    postfix => `${prefix}/${baseName}${postfix}`
  );

export const getActionTypes = (prefix, actions, postfixes = ['']) =>
  actions.reduce(
    (acc, action) => ({
      ...acc,
      ...createActionsWithPostfixes(action, prefix, postfixes),
      /*
      ...postfixes.reduce(
        (acc, postfix) => ({
          ...acc,
          [`${action}${postfix}`]: `${prefix}/${action}${postfix}`,
        }),
        {}
      ),
      */
    }),
    {}
  );

/**
 * @param {string} resourceName Name of the resource
 * @param {string} prefix       Unique prefix for the actions
 */
const actionTypesFactory = (resourceName, prefix = defaultPrefix(resourceName)) => ({
  ...getActionTypes(prefix, twoPhaseActions, defaultActionPostfixes),
  ...getActionTypes(prefix, onePhaseActions),
});

export default actionTypesFactory;
