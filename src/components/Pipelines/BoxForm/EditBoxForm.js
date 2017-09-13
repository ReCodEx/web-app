import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import BoxForm from './BoxForm';
import { getBoxTypes } from '../../../redux/selectors/boxes';
import { createBoxFromFormInputs } from '../../../helpers/boxes';

const EditBoxForm = ({ item, edit, onHide, boxTypes, onDelete, ...props }) =>
  item
    ? <BoxForm
        {...props}
        title={
          <FormattedMessage
            id="app.pipelineEditor.EditBoxForm.title"
            defaultMessage="Edit the box '{name}'"
            values={{ name: item.name }}
          />
        }
        show={Boolean(item)}
        initialValues={item}
        onHide={onHide}
        onSubmit={data => {
          const box = createBoxFromFormInputs(data, boxTypes);
          edit(box);
          onHide();
        }}
        onDelete={() => {
          onDelete();
          onHide();
        }}
      />
    : null;

EditBoxForm.propTypes = {
  item: PropTypes.object,
  boxTypes: PropTypes.array.isRequired,
  edit: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  boxTypes: getBoxTypes(state)
});

export default connect(mapStateToProps)(EditBoxForm);
