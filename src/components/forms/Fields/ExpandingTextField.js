import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { ControlLabel } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import FlatButton from '../../widgets/FlatButton';

import TextField from './TextField';

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
              <FlatButton onClick={() => fields.insert(index, '')}>
                <Icon name="reply" />
              </FlatButton>
            </td>
            <td className={styles.alignTop}>
              <FlatButton onClick={() => fields.remove(index)}>
                <Icon name="remove" />
              </FlatButton>
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
      <FlatButton onClick={() => fields.push('')}>
        <Icon name="plus" />
      </FlatButton>
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
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default ExpandingTextField;
