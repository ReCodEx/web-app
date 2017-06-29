import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock
} from 'react-bootstrap';

import Box from '../../widgets/Box';
import Button from '../../widgets/FlatButton';

class AddBoxForm extends Component {
  static initialState = {
    name: '',
    portsIn: [''],
    portsOut: [''],
    type: null,
    touched: false
  };
  state = AddBoxForm.initialState;

  changeName = name => this.setState({ name: name.trim(), touched: true });
  changePortIn = (i, port) => {
    const { portsIn } = this.state;
    portsIn[i] = port.trim();
    if (i === portsIn.length - 1) {
      portsIn.push('');
    }
    this.setState({ portsIn });
  };
  changePortOut = (i, port) => {
    const { portsOut } = this.state;
    portsOut[i] = port.trim();
    if (i === portsOut.length - 1) {
      portsOut.push('');
    }
    this.setState({ portsOut });
  };

  addBox = () => {
    const { add } = this.props;
    const { name, portsIn, portsOut, type } = this.state;
    add(
      name,
      portsIn.filter(port => port.length > 0),
      portsOut.filter(port => port.length > 0),
      type
    );
    this.setState(AddBoxForm.initialState);
  };

  render() {
    const { touched, name, portsIn, portsOut, type } = this.state;
    return (
      <Box
        title={
          <FormattedMessage
            id="app.pipelineEditor.addBoxForm.title"
            defaultMessage="Add a box"
          />
        }
        footer={
          <p className="text-center">
            <Button
              bsStyle="success"
              disabled={name.length === 0}
              onClick={this.addBox}
            >
              <FormattedMessage
                id="app.pipelineEditor.addBoxForm.add"
                defaultMessage="Add"
              />
            </Button>
          </p>
        }
        solid
      >
        <div>
          <Row>
            <Col sm={12}>
              <FormGroup
                controlId={'name'}
                validationState={
                  touched && name.length === 0 ? 'error' : undefined
                }
              >
                <ControlLabel>
                  <FormattedMessage
                    id="app.pipelineEditor.addBoxForm.name"
                    defaultMessage="Box name"
                  />
                </ControlLabel>
                <FormControl
                  componentClass="input"
                  onChange={e => this.changeName(e.target.value)}
                  onBlur={e => this.changeName(e.target.value)}
                />
                {touched &&
                  name.length === 0 &&
                  <HelpBlock>
                    <FormattedMessage
                      id="app.pipelineEditor.addBoxForm.emptyName"
                      defaultMessage="Name cannot be empty."
                    />
                  </HelpBlock>}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup controlId={'portsIn'}>
                <ControlLabel>
                  <FormattedMessage
                    id="app.pipelineEditor.addBoxForm.portsIn"
                    defaultMessage="Inputs"
                  />
                </ControlLabel>
                {portsIn.map((port, i) =>
                  <FormControl
                    key={i}
                    componentClass="input"
                    onChange={e => this.changePortIn(i, e.target.value)}
                  />
                )}
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup controlId={'portsOut'}>
                <ControlLabel>
                  <FormattedMessage
                    id="app.pipelineEditor.addBoxForm.portsOut"
                    defaultMessage="Outputs"
                  />
                </ControlLabel>
                {portsOut.map((port, i) =>
                  <FormControl
                    key={i}
                    componentClass="input"
                    onChange={e => this.changePortOut(i, e.target.value)}
                  />
                )}
              </FormGroup>
            </Col>
          </Row>
        </div>
      </Box>
    );
  }
}

AddBoxForm.propTypes = {
  add: PropTypes.func.isRequired
};

export default AddBoxForm;
