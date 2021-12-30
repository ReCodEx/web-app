import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Container, Row, Col } from 'react-bootstrap';

import { TextField, MarkdownTextAreaField, CheckboxField } from '../Fields';
import { SaveIcon } from '../../icons';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';

class EditPipelineForm extends Component {
  render() {
    const {
      isSuperadmin = false,
      dirty,
      submitting,
      handleSubmit,
      submitFailed,
      submitSucceeded,
      invalid,
    } = this.props;
    return (
      <FormBox
        title={<FormattedMessage id="app.editPipelineForm.title" defaultMessage="Pipeline Metadata" />}
        succeeded={submitSucceeded}
        dirty={dirty}
        footer={
          <div className="text-center">
            <SubmitButton
              id="editPipeline"
              invalid={invalid}
              submitting={submitting}
              dirty={dirty}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              handleSubmit={handleSubmit}
              defaultIcon={<SaveIcon gapRight />}
              messages={{
                submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
                submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
                success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
              }}
            />
          </div>
        }>
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
                    defaultMessage="Detailed description (for exercise authors):"
                  />
                }
              />
            </Col>
          </Row>

          {isSuperadmin && (
            <>
              <hr />

              <Row>
                <Col lg={12}>
                  <Field
                    name="global"
                    component={CheckboxField}
                    onOff
                    label={
                      <FormattedMessage
                        id="app.editPipelineForm.global"
                        defaultMessage="Global pipeline associated with particular runtime environments"
                      />
                    }
                  />
                </Col>
              </Row>

              <hr className="mt-0" />

              <Row>
                <Col xl={6} lg={12}>
                  <Field
                    name="parameters.isCompilationPipeline"
                    component={CheckboxField}
                    onOff
                    label={
                      <FormattedMessage id="app.editPipelineForm.isCompilationPipeline" defaultMessage="Compilation" />
                    }
                  />
                </Col>
                <Col xl={6} lg={12}>
                  <Field
                    name="parameters.isExecutionPipeline"
                    component={CheckboxField}
                    onOff
                    label={
                      <FormattedMessage id="app.editPipelineForm.isExecutionPipeline" defaultMessage="Execution" />
                    }
                  />
                </Col>
                <Col xl={6} lg={12}>
                  <Field
                    name="parameters.judgeOnlyPipeline"
                    component={CheckboxField}
                    onOff
                    label={<FormattedMessage id="app.editPipelineForm.judgeOnlyPipeline" defaultMessage="Judge-Only" />}
                  />
                </Col>
                <Col xl={6} lg={12}>
                  <Field
                    name="parameters.producesStdout"
                    component={CheckboxField}
                    onOff
                    label={
                      <FormattedMessage id="app.editPipelineForm.producesStdout" defaultMessage="Produces std. out" />
                    }
                  />
                </Col>
                <Col xl={6} lg={12}>
                  <Field
                    name="parameters.producesFiles"
                    component={CheckboxField}
                    onOff
                    label={
                      <FormattedMessage
                        id="app.editPipelineForm.producesFiles"
                        defaultMessage="Produces output files"
                      />
                    }
                  />
                </Col>
                <Col xl={6} lg={12}>
                  <Field
                    name="parameters.hasEntryPoint"
                    component={CheckboxField}
                    onOff
                    label={
                      <FormattedMessage id="app.editPipelineForm.hasEntryPoint" defaultMessage="Has entry-point" />
                    }
                  />
                </Col>
                <Col xl={6} lg={12}>
                  <Field
                    name="parameters.hasExtraFiles"
                    component={CheckboxField}
                    onOff
                    label={
                      <FormattedMessage id="app.editPipelineForm.hasExtraFiles" defaultMessage="Has extra files" />
                    }
                  />
                </Col>
              </Row>
            </>
          )}
        </Container>
      </FormBox>
    );
  }
}

EditPipelineForm.propTypes = {
  isSuperadmin: PropTypes.bool,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
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

export default reduxForm({
  form: 'editPipeline',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate,
})(EditPipelineForm);
