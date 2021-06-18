import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { reduxForm, Field, touch, formValueSelector } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert, Container, Row, Col } from 'react-bootstrap';

import { TextField, MarkdownTextAreaField, PipelineField, PipelineVariablesField } from '../Fields';

import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import { validatePipeline } from '../../../redux/modules/pipelines';
import { extractVariables } from '../../../helpers/boxes';
import { fetchSupplementaryFilesForPipeline } from '../../../redux/modules/pipelineFiles';
import { createGetPipelineFiles } from '../../../redux/selectors/pipelineFiles';

class EditPipelineForm extends Component {
  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.pipeline.id !== prevProps.pipeline.id) {
      this.props.loadAsync();
    }
  }

  render() {
    const {
      initialValues: pipeline,
      anyTouched,
      submitting,
      handleSubmit,
      submitFailed,
      submitSucceeded,
      variables = [],
      invalid,
      asyncValidating,
      supplementaryFiles,
    } = this.props;
    return (
      <FormBox
        title={
          <FormattedMessage
            id="app.editPipelineForm.title"
            defaultMessage="Edit pipeline {name}"
            values={{ name: pipeline.name }}
          />
        }
        succeeded={submitSucceeded}
        dirty={anyTouched}
        footer={
          <div className="text-center">
            <SubmitButton
              id="editPipeline"
              invalid={invalid}
              submitting={submitting}
              dirty={anyTouched}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              handleSubmit={handleSubmit}
              asyncValidating={asyncValidating}
              messages={{
                submit: <FormattedMessage id="app.editPipelineForm.submit" defaultMessage="Save changes" />,
                submitting: (
                  <FormattedMessage id="app.editPipelineForm.submitting" defaultMessage="Saving changes..." />
                ),
                success: <FormattedMessage id="app.editPipelineForm.success" defaultMessage="Settings were saved." />,
                validating: <FormattedMessage id="generic.validating" defaultMessage="Validating..." />,
              }}
            />
          </div>
        }>
        {submitFailed && (
          <Alert variant="danger">
            <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
          </Alert>
        )}

        <Container fluid>
          <Row>
            <Col lg={12}>
              <Field
                name="name"
                component={TextField}
                maxLength={255}
                label={<FormattedMessage id="app.editPipelineForm.name" defaultMessage="Pipeline name:" />}
              />

              <Field
                name="description"
                component={MarkdownTextAreaField}
                label={
                  <FormattedMessage
                    id="app.editPipelineForm.description"
                    defaultMessage="Description for supervisors:"
                  />
                }
              />
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Field
                name="pipeline.boxes"
                component={PipelineField}
                label={<FormattedMessage id="app.editPipelineFields.pipeline" defaultMessage="The pipeline:" />}
              />
            </Col>

            <Col lg={12}>
              <Field
                name="pipeline.variables"
                component={PipelineVariablesField}
                variables={variables}
                label={
                  <FormattedMessage
                    id="app.editPipelineFields.pipelineVariables"
                    defaultMessage="Pipeline variables:"
                  />
                }
                supplementaryFiles={supplementaryFiles}
              />
            </Col>
          </Row>
        </Container>
      </FormBox>
    );
  }
}

EditPipelineForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  variables: PropTypes.array,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  supplementaryFiles: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  pipeline: PropTypes.object,
};

const validate = ({ name, description }) => {
  const errors = {};

  if (!name) {
    errors.name = (
      <FormattedMessage
        id="app.editPipelineForm.validation.emptyName"
        defaultMessage="Please fill the name of the pipeline."
      />
    );
  }

  if (!description) {
    errors.description = (
      <FormattedMessage
        id="app.editPipelineForm.validation.description"
        defaultMessage="Please fill the description of the pipeline."
      />
    );
  }

  return errors;
};

const asyncValidate = (values, dispatch, { initialValues: { id, version } }) =>
  new Promise((resolve, reject) =>
    dispatch(validatePipeline(id, version))
      .then(res => res.value)
      .then(({ versionIsUpToDate }) => {
        const errors = {};
        if (versionIsUpToDate === false) {
          errors.name = (
            <FormattedMessage
              id="app.editPipelineForm.validation.versionDiffers"
              defaultMessage="Somebody has changed the pipeline while you have been editing it. Please reload the page and apply your changes once more."
            />
          );
          dispatch(touch('editPipeline', 'name'));
        }

        if (Object.keys(errors).length > 0) {
          throw errors;
        }
      })
      .then(resolve())
      .catch(errors => reject(errors))
  );

export default connect(
  (state, { pipeline }) => ({
    variables: extractVariables(formValueSelector('editPipeline')(state, 'pipeline.boxes')),
    supplementaryFiles: createGetPipelineFiles(pipeline.supplementaryFilesIds)(state),
  }),
  (dispatch, { pipeline }) => ({
    loadAsync: () => dispatch(fetchSupplementaryFilesForPipeline(pipeline.id)),
  })
)(
  reduxForm({
    form: 'editPipeline',
    validate,
    asyncValidate,
  })(EditPipelineForm)
);
