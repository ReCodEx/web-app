/**
 *
 * @module recordFactory
 */

import { fromJS } from 'immutable';
import { resourceStatus, isReadyOrReloading } from './status';

/**
 * @typedef RecordDescriptor
 * @type {object}
 * @property {object}   data          The data of the resource itself
 * @property {string}   state         The state of the resource
 * @property {boolean}  didInvalidate True if the resource has been declared invalid
 * @property {number}   lastUpdate    Timestamp of the last update of the item
 */

/**
 * @param {RecordDescriptor} record The properties of the record
 * @return {object} ImmutableJS map with the properties of the record
 */
const createRecord = (
  {
    data = null,
    state = resourceStatus.PENDING,
    didInvalidate = false,
    lastUpdate = null
  } = {}
) =>
  fromJS({
    state,
    data,
    didInvalidate,
    lastUpdate: lastUpdate !== null ? lastUpdate : Date.now()
  });

export default createRecord;

/**
 * @param   {object}      resource  Resource's data
 * @return  {object|null}
 */
export const getData = resource =>
  isReadyOrReloading(resource) ? resource.get('data') : null;

/**
 * @param   {object}      resource  Resource's data
 * @return  {Immutable.Map|null}
 */
export const getJsData = resource => {
  const data = isReadyOrReloading(resource) ? getData(resource) : null;
  return data && data.toJS ? data.toJS() : data;
};

/**
 * @param   {object}      resource  Resource's data
 * @return  {string|null}
 */
export const getId = resource =>
  isReadyOrReloading(resource) ? getJsData(resource).id : null;
