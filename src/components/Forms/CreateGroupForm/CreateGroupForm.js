import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import FormBox from '../../AdminLTE/FormBox';
import { Form, FormGroup, Label, FormControl } from 'react-bootstrap';
import { Field } from 'redux-form';
import { LoadingIcon, SendIcon } from '../../Icons';

const CreateGroupForm = ({
  handleSubmit,
  invalid = false,
  submitting = false
}) => (
  <Form onSubmit={handleSubmit}>
    <FormGroup>
      <Label><FormattedMessage id='app.createGroup.groupName' defaultMessage='Name:' /></Label>
      <FormControl type='input' name='name' />
    </FormGroup>
    <FormGroup>
      <Button
        type='submit'
        disabled={invalid}
        bsStyle={invalid ? 'default' : 'success'}>
        {submitting && (
          <span><LoadingIcon /> <FormattedMessage id='app.createGroup.creating' defaultMessage='Creating group ...' /></span>
        )}
        {!submitting && (
          <span><SendIcon /> <FormattedMessage id='app.createGroup.createGroup' defaultMessage='Create new group' /></span>
        )}
      </Button>
    </FormGroup>
  </Form>
);

CreateGroupForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default CreateGroupForm;
