import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import BoxForm from './BoxForm';
import { getBoxTypes } from '../../../redux/selectors/boxes';

const AddBoxForm = ({ add, onHide, boxTypes, ...props }) =>
  <BoxForm
    {...props}
    title={
      <FormattedMessage
        id="app.pipelineEditor.AddBoxForm.title"
        defaultMessage="Add a box"
      />
    }
    onSubmit={({ name, portsIn = {}, portsOut = {}, type }) => {
      const boxType = boxTypes.find(box => box.type === type);
      if (!boxType) {
        throw new Error('No box type was selected.');
      }

      const allowedPortsIn = Object.keys(boxType.portsIn);
      const allowedPortsOut = Object.keys(boxType.portsOut);

      portsIn = allowedPortsIn.reduce(
        (acc, port) => ({
          ...acc,
          [port]: {
            type:
              boxType.portsIn[port].type === '?'
                ? 'string'
                : boxType.portsIn[port].type,
            ...portsIn[port]
          }
        }),
        {}
      );

      portsOut = allowedPortsOut.reduce(
        (acc, port) => ({
          ...acc,
          [port]: {
            type:
              boxType.portsOut[port].type === '?'
                ? 'string'
                : boxType.portsOut[port].type,
            ...portsOut[port]
          }
        }),
        {}
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
