import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Well, Tabs, Tab } from 'react-bootstrap';

import Confirm from '../Confirm';
import { CloseIcon } from '../../icons';
import { identity } from '../../../helpers/common';

class TabbedArrayField extends Component {
  state = { activeTab: 0 };
  changeTab = n => this.setState({ activeTab: n });

  prepareFieldsIndices = () => {
    const { fields, tabComparator = null } = this.props;
    if (!tabComparator) {
      return [...Array(fields.length).keys()];
    }
    return fields
      .map((unused, i) => ({ field: fields.get(i), i }))
      .sort(({ field: a }, { field: b }) => tabComparator(a, b))
      .map(({ i }) => i);
  };

  render() {
    const {
      id,
      ContentComponent,
      renderTitle = identity,
      emptyMessage = (
        <FormattedMessage
          id="app.tabbedArrayField.empty"
          defaultMessage="There are currently no tabs."
        />
      ),
      removeQuestion = (
        <FormattedMessage
          id="app.tabbedArrayField.reallyRemoveQuestion"
          defaultMessage="Do you really wish to delete this tab?"
        />
      ),
      tabDataSelector = null,
      removableTabs = false,
      fields,
      ...props
    } = this.props;

    const indices = this.prepareFieldsIndices(fields);

    return (
      <div>
        {fields.length > 0 && (
          <Tabs
            id={id}
            className="nav-tabs-custom"
            activeKey={this.state.activeTab}
            onSelect={this.changeTab}>
            {indices.map((fieldIdx, tabIdx) => {
              const prefix = `${fields.name}[${fieldIdx}]`;
              const fieldData = fields.get(fieldIdx);
              return (
                <Tab
                  key={`${id}-tab-${tabIdx}`}
                  eventKey={tabIdx}
                  title={
                    <span>
                      {renderTitle(fieldData)}
                      {removableTabs && (
                        <Confirm
                          id={`${id}-remove-${fieldIdx}`}
                          question={removeQuestion}
                          onConfirmed={() => {
                            fields.remove(fieldIdx);
                            this.changeTab(Math.min(tabIdx, fields.length - 2));
                          }}>
                          <CloseIcon gapLeft />
                        </Confirm>
                      )}
                    </span>
                  }
                  mountOnEnter
                  unmountOnExit>
                  <ContentComponent
                    {...props}
                    prefix={prefix}
                    data={
                      tabDataSelector && tabDataSelector(fields.get(fieldIdx))
                    }
                  />
                </Tab>
              );
            })}
          </Tabs>
        )}

        {fields.length === 0 && <Well>{emptyMessage}</Well>}
      </div>
    );
  }
}

TabbedArrayField.propTypes = {
  id: PropTypes.string.isRequired,
  renderTitle: PropTypes.func,
  tabComparator: PropTypes.func,
  tabDataSelector: PropTypes.func,
  removableTabs: PropTypes.bool,
  fields: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  ContentComponent: PropTypes.any,
  emptyMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  removeQuestion: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

export default TabbedArrayField;
