import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { ControlLabel, OverlayTrigger, Tooltip } from 'react-bootstrap';

import FlatButton from '../../widgets/FlatButton';
import TextField from './TextField';
import Icon, { AddIcon, CloseIcon } from '../../icons';

import styles from './commonStyles.less';

const ExpandingTextField = ({
  fields,
  meta: { active, dirty, error, warning },
  label,
  ...props
}) =>
  <div>
    <ControlLabel>
      {label}
    </ControlLabel>
    <table>
      <tbody>
        {fields.map((field, index) =>
          <tr key={index}>
            <td width="100%" className={styles.alignTop}>
              <Field name={field} component={TextField} label={''} {...props} />
            </td>
            <td className={styles.alignTop}>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id={Date.now()}>
                    <FormattedMessage
                      id="app.expandingTextField.tooltip.addAbove"
                      defaultMessage="Insert new item right above."
                    />
                  </Tooltip>
                }
              >
                <FlatButton onClick={() => fields.insert(index, '')}>
                  <AddIcon size="xs" />
                  <Icon icon="level-up-alt" />
                </FlatButton>
              </OverlayTrigger>
            </td>
            <td className={styles.alignTop}>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id={Date.now()}>
                    <FormattedMessage
                      id="app.expandingTextField.tooltip.remove"
                      defaultMessage="Remove this item from the list."
                    />
                  </Tooltip>
                }
              >
                <FlatButton onClick={() => fields.remove(index)}>
                  <CloseIcon />
                </FlatButton>
              </OverlayTrigger>
            </td>
          </tr>
        )}
      </tbody>
    </table>
    <div style={{ textAlign: 'center' }}>
      {fields.length === 0 &&
        <span style={{ paddingRight: '2em' }}>
          <FormattedMessage
            id="app.expandingTextField.noItems"
            defaultMessage="There are no items yet..."
          />
        </span>}
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id={Date.now()}>
            <FormattedMessage
              id="app.expandingTextField.tooltip.add"
              defaultMessage="Append a new item."
            />
          </Tooltip>
        }
      >
        <FlatButton onClick={() => fields.push('')}>
          <AddIcon />
        </FlatButton>
      </OverlayTrigger>
    </div>
  </div>;

ExpandingTextField.propTypes = {
  fields: PropTypes.object.isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any
  }).isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default ExpandingTextField;
