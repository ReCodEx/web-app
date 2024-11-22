import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { FormLabel, OverlayTrigger, Tooltip } from 'react-bootstrap';

import Button from '../../widgets/TheButton';
import TextField from './TextField.js';
import Icon, { AddIcon, CloseIcon } from '../../icons';

const handleMultilinePaste = (ev, fields, index) => {
  const text = (ev.clipboardData || window.clipboardData).getData('text');
  const lines = text.trim().split('\n');
  if (lines.length > 1) {
    ev.preventDefault();
    lines.forEach((line, idx) => fields.insert(index + idx + 1, line.trim()));
    if (!fields.get(index)) {
      fields.remove(index);
    }
  }
};

const ExpandingTextField = ({
  fields = [],
  label = null,
  noItems = null,
  validateEach,
  readOnly = false,
  min = 0,
  max = 256,
  meta, // we just need to exclude this from props
  ...props
}) => (
  <div>
    {Boolean(label) && <FormLabel>{label}</FormLabel>}
    {fields.map((field, index) => (
      <Field
        key={index}
        name={field}
        component={TextField}
        label={''}
        validate={validateEach}
        disabled={readOnly}
        groupClassName="mb-1"
        onPaste={ev => handleMultilinePaste(ev, fields, index)}
        append={
          readOnly ? null : (
            <>
              {index < fields.length - 1 ? (
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id={Date.now()}>
                      <FormattedMessage
                        id="app.expandingTextField.tooltip.moveDown"
                        defaultMessage="Swap with item below."
                      />
                    </Tooltip>
                  }>
                  <Button onClick={() => fields.swap(index, index + 1)} size="xs" noShadow>
                    <Icon icon="long-arrow-alt-down" fixedWidth />
                  </Button>
                </OverlayTrigger>
              ) : (
                fields.length < max && (
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={Date.now()}>
                        <FormattedMessage id="app.expandingTextField.tooltip.add" defaultMessage="Append a new item." />
                      </Tooltip>
                    }>
                    <Button onClick={() => fields.push('')} size="xs" noShadow>
                      <AddIcon fixedWidth />
                    </Button>
                  </OverlayTrigger>
                )
              )}

              {fields.length > min && (
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id={Date.now()}>
                      <FormattedMessage
                        id="app.expandingTextField.tooltip.remove"
                        defaultMessage="Remove this item from the list."
                      />
                    </Tooltip>
                  }>
                  <Button onClick={() => fields.remove(index)} size="xs" noShadow>
                    <CloseIcon fixedWidth />
                  </Button>
                </OverlayTrigger>
              )}
            </>
          )
        }
        {...props}
      />
    ))}

    {fields.length === 0 && (
      <div className="text-body-secondary small">
        <span className="pe-3">
          {noItems || (
            <FormattedMessage id="app.expandingTextField.noItems" defaultMessage="There are no items yet..." />
          )}
        </span>

        {!readOnly && (
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id={Date.now()}>
                <FormattedMessage id="app.expandingTextField.tooltip.add" defaultMessage="Append a new item." />
              </Tooltip>
            }>
            <Button onClick={() => fields.push('')} size="xs">
              <AddIcon />
            </Button>
          </OverlayTrigger>
        )}
      </div>
    )}
  </div>
);

ExpandingTextField.propTypes = {
  fields: PropTypes.object,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  noItems: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  validateEach: PropTypes.func,
  readOnly: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,
};

export default ExpandingTextField;
