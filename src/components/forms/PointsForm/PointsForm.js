import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm } from 'redux-form';
import { Alert, Grid, Row, Col } from 'react-bootstrap';
import isInt from 'validator/lib/isInt';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';

import { NumericTextField } from '../Fields';

const PointsForm = ({
  submitting,
  handleSubmit,
  dirty,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  warning,
  scoredPoints = null,
  maxPoints
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.pointsForm.title"
        defaultMessage="Awarded Points"
      />
    }
    type={submitSucceeded ? 'success' : undefined}
    isOpen={true}
    collapsable={true}
    footer={
      <div className="text-center">
        <SubmitButton
          id="bonus-points"
          handleSubmit={handleSubmit}
          submitting={submitting}
          dirty={dirty}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          messages={{
            submit: (
              <FormattedMessage id="generic.save" defaultMessage="Save" />
            ),
            submitting: (
              <FormattedMessage
                id="generic.saving"
                defaultMessage="Saving..."
              />
            ),
            success: (
              <FormattedMessage id="generic.saved" defaultMessage="Saved" />
            )
          }}
        />
      </div>
    }
  >
    {submitFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.pointsForm.failed"
          defaultMessage="Cannot save the bonus points."
        />
      </Alert>}

    <Grid fluid>
      <Row>
        <Col sm={12}>
          <p>
            <b>
              <FormattedMessage
                id="app.pointsForm.scoredPoints"
                defaultMessage="Scored points from last evaluation"
              />:
            </b>&nbsp;&nbsp;
            {scoredPoints !== null ? scoredPoints : '-'} / {maxPoints}
          </p>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <NumericTextField
            name="overriddenPoints"
            validateMin={-10000}
            validateMax={10000}
            maxLength={6}
            label={
              <FormattedMessage
                id="app.pointsForm.pointsOverride"
                defaultMessage="Points override:"
              />
            }
          />
        </Col>
        <Col sm={6}>
          <NumericTextField
            name="bonusPoints"
            validateMin={-10000}
            validateMax={10000}
            maxLength={6}
            label={
              <FormattedMessage
                id="app.pointsForm.bonusPoints"
                defaultMessage="Bonus points:"
              />
            }
          />
        </Col>
      </Row>
    </Grid>

    {warning &&
      <Alert bsStyle="warning">
        {warning}
      </Alert>}
  </FormBox>;

PointsForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  dirty: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  warning: PropTypes.any,
  scoredPoints: PropTypes.number,
  maxPoints: PropTypes.number.isRequired
};

const warn = ({ overriddenPoints }, { maxPoints }) => {
  const warnings = {};
  if (isInt(overriddenPoints.trim())) {
    const p = Number(overriddenPoints);
    if (p < 0 || p > maxPoints) {
      warnings._warning = (
        <FormattedMessage
          id="app.pointsForm.validation.overrideOutOfRange"
          defaultMessage="Points override is out of regular range. Regular score for this assignment is between 0 and {maxPoints}."
          values={{ maxPoints }}
        />
      );
    }
  }
  return warnings;
};

export default reduxForm({
  form: 'bonus-points',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  warn
})(PointsForm);
