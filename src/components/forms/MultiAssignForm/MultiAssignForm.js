import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import {
  Alert,
  HelpBlock,
  Button,
  Grid,
  Row,
  Col,
  Table
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import isNumeric from 'validator/lib/isNumeric';

import { DatetimeField, TextField, CheckboxField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Icon, { GroupIcon } from '../../icons';
import { getGroupCanonicalLocalizedName } from '../../../helpers/localizedData';
import { identity } from '../../../helpers/common';
import withLinks from '../../../helpers/withLinks';
import { validateTwoDeadlines } from '../../helpers/validation';

class MultiAssignForm extends Component {
  state = {
    open: false,
    assignedToGroups: null
  };
  allGroups = [];
  myGroups = [];

  toggleOpenState = () => {
    this.setState({ open: !this.state.open });
  };

  acknowledgeSuccess = () => {
    this.setState({ assignedToGroups: null });
    this.props.reset();
  };

  componentWillReceiveProps(newProps) {
    if (
      this.props.groups !== newProps.groups ||
      this.props.userId !== newProps.userId ||
      this.props.groupsAccessor !== newProps.groupsAccessor ||
      this.props.intl.locale !== newProps.intl.locale
    ) {
      const { groupsAccessor, intl: { locale } } = newProps;
      this.allGroups = newProps.groups
        .filter(g => !g.organizational && !g.archived)
        .sort((a, b) =>
          getGroupCanonicalLocalizedName(
            a,
            groupsAccessor,
            locale
          ).localeCompare(
            getGroupCanonicalLocalizedName(b, groupsAccessor, locale),
            locale
          )
        );

      this.myGroups = this.allGroups.filter(
        g =>
          g.primaryAdminsIds.find(id => id === newProps.userId) ||
          g.privateData.supervisors.find(id => id === newProps.userId)
      );
    }
  }

  /**
   * Wraps the onSubmit callback passed from the parent component.
   * (note that submitHandler in which this function is used is redux-form internal routine to handle submits)
   */
  onSubmitWrapper = formData => {
    const { onSubmit } = this.props;

    const groups =
      formData && formData.groups
        ? Object.keys(formData.groups)
            .filter(key => formData.groups[key])
            .map(id => id.replace(/^id/, ''))
        : [];

    return onSubmit(formData).then(() => {
      this.setState({ assignedToGroups: groups });
    });
  };

  render() {
    const {
      error,
      dirty,
      handleSubmit,
      submitting,
      submitFailed: hasFailed,
      submitSucceeded: hasSucceeded,
      invalid,
      firstDeadline,
      allowSecondDeadline,
      groups,
      groupsAccessor,
      runtimeEnvironments,
      links: { GROUP_DETAIL_URI_FACTORY },
      intl: { locale }
    } = this.props;

    return this.state.assignedToGroups === null
      ? <div>
          {hasFailed &&
            <Alert bsStyle="danger">
              <FormattedMessage
                id="generic.savingFailed"
                defaultMessage="Saving failed. Please try again later."
              />
            </Alert>}

          {(this.state.open ? this.allGroups : this.myGroups).map((group, i) =>
            <Field
              key={group.id}
              name={`groups.id${group.id}`}
              component={CheckboxField}
              onOff
              label={getGroupCanonicalLocalizedName(
                group,
                groupsAccessor,
                locale
              )}
            />
          )}

          <div className="text-center">
            {this.allGroups.length !== this.myGroups.length &&
              <Button
                bsSize="xs"
                bsStyle="primary"
                className="btn-flat"
                onClick={this.toggleOpenState}
              >
                {this.state.open
                  ? <span>
                      <Icon icon="minus-square" gapRight />
                      <FormattedMessage
                        id="app.multiAssignForm.showMyGroups"
                        defaultMessage="Show My Groups Only"
                      />
                    </span>
                  : <span>
                      <Icon icon="plus-square" gapRight />
                      <FormattedMessage
                        id="app.multiAssignForm.showAllGroups"
                        defaultMessage="Show All Groups"
                      />
                    </span>}
              </Button>}
          </div>
          <hr />

          <Field
            name="firstDeadline"
            component={DatetimeField}
            label={
              allowSecondDeadline
                ? <FormattedMessage
                    id="app.multiAssignForm.firstDeadline"
                    defaultMessage="First deadline:"
                  />
                : <FormattedMessage
                    id="app.multiAssignForm.deadline"
                    defaultMessage="Deadline:"
                  />
            }
          />

          <Field
            name="maxPointsBeforeFirstDeadline"
            component={TextField}
            label={
              allowSecondDeadline
                ? <FormattedMessage
                    id="app.multiAssignForm.maxPointsBeforeFirstDeadline"
                    defaultMessage="Maximal amount of points (before the first deadline):"
                  />
                : <FormattedMessage
                    id="app.multiAssignForm.maxPoints"
                    defaultMessage="Maximal amount of points:"
                  />
            }
          />

          <Field
            name="allowSecondDeadline"
            component={CheckboxField}
            onOff
            label={
              <FormattedMessage
                id="app.multiAssignForm.allowSecondDeadline"
                defaultMessage="Second deadline enabled"
              />
            }
          />

          {allowSecondDeadline &&
            <Field
              name="secondDeadline"
              disabled={!firstDeadline || allowSecondDeadline !== true}
              isValidDate={date => date.isSameOrAfter(firstDeadline)}
              component={DatetimeField}
              label={
                <FormattedMessage
                  id="app.multiAssignForm.secondDeadline"
                  defaultMessage="Second deadline:"
                />
              }
            />}

          {allowSecondDeadline &&
            !firstDeadline &&
            <HelpBlock>
              <FormattedMessage
                id="app.multiAssignForm.chooseFirstDeadlineBeforeSecondDeadline"
                defaultMessage="You must select the date of the first deadline before selecting the date of the second deadline."
              />
            </HelpBlock>}

          {allowSecondDeadline &&
            <Field
              name="maxPointsBeforeSecondDeadline"
              disabled={allowSecondDeadline !== true}
              component={TextField}
              label={
                <FormattedMessage
                  id="app.multiAssignForm.maxPointsBeforeSecondDeadline"
                  defaultMessage="Maximal amount of points (before the second deadline):"
                />
              }
            />}

          <Field
            name="submissionsCountLimit"
            component={TextField}
            label={
              <FormattedMessage
                id="app.multiAssignForm.submissionsCountLimit"
                defaultMessage="Maximal number of submissions:"
              />
            }
          />

          <Field
            name="canViewLimitRatios"
            component={CheckboxField}
            onOff
            label={
              <FormattedMessage
                id="app.multiAssignForm.canViewLimitRatios"
                defaultMessage="Students may see relative time and memory consumption of their solutions"
              />
            }
          />

          <Field
            name="pointsPercentualThreshold"
            component={TextField}
            label={
              <FormattedMessage
                id="app.multiAssignForm.pointsPercentualThreshold"
                defaultMessage="Minimal percentual threshold of correctness:"
              />
            }
          />

          <Field
            name="isBonus"
            component={CheckboxField}
            onOff
            label={
              <FormattedMessage
                id="app.multiAssignForm.isBonus"
                defaultMessage="Bonus assignment"
              />
            }
          />

          <hr />

          <h4>
            <FormattedMessage
              id="app.editAssignmentForm.enabledEnvironments"
              defaultMessage="Enabled Runtime Environments"
            />
          </h4>

          <Grid fluid>
            <Row>
              {runtimeEnvironments.map((env, i) =>
                <Col key={i} sm={6}>
                  <Field
                    name={`enabledRuntime.${env.id}`}
                    component={CheckboxField}
                    onOff
                    label={env.longName}
                  />
                </Col>
              )}
            </Row>
          </Grid>

          <hr />

          <Grid fluid>
            <Row>
              <Col sm={6}>
                <Field
                  name="sendNotification"
                  component={CheckboxField}
                  onOff
                  label={
                    <FormattedMessage
                      id="app.editAssignmentForm.sendNotification"
                      defaultMessage="Send e-mail notification to students about new assignment"
                    />
                  }
                />
              </Col>
            </Row>
          </Grid>

          {error &&
            dirty &&
            <Alert bsStyle="danger">
              {error}
            </Alert>}

          <div className="text-center">
            <SubmitButton
              id="multiAssignForm"
              invalid={invalid}
              submitting={submitting}
              hasSucceeded={hasSucceeded}
              hasFailed={hasFailed}
              handleSubmit={handleSubmit(this.onSubmitWrapper)}
              messages={{
                submit: (
                  <FormattedMessage
                    id="app.multiAssignForm.submit"
                    defaultMessage="Assign Exercise"
                  />
                ),
                submitting: (
                  <FormattedMessage
                    id="app.multiAssignForm.submitting"
                    defaultMessage="Assigning Exercise..."
                  />
                ),
                success: (
                  <FormattedMessage
                    id="app.multiAssignForm.success"
                    defaultMessage="Exercise was assigned."
                  />
                )
              }}
            />
          </div>
        </div>
      : <div>
          <div className="callout callout-success">
            <h4>
              <FormattedMessage
                id="app.multiAssignForm.successHeading"
                defaultMessage="Exercise Assigned"
              />
            </h4>
            <p>
              <FormattedMessage
                id="app.multiAssignForm.successDescription"
                defaultMessage="The exercise was successfuly assigned to the following groups. Please note, that all new assignments are immediately visible to the users."
              />
            </p>
          </div>
          <Table>
            <tbody>
              {this.state.assignedToGroups
                .map(gId => groups.find(({ id }) => id === gId))
                .filter(identity)
                .map(group =>
                  <tr key={group.id}>
                    <td>
                      <Icon icon="check" />
                    </td>
                    <td>
                      {getGroupCanonicalLocalizedName(
                        group,
                        groupsAccessor,
                        locale
                      )}
                    </td>
                    <td className="text-right">
                      <LinkContainer to={GROUP_DETAIL_URI_FACTORY(group.id)}>
                        <Button
                          bsSize="xs"
                          bsStyle="primary"
                          className="btn-flat"
                          onClick={this.toggleOpenState}
                        >
                          <GroupIcon gapRight />
                          <FormattedMessage
                            id="app.group.detail"
                            defaultMessage="Group Detail"
                          />
                        </Button>
                      </LinkContainer>
                    </td>
                  </tr>
                )}
            </tbody>
          </Table>
          <div className="text-center">
            <Button
              bsStyle="warning"
              className="btn-flat"
              onClick={this.acknowledgeSuccess}
            >
              <Icon icon={['far', 'smile']} gapRight />
              <FormattedMessage
                id="generic.acknowledge"
                defaultMessage="Acknowledge"
              />
            </Button>
          </div>
        </div>;
  }
}

MultiAssignForm.propTypes = {
  initialValues: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.any,
  dirty: PropTypes.bool.isRequired,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  reset: PropTypes.func.isRequired,
  firstDeadline: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object
  ]), // object == moment.js instance
  allowSecondDeadline: PropTypes.bool,
  userId: PropTypes.string.isRequired,
  groups: PropTypes.array.isRequired,
  groupsAccessor: PropTypes.func.isRequired,
  runtimeEnvironments: PropTypes.array.isRequired,
  links: PropTypes.object,
  intl: intlShape.isRequired
};

const isNonNegativeInteger = n =>
  typeof n !== 'undefined' &&
  (typeof n === 'number' || isNumeric(n)) &&
  parseInt(n) >= 0;

const isPositiveInteger = n =>
  typeof n !== 'undefined' &&
  (typeof n === 'number' || isNumeric(n)) &&
  parseInt(n) > 0;

const validate = (
  {
    submissionsCountLimit,
    firstDeadline,
    secondDeadline,
    allowSecondDeadline,
    maxPointsBeforeFirstDeadline,
    maxPointsBeforeSecondDeadline,
    pointsPercentualThreshold,
    groups,
    runtimeEnvironments,
    enabledRuntime
  },
  { intl: { formatMessage } }
) => {
  const errors = {};
  if (
    !groups ||
    Object.keys(groups).length === 0 ||
    Object.values(groups).filter(val => val).length < 1
  ) {
    errors._error = (
      <FormattedMessage
        id="app.multiAssignForm.validation.emptyGroups"
        defaultMessage="Please select one or more groups to assign exercise."
      />
    );
  }

  validateTwoDeadlines(
    errors,
    formatMessage,
    firstDeadline,
    secondDeadline,
    allowSecondDeadline
  );

  if (!isPositiveInteger(submissionsCountLimit)) {
    errors.submissionsCountLimit = (
      <FormattedMessage
        id="app.multiAssignForm.validation.submissionsCountLimit"
        defaultMessage="Please fill the submissions count limit field with a positive integer."
      />
    );
  }

  if (!isNonNegativeInteger(maxPointsBeforeFirstDeadline)) {
    errors.maxPointsBeforeFirstDeadline = (
      <FormattedMessage
        id="app.multiAssignForm.validation.maxPointsBeforeFirstDeadline"
        defaultMessage="Please fill the maximum number of points received when submitted before the deadline with a nonnegative integer."
      />
    );
  }

  if (
    allowSecondDeadline &&
    !isNonNegativeInteger(maxPointsBeforeSecondDeadline)
  ) {
    errors.maxPointsBeforeSecondDeadline = (
      <FormattedMessage
        id="app.multiAssignForm.validation.maxPointsBeforeSecondDeadline"
        defaultMessage="Please fill the number of maximum points received after the first and before the second deadline with a nonnegative integer or remove the second deadline."
      />
    );
  }

  if (pointsPercentualThreshold) {
    const numericThreshold = Number(pointsPercentualThreshold);
    if (numericThreshold < 0 || numericThreshold > 100) {
      errors.pointsPercentualThreshold = (
        <FormattedMessage
          id="app.multiAssignForm.validation.pointsPercentualThresholdBetweenZeroHundred"
          defaultMessage="Points percentual threshold must be in between 0 and 100."
        />
      );
    }
  }

  const formDisabledRuntimes = Object.keys(enabledRuntime).filter(
    key => enabledRuntime[key] === false
  );
  if (formDisabledRuntimes.length === runtimeEnvironments.length) {
    errors._error = (
      <FormattedMessage
        id="app.multiAssignForm.validation.allRuntimesDisabled"
        defaultMessage="You cannot disable all available runtime environments."
      />
    );
  }

  return errors;
};

export default injectIntl(
  withLinks(
    reduxForm({
      form: 'multiAssign',
      enableReinitialize: true,
      keepDirtyOnReinitialize: false,
      validate
    })(MultiAssignForm)
  )
);
