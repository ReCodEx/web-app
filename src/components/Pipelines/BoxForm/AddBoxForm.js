import React from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import BoxForm from "./BoxForm";

const AddBoxForm = ({ add }) =>
  <BoxForm
    title={
      <FormattedMessage
        id="app.pipelineEditor.AddBoxForm.title"
        defaultMessage="Add a box"
      />
    }
    onSubmit={({ name, portsIn = {}, portsOut = {}, type }) =>
      add(name, portsIn, portsOut, type)}
  />;

AddBoxForm.propTypes = {
  add: PropTypes.func.isRequired
};

export default AddBoxForm;
