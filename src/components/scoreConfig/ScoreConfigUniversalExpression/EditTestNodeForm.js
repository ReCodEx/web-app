import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { FormSelect, Table } from 'react-bootstrap';
import classnames from 'classnames';

import StandaloneRadioField from '../../forms/StandaloneRadioInput';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import InsetPanel from '../../widgets/InsetPanel';
import { CloseIcon, SaveIcon } from '../../icons';
import { AstNode, AstNodeTestResult } from '../../../helpers/exercise/scoreAst.js';

import * as formStyles from '../../forms/Fields/commonStyles.less';

class EditTestNodeForm extends Component {
  state = {
    node: null,
    parent: null,
    selected: null,
  };

  static getDerivedStateFromProps({ node = null, parent = null }, state) {
    // If the node or the parent have changed, the previous selection should be forgotten (form is reset)
    return node !== state.node || parent !== state.parent
      ? {
          node,
          parent,
          selected: null,
        }
      : null;
  }

  dirty = () => {
    const { node = null } = this.props;
    return this.state.selected && this.state.selected !== (node && String(node.test));
  };

  save = () => {
    const { node = null, parent = null, close } = this.props;
    if (this.dirty()) {
      const newNode = new AstNodeTestResult();
      newNode.test = Number(this.state.selected);
      if (node) {
        node.supplant(newNode);
      } else if (parent) {
        parent.appendChild(newNode);
      }
    }
    close();
  };

  render() {
    const { node = null, tests, close } = this.props;
    const selected = this.state.selected || (node && String(node.test));

    return (
      <>
        <InsetPanel>
          <FormattedMessage
            id="app.scoreConfigExpression.editTestDialog.description"
            defaultMessage="The value of the test result node is the actual score assigned by the judge to the selected test. Normally, the judge assigns value 1 to passed tests and 0 to failed tests; however, a custom judge may score any real value from [0,1] range. Please select the corresponding test."
          />
        </InsetPanel>

        {tests.length > 10 ? (
          <FormSelect
            className={classnames({
              'form-control': true,
              [formStyles.dirty]: this.dirty(),
              'w-100': true,
            })}
            onChange={ev => ev.target && ev.target.value && this.setState({ selected: ev.target.value })}>
            {tests.map(({ id, name }) => (
              <option value={String(id)} key={id}>
                {name}
              </option>
            ))}
          </FormSelect>
        ) : (
          <Table hover>
            <tbody>
              {tests.map(test => (
                <tr
                  key={test.id}
                  onClick={() => this.setState({ selected: String(test.id) })}
                  className={classnames({
                    'bg-info': (node && node.test) === test.id,
                  })}>
                  <td className="align-middle shrink-col">
                    <StandaloneRadioField
                      name="test"
                      value={String(test.id)}
                      checked={String(test.id) === selected}
                      onChange={() => this.setState({ selected: String(test.id) })}
                    />
                  </td>
                  <td>{test.name}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <hr />

        <div className="text-center">
          <TheButtonGroup>
            <Button onClick={this.save} variant="success" disabled={tests.length === 0 || !this.dirty()}>
              <SaveIcon gapRight={2} />
              <FormattedMessage id="generic.save" defaultMessage="Save" />
            </Button>
            <Button onClick={close} variant="outline-secondary">
              <CloseIcon gapRight={2} />
              <FormattedMessage id="generic.close" defaultMessage="Close" />
            </Button>
          </TheButtonGroup>
        </div>
      </>
    );
  }
}

EditTestNodeForm.propTypes = {
  node: PropTypes.instanceOf(AstNode),
  parent: PropTypes.object,
  tests: PropTypes.array.isRequired,
  close: PropTypes.func.isRequired,
};

export default EditTestNodeForm;
