import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import FormBox from '../../AdminLTE/FormBox';
import { Form, FormGroup, Label, FormControl } from 'react-bootstrap';
import { TextField } from '../Fields';
import { LoadingIcon, SendIcon } from '../../Icons';

const CreateGroupForm = ({
  handleSubmit,
  invalid = false,
  submitting = false
}) => (
  <FormBox onSubmit={handleSubmit}>
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
  </FormBox>
);

CreateGroupForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default CreateGroupForm;
