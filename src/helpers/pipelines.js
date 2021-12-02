/*
 * Functions related to pipeline editing and visualization.
 */

import { defaultMemoize } from 'reselect';
import { arrayToObject } from './common';

/**
 * Check whether given data type is a list of values.
 * @param {string} type descriptor
 * @returns {boolean} true if the type represents a list
 */
export const isArrayType = type => type.endsWith('[]');

/**
 * Check whether given variable value is a reference to external variable (starts with $).
 * @param {string|Array} value
 * @returns {boolean}
 */
export const isExternalReference = value => typeof value === 'string' && value.startsWith('$');

/**
 * Get the identifier if an external reference
 * @param {*} value
 * @returns {string|null} null if the value is not a reference
 */
export const getReferenceIdentifier = value => (isExternalReference(value) ? value.substr(1) : null);

/**
 * Create a value that is an external reference to a variable of given name
 * @param {string} name of the variable
 * @returns {string}
 */
export const makeExternalReference = name => '$' + name;

/**
 * Verify that variable value is present and matches declared type.
 * @param {Object} variable
 * @returns {boolean}
 */
export const isVariableValueValid = variable =>
  'value' in variable &&
  'type' in variable &&
  (Array.isArray(variable.value) === isArrayType(variable.type) || isExternalReference(variable.value));

/**
 * Make sure the variable value is of the right type, cast it if necessary.
 * @param {*} variable
 */
export const coerceVariableValue = variable => {
  if (!('value' in variable)) {
    variable.value = isArrayType(variable.type) ? [] : '';
  }

  if (typeof variable.value === 'object' && !Array.isArray(variable.value)) {
    variable.value = Object.values(variable.value);
  }

  if (!isVariableValueValid(variable)) {
    if (isArrayType(variable.type)) {
      variable.value = variable.value ? [variable.value] : [];
    } else {
      variable.value = variable.value.join(' ');
    }
  }
};

/**
 * Get info about variables utilization from boxes specification (where the variables are used)
 * @param {Object[]} boxes part of the pipeline specification
 * @return {Object} keys are variable names, values are objects holding { portsIn, portsOut } values,
 *                  both are arrays of boxes where the variable is present
 */
export const getVariablesUtilization = defaultMemoize(boxes => {
  const utils = {};
  boxes.forEach(box =>
    ['portsIn', 'portsOut'].forEach(ports =>
      Object.values(box[ports])
        .filter(({ value }) => value)
        .forEach(({ value }) => {
          if (!utils[value]) {
            utils[value] = { portsIn: [], portsOut: [] };
          }
          utils[value][ports].push(box);
        })
    )
  );
  return utils;
});

/**
 * Transform array of variables into oject (dictionary), that translates name to type.
 * @param {Object[]} variables
 * @return {Object} keys are names, values are types
 */
export const getVariablesTypes = defaultMemoize(variables =>
  arrayToObject(
    variables,
    ({ name }) => name,
    ({ type }) => type
  )
);
