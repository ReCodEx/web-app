import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import BoxForm from './BoxForm';
import { getBoxTypes } from '../../../redux/selectors/boxes';
import { createBoxFromFormInputs } from '../../../helpers/boxes';

const AddBoxForm = ({ add, onHide, boxTypes, ...props }) =>
  <BoxForm
    {...props}
    title={
      <FormattedMessage
        id="app.pipelineEditor.AddBoxForm.title"
        defaultMessage="Add a box"
      />
    }
    onSubmit={data => {
      const { name, portsIn, portsOut, type } = createBoxFromFormInputs(
        data,
        boxTypes
      );
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
  onHide: PropTypes.func.isRequired,
  boxTypes: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  boxTypes: getBoxTypes(state)
});

export default connect(mapStateToProps)(AddBoxForm);
