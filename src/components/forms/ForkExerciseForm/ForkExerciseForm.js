import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';
import { Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { useNavigate } from 'react-router-dom';

import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import { WarningIcon, ForkIcon } from '../../icons';
import { forkStatuses } from '../../../redux/modules/exercises.js';
import { getFork } from '../../../redux/selectors/exercises.js';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import { getGroupCanonicalLocalizedName } from '../../../helpers/localizedData.js';
import { hasPermissions } from '../../../helpers/common.js';

import withLinks from '../../../helpers/withLinks.js';

import './ForkExerciseForm.css';

const messages = defineMessages({
  emptyOption: {
    id: 'app.createExerciseForm.selectGroupFirst',
    defaultMessage: '... select group of residence first ...',
  },
});

const ForkExerciseForm = ({
  forkStatus,
  resetId,
  submitting,
  handleSubmit,
  submitFailed,
  submitSucceeded,
  invalid,
  groups,
  groupsAccessor,
  forkedExerciseId,
  links: { EXERCISE_URI_FACTORY },
  intl: { locale, formatMessage },
}) => {
  const navigate = useNavigate();
  const viewForkedExercise = () => {
    navigate(EXERCISE_URI_FACTORY(forkedExerciseId));
  };

  if (forkStatus === forkStatuses.FULFILLED) {
    return (
      <Callout variant="success">
        <table className="w-100">
          <tbody>
            <tr>
              <td className="align-middle">
                <p>
                  <FormattedMessage
                    id="app.forkExerciseForm.successMessage"
                    defaultMessage="A copy of the exercise was successfully created in the designated group."
                  />
                </p>
              </td>
              <td className="text-end">
                <TheButtonGroup>
                  <Button variant="primary" onClick={viewForkedExercise}>
                    <FormattedMessage
                      id="app.forkExerciseForm.showForkedExerciseButton"
                      defaultMessage="Show the Forked Exercise"
                    />
                  </Button>
                  {resetId && (
                    <Button onClick={resetId}>
                      <FormattedMessage id="generic.acknowledge" defaultMessage="Acknowledge" />
                    </Button>
                  )}
                </TheButtonGroup>
              </td>
            </tr>
          </tbody>
        </table>
      </Callout>
    );
  }

  return (
    <div>
      {submitFailed && (
        <Callout variant="danger">
          <WarningIcon gapRight={2} />
          <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
        </Callout>
      )}
      <Form className="forkForm">
        <ResourceRenderer resourceArray={groups}>
          {groups => (
            <>
              <Field
                name="groupId"
                component={SelectField}
                label=""
                ignoreDirty
                addEmptyOption={true}
                emptyOptionCaption={formatMessage(messages.emptyOption)}
                groupClassName="w-100"
                options={groups
                  .filter(group => hasPermissions(group, 'createExercise'))
                  .map(group => ({
                    key: group.id,
                    name: getGroupCanonicalLocalizedName(group, groupsAccessor, locale),
                  }))
                  .sort((a, b) => a.name.localeCompare(b.name, locale))}
                append={
                  <SubmitButton
                    id="forkExercise"
                    disabled={invalid}
                    submitting={submitting}
                    hasSucceeded={submitSucceeded}
                    hasFailed={submitFailed}
                    handleSubmit={handleSubmit}
                    defaultIcon={<ForkIcon gapRight={2} />}
                    noShadow
                    confirmQuestion={
                      <FormattedMessage
                        id="app.forkExerciseForm.confirmSubmit"
                        defaultMessage="Fork process will create another copy of the exercise. This only make sense if you need to create a different exercise and you do not want to start from scratch. Please, do not fork exercises just to attach them to a different groups of residence. Are you sure you would like to proceed with forking?"
                      />
                    }
                    messages={{
                      submit: <FormattedMessage id="app.forkExerciseForm.submit" defaultMessage="Fork Exercise" />,
                      submitting: <FormattedMessage id="app.forkExerciseForm.submitting" defaultMessage="Forking..." />,
                      success: <FormattedMessage id="app.forkExerciseForm.success" defaultMessage="Exercise forked" />,
                    }}
                  />
                }
              />
            </>
          )}
        </ResourceRenderer>
      </Form>
    </div>
  );
};

ForkExerciseForm.propTypes = {
  exerciseId: PropTypes.string.isRequired,
  forkId: PropTypes.string.isRequired,
  forkStatus: PropTypes.string,
  forkedExerciseId: PropTypes.string,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  resetId: PropTypes.func,
  links: PropTypes.object,
  groups: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

const validate = ({ groupId }) => {
  // the error is actually not displayed, but it prevents form submission
  const errors = {};
  if (!groupId) {
    errors._error = (
      <FormattedMessage
        id="app.createExerciseForm.validation.noGroupSelected"
        defaultMessage="No group of residence has been selected."
      />
    );
  }
  return errors;
};

export default withLinks(
  connect((state, { exerciseId, forkId }) => {
    const fork = getFork(exerciseId, forkId)(state);
    return {
      forkStatus: fork ? fork.status : null,
      forkedExerciseId: fork && fork.status === forkStatuses.FULFILLED ? fork.exerciseId : null,
    };
  })(
    reduxForm({
      form: 'forkExercise',
      validate,
    })(injectIntl(ForkExerciseForm))
  )
);
