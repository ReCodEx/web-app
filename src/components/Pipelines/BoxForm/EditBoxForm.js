import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import BoxForm from './BoxForm';

class EditBoxForm extends Component {
  editBox = ({ portsIn, portsOut, ...data }) => {
    const { edit } = this.props;
    edit(
      portsIn.filter(port => port.length > 0),
      portsOut.filter(port => port.length > 0),
      ...data
    );
  };

  render = () =>
    <BoxForm
      title={
        <FormattedMessage
          id="app.pipelineEditor.BoxForm.title"
          defaultMessage="Add a box"
        />
      }
      data={this.props.item}
      onSubmit={this.editBox}
    />;
}

EditBoxForm.propTypes = {
  item: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired
};

export default EditBoxForm;
