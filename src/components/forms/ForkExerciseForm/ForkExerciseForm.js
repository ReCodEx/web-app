import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Alert, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reduxForm, Field } from 'redux-form';
import { SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';
import Button from '../../../components/widgets/FlatButton';
import Icon, { SuccessIcon, WarningIcon } from '../../../components/icons';
import { forkStatuses } from '../../../redux/modules/exercises';
import { getFork } from '../../../redux/selectors/exercises';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import { getGroupCanonicalLocalizedName } from '../../../helpers/getLocalizedData';

import withLinks from '../../../helpers/withLinks';

import './ForkExerciseForm.css';

class ForkExerciseForm extends Component {
  viewForkedExercise() {
    const {
      forkedExerciseId: id,
      push,
      links: { EXERCISE_URI_FACTORY }
    } = this.props;

    const url = EXERCISE_URI_FACTORY(id);
    push(url);
  }

  render() {
    const {
      forkStatus,
      anyTouched,
      submitting,
      handleSubmit,
      submitFailed,
      submitSucceeded,
      invalid,
      groups,
      groupsAccessor,
      intl: { locale }
    } = this.props;

    switch (forkStatus) {
      case forkStatuses.FULFILLED:
        return (
          <Button
            bsStyle="success"
            bsSize="sm"
            className="btn-flat"
            onClick={() => this.viewForkedExercise()}
          >
            <SuccessIcon gapRight />
            <FormattedMessage
              id="app.forkExerciseButton.success"
              defaultMessage="Show the forked exercise"
            />
          </Button>
        );
      default:
        return (
          <div>
            {submitFailed &&
              <Alert bsStyle="danger">
                <WarningIcon gapRight />
                <FormattedMessage
                  id="generic.savingFailed"
                  defaultMessage="Saving failed. Please try again later."
                />
              </Alert>}
            <Form inline className="forkForm">
              <ResourceRenderer resource={groups.toArray()}>
                {(...groups) =>
                  <Field
                    name={'groupId'}
                    component={SelectField}
                    label={''}
                    options={groups
                      .map(group => ({
                        key: group.id,
                        name: getGroupCanonicalLocalizedName(
                          group,
                          groupsAccessor,
                          locale
                        )
                      }))
                      .sort((a, b) => a.name.localeCompare(b.name, locale))}
                  />}
              </ResourceRenderer>

              <SubmitButton
                id="forkExercise"
                invalid={invalid}
                submitting={submitting}
                hasSucceeded={submitSucceeded}
                dirty={anyTouched}
                hasFailed={submitFailed}
                handleSubmit={handleSubmit}
                defaultIcon={<Icon icon="code-branch" gapRight />}
                messages={{
                  submit: (
                    <FormattedMessage
                      id="app.forkExerciseForm.submit"
                      defaultMessage="Fork exercise"
                    />
                  ),
                  submitting: (
                    <FormattedMessage
                      id="app.forkExerciseForm.submitting"
                      defaultMessage="Forking ..."
                    />
                  ),
                  success: (
                    <FormattedMessage
                      id="app.forkExerciseForm.success"
                      defaultMessage="Exercise forked"
                    />
                  )
                }}
              />
            </Form>
          </div>
        );
    }
  }
}

ForkExerciseForm.propTypes = {
  exerciseId: PropTypes.string.isRequired,
  forkId: PropTypes.string.isRequired,
  forkStatus: PropTypes.string,
  forkedExerciseId: PropTypes.string,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object,
  groups: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

const mapStateToProps = (state, { exerciseId, forkId }) => {
  const fork = getFork(exerciseId, forkId)(state);
  return {
    forkStatus: fork ? fork.status : null,
    forkedExerciseId:
      fork && fork.status === forkStatuses.FULFILLED ? fork.exerciseId : null
  };
};

const mapDispatchToProps = (dispatch, { exerciseId, forkId }) => ({
  push: url => dispatch(push(url))
});

const validate = () => {};

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(
    reduxForm({
      form: 'forkExercise',
      validate
    })(injectIntl(ForkExerciseForm))
  )
);
