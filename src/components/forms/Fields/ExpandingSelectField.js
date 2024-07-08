import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { FormLabel, OverlayTrigger, Tooltip } from 'react-bootstrap';

import Button from '../../widgets/TheButton';
import SelectField from './SelectField.js';
import Icon, { AddIcon, CloseIcon } from '../../icons';

const ExpandingSelectField = ({
  fields,
  meta: { active, dirty, error, warning },
  label = null,
  noItems = null,
  readOnly = false,
  ...props
}) => (
  <div>
    {fields.length > 0 && (
      <>
        {Boolean(label) && <FormLabel>{label}</FormLabel>}
        {fields.map((field, index) => (
          <Field
            key={index}
            name={field}
            component={SelectField}
            label={''}
            addEmptyOption
            disabled={readOnly}
            groupClassName="mb-1"
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
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={Date.now()}>
                          <FormattedMessage
                            id="app.expandingTextField.tooltip.add"
                            defaultMessage="Append a new item."
                          />
                        </Tooltip>
                      }>
                      <Button onClick={() => fields.push('')} size="xs" noShadow>
                        <AddIcon fixedWidth />
                      </Button>
                    </OverlayTrigger>
                  )}

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
                </>
              )
            }
            {...props}
          />
        ))}
      </>
    )}

    {fields.length === 0 && (
      <div className="text-muted small">
        <span className="pr-3">
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

ExpandingSelectField.propTypes = {
  fields: PropTypes.object.isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  noItems: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  options: PropTypes.array,
  readOnly: PropTypes.bool,
};

export default ExpandingSelectField;
