import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reset } from 'redux-form';

import AddLicenceForm from '../../components/forms/AddLicenceForm';
import { addLicence } from '../../redux/modules/licences';

const AddLicenceFormContainer = ({ addLicence }) => (
  <AddLicenceForm onSubmit={addLicence} />
);

AddLicenceFormContainer.propTypes = {
  instanceId: PropTypes.string.isRequired,
  addLicence: PropTypes.func.isRequired
};

export default connect(null, (dispatch, { instanceId }) => ({
  addLicence: ({ note, validUntil }) =>
    dispatch(
      addLicence(instanceId, {
        isValid: true,
        note,
        validUntil: validUntil.unix()
      })
    ).then(() => dispatch(reset('addLicence')))
}))(AddLicenceFormContainer);
