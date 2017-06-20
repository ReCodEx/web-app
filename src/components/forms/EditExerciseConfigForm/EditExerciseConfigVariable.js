import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { Field } from 'redux-form';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { TextField, SelectField } from '../Fields';

const messages = defineMessages({
  stringType: {
    id: 'app.editExerciseConfigForm.stringType',
    defaultMessage: 'String'
  },
  fileType: {
    id: 'app.editExerciseConfigForm.fileType',
    defaultMessage: 'File'
  }
});

const EditExerciseConfigVariable = ({
  prefix,
  data,
  intl: { formatMessage }
}) =>
  <td key={data.name}>
    <Row>
      <Col xs={12}>
        <b>{data.name + ':'}</b>
      </Col>
    </Row>
    <Row>
      <Col xs={4} style={{ paddingRight: '0px' }}>
        <Field
          style={{ marginTop: '-20px' }}
          name={`${prefix}.type`}
          component={SelectField}
          options={[
            { key: 'string', name: formatMessage(messages.stringType) },
            { key: 'file', name: formatMessage(messages.fileType) }
          ]}
          label={''}
        />
      </Col>
      <Col xs={8} style={{ paddingLeft: '0px' }}>
        <Field
          style={{ marginTop: '-20px' }}
          name={`${prefix}.value`}
          component={TextField}
          label={''}
        />
      </Col>
    </Row>
  </td>;

EditExerciseConfigVariable.propTypes = {
  prefix: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(EditExerciseConfigVariable);
