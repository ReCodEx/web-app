import React from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import { connect } from 'react-redux';
import { reduxForm, Field, touch, formValueSelector } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert, Row, Col } from 'react-bootstrap';

import {
  TextField,
  MarkdownTextAreaField,
  PipelineField,
  PipelineVariablesField
} from '../Fields';

import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import { validatePipeline } from '../../../redux/modules/pipelines';

if (canUseDOM) {
  require('codemirror/mode/yaml/yaml');
}

const EditPipelineForm = ({
  initialValues: pipeline,
  anyTouched,
  submitting,
  handleSubmit,
  submitFailed: hasFailed,
  submitSucceeded: hasSucceeded,
  variables = [],
  invalid,
  asyncValidating
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.editPipelineForm.title"
        defaultMessage="Edit pipeline {name}"
        values={{ name: pipeline.name }}
      />
    }
    succeeded={hasSucceeded}
    dirty={anyTouched}
    footer={
      <div className="text-center">
        <SubmitButton
          id="editPipeline"
          invalid={invalid}
          submitting={submitting}
          dirty={anyTouched}
          hasSucceeded={hasSucceeded}
          hasFailed={hasFailed}
          handleSubmit={handleSubmit}
          asyncValidating={asyncValidating}
          messages={{
            submit: (
              <FormattedMessage
                id="app.editPipelineForm.submit"
                defaultMessage="Save changes"
              />
            ),
            submitting: (
              <FormattedMessage
                id="app.editPipelineForm.submitting"
                defaultMessage="Saving changes ..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.editPipelineForm.success"
                defaultMessage="Settings were saved."
              />
            ),
            validating: (
              <FormattedMessage
                id="app.editPipelineForm.validating"
                defaultMessage="Validating..."
              />
            )
          }}
        />
      </div>
    }
  >
    {hasFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.editPipelineForm.failed"
          defaultMessage="Saving failed. Please try again later."
        />
      </Alert>}

    <Row>
      <Col lg={6}>
        <Field
          name="name"
          component={TextField}
          label={
            <FormattedMessage
              id="app.editPipelineForm.name"
              defaultMessage="Pipeline name:"
            />
          }
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
      <Col lg={6}>
        <Field
          name="pipeline.boxes"
          component={PipelineField}
          label={
            <FormattedMessage
              id="app.editPipelineFields.pipeline"
              defaultMessage="The pipeline:"
            />
          }
        />

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
        />
      </Col>
    </Row>
  </FormBox>;

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
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

const validate = ({ name, description }) => {
  const errors = {};

  if (!name) {
    errors['name'] = (
      <FormattedMessage
        id="app.editPipelineForm.validation.emptyName"
        defaultMessage="Please fill the name of the pipeline."
      />
    );
  }

  if (!description) {
    errors['description'] = (
      <FormattedMessage
        id="app.editPipelineForm.validation.description"
        defaultMessage="Please fill the description of the pipeline."
      />
    );
  }

  return errors;
};

const asyncValidate = (values, dispatch, { initialValues: { id, version } }) =>
  dispatch(validatePipeline(id, version))
    .then(res => res.value)
    .then(({ versionIsUpToDate }) => {
      var errors = {};
      if (versionIsUpToDate === false) {
        errors['name'] = (
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
    });

const flattenPorts = boxes =>
  boxes.reduce(
    (acc, ports) => [
      ...acc,
      ...Object.keys(ports).map(port => ({
        name: port,
        value: btoa(ports[port].value)
      }))
    ],
    []
  );

const extractVariables = (boxes = []) => {
  const inputs = flattenPorts(
    boxes.map(box => box.portsIn).filter(ports => ports)
  );

  // remove duplicities
  return inputs.reduce(
    (acc, port) =>
      !acc.find(item => item.name === port.name) ? [...acc, port] : acc,
    []
  );
};

const mapStateToProps = state => ({
  variables: extractVariables(
    formValueSelector('editPipeline')(state, 'pipeline.boxes')
  )
});

export default connect(mapStateToProps)(
  reduxForm({
    form: 'editPipeline',
    validate,
    asyncValidate
  })(EditPipelineForm)
);
