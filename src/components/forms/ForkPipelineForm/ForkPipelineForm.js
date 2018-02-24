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
import { SuccessIcon } from '../../../components/icons';
import { forkStatuses } from '../../../redux/modules/pipelines';
import { getFork } from '../../../redux/selectors/pipelines';
import ResourceRenderer from '../../helpers/ResourceRenderer';

import withLinks from '../../../helpers/withLinks';

import './ForkPipelineForm.css';

class ForkPipelineForm extends Component {
  viewForkedPipeline() {
    const {
      forkedPipelineId: id,
      push,
      links: { PIPELINE_URI_FACTORY }
    } = this.props;

    const url = PIPELINE_URI_FACTORY(id);
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
      exercises,
      intl
    } = this.props;

    switch (forkStatus) {
      case forkStatuses.FULFILLED:
        return (
          <Button
            bsStyle="success"
            bsSize="sm"
            className="btn-flat"
            onClick={() => this.viewForkedPipeline()}
          >
            <SuccessIcon />{' '}
            <FormattedMessage
              id="app.forkPipelineButton.success"
              defaultMessage="Show the forked pipeline"
            />
          </Button>
        );
      default:
        return (
          <div>
            {submitFailed &&
              <Alert bsStyle="danger">
                <FormattedMessage
                  id="app.forkPipelineForm.failed"
                  defaultMessage="Saving failed. Please try again later."
                />
              </Alert>}
            <Form inline className="formSpace">
              <ResourceRenderer resource={exercises.toArray()}>
                {(...exercises) =>
                  <Field
                    name={'exerciseId'}
                    component={SelectField}
                    label={''}
                    options={[{ key: '', name: '_Public_' }].concat(
                      exercises
                        .sort((a, b) =>
                          a.name.localeCompare(b.name, intl.locale)
                        )
                        .filter((item, pos, arr) => arr.indexOf(item) === pos)
                        .map(exercise => ({
                          key: exercise.id,
                          name: exercise.name
                        }))
                    )}
                  />}
              </ResourceRenderer>

              <SubmitButton
                id="forkPipeline"
                invalid={invalid}
                submitting={submitting}
                hasSucceeded={submitSucceeded}
                dirty={anyTouched}
                hasFailed={submitFailed}
                handleSubmit={handleSubmit}
                noIcons
                messages={{
                  submit: (
                    <FormattedMessage
                      id="app.forkPipelineForm.submit"
                      defaultMessage="Fork pipeline"
                    />
                  ),
                  submitting: (
                    <FormattedMessage
                      id="app.forkPipelineForm.submitting"
                      defaultMessage="Forking ..."
                    />
                  ),
                  success: (
                    <FormattedMessage
                      id="app.forkPipelineForm.success"
                      defaultMessage="Pipeline forked"
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

ForkPipelineForm.propTypes = {
  pipelineId: PropTypes.string.isRequired,
  forkId: PropTypes.string.isRequired,
  forkStatus: PropTypes.string,
  forkedPipelineId: PropTypes.string,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object,
  exercises: ImmutablePropTypes.map,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

const mapStateToProps = (state, { pipelineId, forkId }) => {
  const fork = getFork(pipelineId, forkId)(state);
  return {
    forkStatus: fork ? fork.status : null,
    forkedPipelineId:
      fork && fork.status === forkStatuses.FULFILLED ? fork.pipelineId : null
  };
};

const mapDispatchToProps = (dispatch, { pipelineId, forkId }) => ({
  push: url => dispatch(push(url))
});

const validate = () => {};

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(
    reduxForm({
      form: 'forkPipeline',
      validate
    })(injectIntl(ForkPipelineForm))
  )
);
