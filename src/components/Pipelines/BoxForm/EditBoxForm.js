import React, { Component } from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import BoxForm from "./BoxForm";

const EditBoxForm = ({ item, edit }) =>
  <BoxForm
    title={
      <FormattedMessage
        id="app.pipelineEditor.EditBoxForm.title"
        defaultMessage="Edit the box"
      />
    }
    initialValues={item}
    onSubmit={edit}
  />;

EditBoxForm.propTypes = {
  item: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired
};

export default EditBoxForm;
