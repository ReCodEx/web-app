import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Grid, Row, Col, Form } from 'react-bootstrap';

import SubmitButton from '../SubmitButton';
import { CheckboxField } from '../Fields';
import { identity } from '../../../helpers/common';

const FilterSystemMessagesForm = ({
  onSubmit = identity,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  intl: { locale },
}) => (
  <Form method="POST" onSubmit={onSubmit}>
    <Grid fluid>
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
          <div className="text-right">
            <SubmitButton
              id="setFilters"
              handleSubmit={handleSubmit}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              invalid={invalid}
              disabled={onSubmit === null}
              messages={{
                submit: <FormattedMessage id="generic.setFilters" defaultMessage="Set Filters" />,
                success: <FormattedMessage id="generic.filtersSet" defaultMessage="Filters Set" />,
              }}
            />
          </div>
        </Col>
      </Row>
    </Grid>
  </Form>
);

FilterSystemMessagesForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(
  reduxForm({
    form: 'filterSystemMessages',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
  })(FilterSystemMessagesForm)
);
