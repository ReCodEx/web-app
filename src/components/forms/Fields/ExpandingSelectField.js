import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { FormLabel, OverlayTrigger, Tooltip } from 'react-bootstrap';

import TheButton from '../../widgets/TheButton';
import SelectField from './SelectField';
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
        <table>
          <tbody>
            {fields.map((field, index) => (
              <tr key={index}>
                <td width="100%" className="valign-top">
                  <Field
                    name={field}
                    component={SelectField}
                    label={''}
                    addEmptyOption
                    disabled={readOnly}
                    {...props}
                  />
                </td>

                {!readOnly && (
                  <>
                    <td className="valign-top">
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={Date.now()}>
                            <FormattedMessage
                              id="app.expandingTextField.tooltip.addAbove"
                              defaultMessage="Insert new item right above."
                            />
                          </Tooltip>
                        }>
                        <TheButton onClick={() => fields.insert(index, '')}>
                          <AddIcon size="xs" />
                          <Icon icon="level-up-alt" />
                        </TheButton>
                      </OverlayTrigger>
                    </td>
                    <td className="valign-top">
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
                        <TheButton onClick={() => fields.remove(index)}>
                          <CloseIcon />
                        </TheButton>
                      </OverlayTrigger>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}
    <div style={{ textAlign: 'center' }}>
      {fields.length === 0 && (
        <span style={{ paddingRight: '2em' }}>
          {noItems || (
            <FormattedMessage id="app.expandingTextField.noItems" defaultMessage="There are no items yet..." />
          )}
        </span>
      )}

      {!readOnly && (
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id={Date.now()}>
              <FormattedMessage id="app.expandingTextField.tooltip.add" defaultMessage="Append a new item." />
            </Tooltip>
          }>
          <TheButton onClick={() => fields.push('')}>
            <AddIcon />
          </TheButton>
        </OverlayTrigger>
      )}
    </div>
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
