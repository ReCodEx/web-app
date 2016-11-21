import React, { PropTypes, Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Alert, Button, Tabs, Tab } from 'react-bootstrap';
import Confirm from '../Confirm';
import { AddIcon, WarningIcon } from '../../Icons';

class TabbedArrayField extends Component {

  state = { activeTab: 0 };
  changeTab = (n) => this.setState({ activeTab: n });
  add = () => {
    const { fields } = this.props;
    fields.push(); // add an empty item
    this.changeTab(fields.length);
  };

  render() {
    const {
      id,
      ContentComponent,
      getTitle = (i) => i,
      emptyMessage = <FormattedMessage id='app.tabbedArrayField.empty' defaultMessage='There is currently no item.' />,
      addMessage = <FormattedMessage id='app.tabbedArrayField.add' defaultMessage='Add another' />,
      removeQuestion = <FormattedMessage id='app.tabbedArrayField.reallyRemoveQuestion' defaultMessage='Do you really want to delete this item?' />,
      add = false,
      remove = false,
      fields,
      ...props
    } = this.props;

    return (
      <div>
        {add && (
          <p>
            <Button bsStyle='success' className='btn-flat' bsSize='sm' onClick={() => this.add()}>
              <AddIcon /> {addMessage}
            </Button>
          </p>
        )}
        {fields.length > 0 && (
          <Tabs
            id={id}
            className='nav-tabs-custom'
            activeKey={this.state.activeTab}
            onSelect={this.changeTab}>
            {fields.map((prefix, i) => (
              <Tab key={i} eventKey={i} title={getTitle(i)}>
                <ContentComponent {...props} i={i} prefix={prefix} />
                {remove && (
                  <p className='text-center'>
                    <Confirm
                      id={`${id}-remove-${i}`}
                      question={removeQuestion}
                      onConfirmed={() => { fields.remove(i); this.changeTab(Math.min(i, fields.length - 2)); }}>
                      <Button bsStyle='default'>
                        <WarningIcon /> <FormattedMessage id='app.tabbedArrayField.remove' defaultMessage='Remove' />
                      </Button>
                    </Confirm>
                  </p>
                )}
              </Tab>
            ))}
          </Tabs>
        )}

        {fields.length === 0 && (
          <Alert bsStyle='warning'>
            {emptyMessage}
          </Alert>
        )}
      </div>
    );
  }
}

TabbedArrayField.propTypes = {
  id: PropTypes.string.isRequired,
  getTitle: PropTypes.func,
  add: PropTypes.bool,
  remove: PropTypes.bool,
  fields: PropTypes.object,
  ContentComponent: PropTypes.any,
  emptyMessage: PropTypes.oneOfType([ PropTypes.string, PropTypes.element ]),
  addMessage: PropTypes.oneOfType([ PropTypes.string, PropTypes.element ]),
  removeQuestion: PropTypes.oneOfType([ PropTypes.string, PropTypes.element ])
};

export default TabbedArrayField;
