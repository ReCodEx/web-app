import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, FormattedMessage, defineMessages, intlShape } from 'react-intl';
import { Alert, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { withRouter } from 'react-router';

import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Button from '../../../components/widgets/FlatButton';
import Icon, { SuccessIcon, WarningIcon } from '../../../components/icons';
import { forkStatuses } from '../../../redux/modules/exercises';
import { getFork } from '../../../redux/selectors/exercises';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import { getGroupCanonicalLocalizedName } from '../../../helpers/localizedData';
import { hasPermissions } from '../../../helpers/common';

import withLinks from '../../../helpers/withLinks';

import './ForkExerciseForm.css';

const messages = defineMessages({
  emptyOption: {
    id: 'app.forkExerciseForm.selectGroupFirst',
    defaultMessage: '... select group of residence first ...',
  },
});

class ForkExerciseForm extends Component {
  viewForkedExercise() {
    const {
      forkedExerciseId: id,
      history: { push },
      links: { EXERCISE_URI_FACTORY },
    } = this.props;
    push(EXERCISE_URI_FACTORY(id));
  }

  render() {
    const {
      forkStatus,
      resetId,
      submitting,
      handleSubmit,
      submitFailed,
      submitSucceeded,
      invalid,
      groups,
      groupsAccessor,
      intl: { locale, formatMessage },
    } = this.props;

    switch (forkStatus) {
      case forkStatuses.FULFILLED:
        return (
          <div className="callout callout-success">
            <table className="full-width">
              <tbody>
                <tr>
                  <td className="valign-middle">
                    <p>
                      <SuccessIcon gapRight />
                      <FormattedMessage
                        id="app.forkExerciseForm.successMessage"
                        defaultMessage="A copy of the exercise was successfully created in the designated group."
                      />
                    </p>
                  </td>
                  <td className="text-right">
                    <Button bsStyle="primary" onClick={this.viewForkedExercise}>
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
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div>
            {submitFailed && (
              <Alert bsStyle="danger">
                <WarningIcon gapRight />
                <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
              </Alert>
            )}
            <Form inline className="forkForm">
              <ResourceRenderer resource={groups.toArray()} returnAsArray>
                {groups => (
                  <React.Fragment>
                    <Field
                      name={'groupId'}
                      component={SelectField}
                      label={''}
                      ignoreDirty
                      addEmptyOption={true}
                      emptyOptionCaption={formatMessage(messages.emptyOption)}
                      options={groups
                        .filter(group => hasPermissions(group, 'createExercise'))
                        .map(group => ({
                          key: group.id,
                          name: getGroupCanonicalLocalizedName(group, groupsAccessor, locale),
                        }))
                        .sort((a, b) => a.name.localeCompare(b.name, locale))}
                    />

                    <SubmitButton
                      id="forkExercise"
                      disabled={invalid}
                      submitting={submitting}
                      hasSucceeded={submitSucceeded}
                      hasFailed={submitFailed}
                      handleSubmit={handleSubmit}
                      defaultIcon={<Icon icon="code-branch" gapRight />}
                      confirmQuestion={
                        <FormattedMessage
                          id="app.forkExerciseForm.confirmSubmit"
                          defaultMessage="Fork process will create another copy of the exercise. This only make sense if you need to create a different exercise and you do not want to start from scratch. Please, do not fork exercises just to attach them to a different groups of residence. Are you sure you would like to proceed with forking?"
                        />
                      }
                      messages={{
                        submit: <FormattedMessage id="app.forkExerciseForm.submit" defaultMessage="Fork Exercise" />,
                        submitting: (
                          <FormattedMessage id="app.forkExerciseForm.submitting" defaultMessage="Forking..." />
                        ),
                        success: (
                          <FormattedMessage id="app.forkExerciseForm.success" defaultMessage="Exercise forked" />
                        ),
                      }}
                    />
                  </React.Fragment>
                )}
              </ResourceRenderer>
            </Form>
          </div>
        );
    }
  }
}

ForkExerciseForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
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
  intl: intlShape,
};

const validate = ({ groupId }) => {
  const errors = {};
  if (!groupId) {
    errors._error = (
      <FormattedMessage
        id="app.forkExerciseForm.validation.noGroupSelected"
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
    })(injectIntl(withRouter(ForkExerciseForm)))
  )
);
