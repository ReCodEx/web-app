import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Form, Alert, Grid, Row, Col } from 'react-bootstrap';
import SubmitButton from '../SubmitButton';

import { TextField, DatetimeField, NumericTextField } from '../Fields';

const EditShadowAssignmentPointsForm = ({
  submitting,
  handleSubmit,
  dirty,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  warning
}) =>
  <Form method="POST">
    {submitFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.editShadowAssignmentPointsForm.failed"
          defaultMessage="Cannot save the shadow assignment points."
        />
      </Alert>}

    <Grid fluid>
      <Row>
        <Col md={12} lg={6}>
          <NumericTextField
            name="points"
            maxLength={6}
            validateMin={-10000}
            validateMax={10000}
            label={
              <FormattedMessage
                id="app.editShadowAssignmentPointsForm.points"
                defaultMessage="Points:"
              />
            }
          />
        </Col>
        <Col md={12} lg={6}>
          <Field
            name="awardedAt"
            component={DatetimeField}
            label={
              <FormattedMessage
                id="app.editShadowAssignmentPointsForm.awardedAt"
                defaultMessage="Awarded at:"
              />
            }
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <Field
            name="note"
            component={TextField}
            maxLength={255}
            label={
              <FormattedMessage
                id="app.editShadowAssignmentPointsForm.note"
                defaultMessage="Note:"
              />
            }
          />
        </Col>
      </Row>
    </Grid>

    <hr />

    {warning &&
      <Alert bsStyle="warning">
        {warning}
      </Alert>}

    <div className="text-center">
      <SubmitButton
        id="shadow-assignment-points"
        handleSubmit={handleSubmit}
        submitting={submitting}
        dirty={dirty}
        hasSucceeded={submitSucceeded}
        hasFailed={submitFailed}
        invalid={invalid}
        messages={{
          submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
          submitting: (
            <FormattedMessage id="generic.saving" defaultMessage="Saving..." />
          ),
          success: (
            <FormattedMessage id="generic.saved" defaultMessage="Saved" />
          )
        }}
      />
    </div>
  </Form>;

EditShadowAssignmentPointsForm.propTypes = {
  maxPoints: PropTypes.number.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  dirty: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  warning: PropTypes.any
};

const warn = ({ points }, { maxPoints }) => {
  const warnings = {};

  if (maxPoints > 0) {
    if (points > maxPoints || points < 0) {
      warnings._warning = (
        <FormattedMessage
          id="app.editShadowAssignmentPointsForm.validation.pointsOutOfRange"
          defaultMessage="Points are out of regular range. Regular score for this assignment is between 0 and {maxPoints}."
          values={{ maxPoints }}
        />
      );
    }
  }

  return warnings;
};

export default reduxForm({
  form: 'shadow-assignment-points',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  warn
})(EditShadowAssignmentPointsForm);
