import React from 'react';
import PropTypes from 'prop-types';
import { lruMemoize } from 'reselect';

import ActionButton from './ActionButton';
import ActionDropdown from './ActionDropdown';

/*
 * Helper functions
 */

/**
 * Prepare action button descriptors from an object template to make the construction more convenient.
 * @param {*} template Object where keys are action names, values are action descriptor prototypes.
 * @param {*} order Array of action keys (in which order the buttons should apear)
 * @param {*} handlers Separate object where keys are action names and values are functions (handlers)
 * @param {*} pendingIndicators Separate object used to translate the 'pending' property
 *                              (template.pending is used as a key in pendingIndicators and the indicator value
 *                               replaces the pending value in the action descriptor)
 * @returns {Object[]} list of descriptors
 */
export const prepareButtonDescriptors = lruMemoize((template, order, handlers = null, pendingIndicators = null) => {
  return order
    .filter(key => template[key])
    .map(key => ({
      ...template[key],
      key,
      handler: (handlers && handlers[key]) || template[key].handler,
      pending: pendingIndicators
        ? (template[key].pending && pendingIndicators[template[key].pending]) || false
        : template[key].pending,
    }))
    .filter(action => action.handler);
});

/**
 * Transforms the action descriptors. All tooltips are removed, only labels remain.
 * If label is missing and tooltip exists, it becomes a label.
 * @param {Object[]} actions
 * @returns {Object[]}
 */
export const onlyLabels = lruMemoize(actions =>
  actions.map(({ label, tooltip, ...action }) => ({ ...action, label: label || tooltip }))
);

/**
 * Transforms the action descriptors. All labels are removed, only tooltips remain.
 * If tooltip is missing and label exists, it becomes a tooltip.
 * @param {Object[]} actions
 * @returns {Object[]}
 */
export const onlyTooltips = lruMemoize(actions =>
  actions.map(({ label, tooltip, ...action }) => ({ ...action, tooltip: tooltip || label }))
);

const ActionButtons = ({ id, actions, size = undefined, dropdown = false, dropdownLabel = null }) => {
  return dropdown ? (
    <ActionDropdown id={id} actions={actions} label={dropdownLabel} />
  ) : (
    actions.map(action => (
      <ActionButton
        key={action.key}
        id={id}
        variant={action.variant}
        icon={action.icon}
        label={action.label}
        tooltip={action.tooltip}
        confirm={action.confirm}
        pending={action.pending}
        size={size}
        onClick={action.handler}
      />
    ))
  );
};

ActionButtons.propTypes = {
  id: PropTypes.string.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.array]),
      label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
      tooltip: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
      confirm: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
      pending: PropTypes.bool,
      variant: PropTypes.string,
      handler: PropTypes.func,
    })
  ).isRequired,
  size: PropTypes.string,
  dropdown: PropTypes.bool,
  dropdownLabel: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

export default ActionButtons;
