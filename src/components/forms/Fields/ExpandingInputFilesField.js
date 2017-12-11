import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { ControlLabel } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import FlatButton from '../../widgets/FlatButton';

import SelectField from './SelectField';
import TextField from './TextField';

import styles from './commonStyles.less';

const EMPTY_VALUE = { file: '', name: '' };

const validate = value =>
  !value || value.trim() === ''
    ? <FormattedMessage
        id="app.expandingInputFilesField.validateEmpty"
        defaultMessage="This value must not be empty."
      />
    : undefined;

const ExpandingInputFilesField = ({
  fields,
  meta: { active, dirty, error, warning },
  leftLabel = '',
  rightLabel = '',
  options,
  ...props
}) =>
  <div>
    {fields.length > 0 &&
      <table>
        <thead>
          <tr>
            <th width="50%">
              <ControlLabel>
                {leftLabel}
              </ControlLabel>
            </th>
            <th width="50%">
              <ControlLabel>
                {rightLabel}
              </ControlLabel>
            </th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) =>
            <tr key={index}>
              <td className={styles.alignTop}>
                <Field
                  name={`${field}.file`}
                  component={SelectField}
                  label={''}
                  options={options}
                  addEmptyOption={true}
                  validate={validate}
                  {...props}
                />
              </td>
              <td className={styles.alignTop}>
                <Field
                  name={`${field}.name`}
                  component={TextField}
                  label={''}
                  validate={validate}
                  {...props}
                />
              </td>
              <td className={styles.alignTop}>
                <FlatButton onClick={() => fields.insert(index, EMPTY_VALUE)}>
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
      </table>}
    <div style={{ textAlign: 'center' }}>
      {fields.length === 0 &&
        <span style={{ paddingRight: '2em' }}>
          <FormattedMessage
            id="app.expandingInputFilesField.noFiles"
            defaultMessage="There are no files yet..."
          />
        </span>}
      <FlatButton onClick={() => fields.push(EMPTY_VALUE)}>
        <Icon name="plus" />
      </FlatButton>
    </div>
  </div>;

ExpandingInputFilesField.propTypes = {
  fields: PropTypes.object.isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any
  }).isRequired,
  leftLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  rightLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired,
  options: PropTypes.array
};

export default ExpandingInputFilesField;
