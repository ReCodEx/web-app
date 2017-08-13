import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import BoxForm from './BoxForm';

const AddBoxForm = ({ add, onHide, ...props }) =>
  <BoxForm
    {...props}
    title={
      <FormattedMessage
        id="app.pipelineEditor.AddBoxForm.title"
        defaultMessage="Add a box"
      />
    }
    onSubmit={({ name, portsIn = {}, portsOut = {}, type }) => {
      add(name, portsIn, portsOut, type);
      onHide();
    }}
    onHide={onHide}
    onDelete={() => {
      onHide();
    }}
  />;

AddBoxForm.propTypes = {
  add: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired
};

export default AddBoxForm;
