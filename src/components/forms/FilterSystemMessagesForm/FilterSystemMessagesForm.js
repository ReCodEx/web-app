import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Container, Row, Col, Form } from 'react-bootstrap';

import SubmitButton from '../SubmitButton';
import { CheckboxField } from '../Fields';
import { SendIcon } from '../../icons';
import { identity } from '../../../helpers/common.js';

const FilterSystemMessagesForm = ({
  onSubmit = identity,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  intl: { locale },
}) => (
  <Form method="POST" onSubmit={onSubmit}>
    <Container fluid>
      <Row>
        <Col sm={9} md={10}>
          <Field
            name="showAll"
            component={CheckboxField}
            onOff
            label={
              <FormattedMessage
                id="app.systemMessagesList.showAll"
                defaultMessage="Show all messages (including expired)"
              />
            }
          />
        </Col>

        <Col sm={3} md={2}>
          <div className="text-end">
            <SubmitButton
              id="setFilters"
              handleSubmit={handleSubmit}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              invalid={invalid}
              disabled={onSubmit === null}
              defaultIcon={<SendIcon gapRight={2} />}
              messages={{
                submit: <FormattedMessage id="generic.setFilters" defaultMessage="Set Filters" />,
                success: <FormattedMessage id="generic.filtersSet" defaultMessage="Filters Set" />,
              }}
            />
          </div>
        </Col>
      </Row>
    </Container>
  </Form>
);

FilterSystemMessagesForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(
  reduxForm({
    form: 'filterSystemMessages',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
  })(FilterSystemMessagesForm)
);
