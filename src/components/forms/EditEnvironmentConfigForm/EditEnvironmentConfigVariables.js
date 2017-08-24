import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Table, Button, Row, Col } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import {
  defineMessages,
  intlShape,
  injectIntl,
  FormattedMessage
} from 'react-intl';

import { TextField, SelectField, ExpandingTextField } from '../Fields';

const messages = defineMessages({
  stringType: {
    id: 'app.editEnvironmentConfigVariables.stringType',
    defaultMessage: 'String'
  },
  fileType: {
    id: 'app.editEnvironmentConfigVariables.fileType',
    defaultMessage: 'File'
  },
  stringArrayType: {
    id: 'app.editEnvironmentConfigVariables.stringArrayType',
    defaultMessage: 'Array of strings'
  },
  fileArrayType: {
    id: 'app.editEnvironmentConfigVariables.fileArrayType',
    defaultMessage: 'Array of files'
  }
});

const EditEnvironmentConfigVariables = ({
  fields,
  formValues,
  intl: { formatMessage }
}) =>
  <div>
    <Table>
      <thead>
        <tr>
          <th>
            <FormattedMessage
              id="app.editEnvironmentConfigVariables.variables"
              defaultMessage="Variables:"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {fields.map((variable, index) =>
          <tr key={index}>
            <td>
              <Field
                name={`${variable}.name`}
                component={TextField}
                label={''}
              />
            </td>
            <td>
              <Row>
                <Col xs={4} style={{ paddingRight: '0px' }}>
                  <Field
                    name={`${variable}.type`}
                    component={SelectField}
                    options={[
                      { key: '', name: '...' },
                      {
                        key: 'string',
                        name: formatMessage(messages.stringType)
                      },
                      { key: 'file', name: formatMessage(messages.fileType) },
                      {
                        key: 'string[]',
                        name: formatMessage(messages.stringArrayType)
                      },
                      {
                        key: 'file[]',
                        name: formatMessage(messages.fileArrayType)
                      }
                    ]}
                    label={''}
                  />
                </Col>
                <Col xs={8} style={{ paddingLeft: '0px' }}>
                  {formValues[index] &&
                    <Field
                      name={`${variable}.value`}
                      component={
                        formValues[index].type === 'string' ||
                        formValues[index].type === 'file'
                          ? TextField
                          : ExpandingTextField
                      }
                      label={''}
                    />}
                </Col>
              </Row>
            </td>
            <td style={{ verticalAlign: 'middle' }}>
              <Button
                onClick={() => fields.remove(index)}
                bsStyle={'danger'}
                bsSize="xs"
                className="btn-flat"
              >
                <Icon name="minus" />{' '}
                <FormattedMessage
                  id="app.editEnvironmentConfigVariables.remove"
                  defaultMessage="Remove"
                />
              </Button>
            </td>
          </tr>
        )}
      </tbody>
    </Table>
    <Button
      onClick={() => fields.push()}
      bsStyle={'primary'}
      className="btn-flat"
    >
      <Icon name="plus" />{' '}
      <FormattedMessage
        id="app.editEnvironmentConfigVariables.add"
        defaultMessage="Add variable"
      />
    </Button>
  </div>;

EditEnvironmentConfigVariables.propTypes = {
  fields: PropTypes.object,
  formValues: PropTypes.array,
  intl: intlShape.isRequired
};

export default injectIntl(EditEnvironmentConfigVariables);
