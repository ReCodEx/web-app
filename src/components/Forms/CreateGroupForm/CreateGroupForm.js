import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import FormBox from '../../AdminLTE/FormBox';
import { Alert, Button } from 'react-bootstrap';
import { TextField, MarkdownTextAreaField } from '../Fields';
import { LoadingIcon, SuccessIcon, SendIcon } from '../../Icons';
import { validateAddGroup } from '../../../redux/modules/groups';

class CreateGroupForm extends Component {

  componentWillReceiveProps(newProps) {
    if (!this.props.submitSucceeded && newProps.submitSucceeded === true) {
      console.log(newProps);
      setTimeout(newProps.reset, 600);
    }
  }

  render() {
    const {
      title = <FormattedMessage id='app.createGroupForm.title' defaultMessage='Create new group' />,
      handleSubmit,
      reset,
      submitSucceeded = false,
      submitFailed = false,
      invalid = false,
      submitting = false,
      instanceId,
      parentGroupId = undefined
    } = this.props;
    return (
      <FormBox
        title={title}
        type={submitSucceeded ? 'success' : undefined}
        footer={
          <div className='text-center'>
            <Button
              type='submit'
              bsStyle='success'
              className='btn-flat'
              onClick={handleSubmit}
              tabIndex={3}
              disabled={invalid || submitting || submitSucceeded}>
              {!submitting
                ? submitSucceeded
                  ? <span><SuccessIcon /> &nbsp; <FormattedMessage id='app.createGroupForm.success' defaultMessage='Group has been created' /></span>
                  : <FormattedMessage id='app.createGroupForm.createGroup' defaultMessage='Create new group' />
                : <span><LoadingIcon /> &nbsp; <FormattedMessage id='app.createGroupForm.processing' defaultMessage='Group is being created ...' /></span>}
            </Button>
          </div>
        }>
        {submitFailed && (
          <Alert bsStyle='danger'>
            <FormattedMessage id='app.createGroupForm.failed' defaultMessage="We are sorry but we weren't able to create a new group." />
          </Alert>)}

        <Field
          name='name'
          tabIndex={1}
          component={TextField}
          required
          label={<FormattedMessage id='app.createGroup.groupName' defaultMessage='Name:' />}
        />
        <Field
          name='description'
          tabIndex={2}
          component={MarkdownTextAreaField}
          required
          label={<FormattedMessage id='app.createGroup.groupDescription' defaultMessage='Description:' />}
        />
      </FormBox>
    );
  }
}

CreateGroupForm.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]),
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  instanceId: PropTypes.string.isRequired,
  parentGroupId: PropTypes.string
};

const validate = ({ name, description }) => {
  const errors = {};

  if (!name || name.length === 0) {
    errors['name'] = <FormattedMessage id='app.createGroup.validation.emptyName' defaultMessage='Group name cannot be empty.' />;
  }

  if (!description || description.length === 0) {
    errors['description'] = <FormattedMessage id='app.createGroup.validation.emptyDescription' defaultMessage='Group description cannot be empty.' />;
  }

  return errors;
};

const asyncValidate = ({ name }, dispatch, { instanceId, parentGroupId = undefined }) =>
  dispatch(validateAddGroup(name, instanceId, parentGroupId))
    .then(res => res.value)
    .then(({ groupNameIsFree }) => {
      var errors = {};

      if (!groupNameIsFree) {
        errors['name'] = <FormattedMessage id='app.createGroup.validation.nameCollision' defaultMessage='The name "{name}" is already used, please choose a different one.' values={{ name }} />;
      }

      if (Object.keys(errors).length > 0) {
        throw errors;
      }
    });

export default reduxForm({
  form: 'createGroup',
  validate,
  asyncValidate
})(CreateGroupForm);
