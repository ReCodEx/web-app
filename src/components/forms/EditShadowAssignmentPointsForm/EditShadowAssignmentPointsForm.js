import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Form, Container, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import { defaultMemoize } from 'reselect';

import SubmitButton from '../SubmitButton';
import { TextField, DatetimeField, NumericTextField } from '../Fields';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import Icon, { RefreshIcon, DeleteIcon, SaveIcon } from '../../icons';

export const getPointsFormInitialValues = defaultMemoize((userPoints, awardeeId) => {
  return userPoints
    ? {
        pointsId: userPoints.id,
        awardeeId,
        points: userPoints.points,
        awardedAt: moment.unix(userPoints.awardedAt),
        note: userPoints.note,
      }
    : {
        pointsId: null,
        awardeeId,
        points: 0,
        awardedAt: moment().startOf('minute'),
        note: '',
      };
});

export const transformPointsFormSubmitData = ({ pointsId = null, awardedAt, ...formData }) => ({
  pointsId,
  awardedAt: moment(awardedAt).unix(),
  ...formData,
});

const EditShadowAssignmentPointsForm = ({
  onRemovePoints = null,
  change,
  reset,
  submitting,
  handleSubmit,
  dirty,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  warning,
}) => (
  <Form method="POST">
    {submitFailed && (
      <Callout variant="danger">
        <FormattedMessage
          id="app.editShadowAssignmentPointsForm.failed"
          defaultMessage="Cannot save the shadow assignment points."
        />
      </Callout>
    )}

    <Container fluid>
      <Row>
        <Col md={12} lg={5}>
          <NumericTextField
            name="points"
            maxLength={6}
            validateMin={-10000}
            validateMax={10000}
            label={<FormattedMessage id="app.editShadowAssignmentPointsForm.points" defaultMessage="Points:" />}
          />
        </Col>
        <Col md={12} lg={7}>
          <Field
            name="awardedAt"
            component={DatetimeField}
            ignoreDirty
            label={<FormattedMessage id="app.editShadowAssignmentPointsForm.awardedAt" defaultMessage="Awarded at:" />}
            append={
              <Button variant="primary" noShadow onClick={() => change('awardedAt', moment().startOf('minute'))}>
                <Icon icon="history" gapRight />
                <FormattedMessage id="app.editShadowAssignmentPointsForm.setNow" defaultMessage="Now" />
              </Button>
            }
          />
        </Col>
      </Row>

      <Row>
        <Col sm={12}>
          <Field
            name="note"
            component={TextField}
            maxLength={1024}
            label={<FormattedMessage id="app.editShadowAssignmentPointsForm.note" defaultMessage="Note:" />}
          />
        </Col>
      </Row>
    </Container>

    <hr />

    {warning && <Callout variant="warning">{warning}</Callout>}

    <div className="text-center">
      <TheButtonGroup>
        {dirty && (
          <Button type="reset" onClick={reset} variant={'danger'}>
            <RefreshIcon gapRight />
            <FormattedMessage id="generic.reset" defaultMessage="Reset" />
          </Button>
        )}
        <SubmitButton
          id="shadow-assignment-points"
          handleSubmit={handleSubmit}
          submitting={submitting}
          dirty={dirty}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          defaultIcon={<SaveIcon gapRight />}
          messages={{
            submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
            submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
            success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
          }}
        />

        {onRemovePoints && (
          <Button onClick={onRemovePoints} variant="danger" className="em-margin-left">
            <DeleteIcon gapRight />
            <FormattedMessage
              id="app.editShadowAssignmentPointsForm.removePoints"
              defaultMessage="Remove Points Record"
            />
          </Button>
        )}
      </TheButtonGroup>
    </div>
  </Form>
);

EditShadowAssignmentPointsForm.propTypes = {
  maxPoints: PropTypes.number.isRequired,
  onRemovePoints: PropTypes.func,
  change: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  dirty: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  warning: PropTypes.any,
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
  warn,
})(EditShadowAssignmentPointsForm);
