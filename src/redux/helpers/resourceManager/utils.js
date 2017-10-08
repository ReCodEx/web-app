/**
 * Several internal helper functions of the resource manager.
 * @module utils
 */

import { hasFailed, didInvalidate } from './status';

/**
 * Create a simple default factory: id => "/<resourceName>/[<id>]"
 * @param {string} resourceName Name of the resource
 * @return {Function} API endpoint factory
 */
export const defaultApiEndpointFactory = resourceName => (id = '') =>
  `/${resourceName}/${id}`;

/**
 * @param {string} resourceName Name of the resource
 * @return {Function} Redux state selector
 */
export const defaultSelectorFactory = resourceName => state =>
  state[resourceName];

/**
 * Does the given item need refetching or is it already cached?
 * @param {object}    The item
 * @return {boolean}  The item needs to be reloaded from the server
 */
export const defaultNeedsRefetching = item =>
  !item || hasFailed(item) || didInvalidate(item);
