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

import { TextField, SelectField } from '../Fields';

const messages = defineMessages({
  stringType: {
    id: 'app.editEnvironmentConfigVariables.stringType',
    defaultMessage: 'String'
  },
  fileType: {
    id: 'app.editEnvironmentConfigVariables.fileType',
    defaultMessage: 'File'
  }
});

const EditEnvironmentConfigVariables = ({
  prefix,
  variables,
  intl: { formatMessage }
}) => (
  <div>
    <Table>
      <tbody>
        {variables.map((variable, index) => (
          <tr key={index}>
            <td>
              <Field
                name={`${prefix}.${variable}`}
                component={TextField}
                label={''}
              />
            </td>
            <td>
              <Row>
                <Col xs={4} style={{ paddingRight: '0px' }}>
                  <Field
                    name={`${prefix}.${variable}.type`}
                    component={SelectField}
                    options={[
                      {
                        key: 'string',
                        name: formatMessage(messages.stringType)
                      },
                      { key: 'file', name: formatMessage(messages.fileType) }
                    ]}
                    label={''}
                  />
                </Col>
                <Col xs={8} style={{ paddingLeft: '0px' }}>
                  <Field
                    name={`${prefix}.${variable}.value`}
                    component={TextField}
                    label={''}
                  />
                </Col>
              </Row>
            </td>
            <td>
              <Button
                onClick={() => variables.remove(index)}
                bsStyle={'danger'}
                bsSize="xs"
                className="btn-flat"
              >
                <Icon name="minus" />
                {' '}
                <FormattedMessage
                  id="app.editEnvironmentConfigVariables.remove"
                  defaultMessage="Remove"
                />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
    <Button
      onClick={() => variables.push({ '': { type: 'string', value: '' } })}
      bsStyle={'primary'}
      className="btn-flat"
    >
      <Icon name="plus" />
      {' '}
      <FormattedMessage
        id="app.editEnvironmentConfigVariables.add"
        defaultMessage="Add variable"
      />
    </Button>
  </div>
);

EditEnvironmentConfigVariables.propTypes = {
  prefix: PropTypes.string.isRequired,
  variables: PropTypes.array.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(EditEnvironmentConfigVariables);
