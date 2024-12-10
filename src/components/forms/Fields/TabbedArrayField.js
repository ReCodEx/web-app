import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Card, Tab, Nav } from 'react-bootstrap';

import Confirm from '../Confirm';
import { CloseIcon } from '../../icons';
import { identity } from '../../../helpers/common.js';
import InsetPanel from '../../widgets/InsetPanel';

class TabbedArrayField extends Component {
  prepareFieldsIndices = () => {
    const {
      fields,
      tabComparator = null,
      intl: { locale: currentLocale },
    } = this.props;

    const texts = [...Array(fields.length).keys()].map((_, i) => ({ field: fields.get(i), i }));
    if (tabComparator) {
      texts.sort(({ field: a }, { field: b }) => tabComparator(a, b));
    }

    const defaultIndex = Math.max(
      texts.findIndex(({ field: { locale } }) => locale === currentLocale),
      0
    );

    return [texts.map(({ i }) => i), defaultIndex];
  };

  render() {
    const {
      id,
      ContentComponent,
      renderTitle = identity,
      emptyMessage = <FormattedMessage id="app.tabbedArrayField.empty" defaultMessage="There are currently no tabs." />,
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

    const [indices, defaultIndex] = this.prepareFieldsIndices(fields);

    return (
      <div>
        {fields.length > 0 && (
          <Tab.Container id={id} defaultActiveKey={defaultIndex}>
            <Card className="mb-3">
              <Nav variant="tabs" className="nav-tabs-custom px-2 pt-2" id="localized-texts">
                {indices.map((fieldIdx, tabIdx) => {
                  const fieldData = fields.get(fieldIdx);
                  return (
                    <Nav.Item key={tabIdx}>
                      <Nav.Link eventKey={tabIdx} onClick={ev => ev.currentTarget.blur()}>
                        {renderTitle(fieldData)}
                        {removableTabs && (
                          <Confirm
                            id={`${id}-remove-${fieldIdx}`}
                            question={removeQuestion}
                            onConfirmed={() => {
                              fields.remove(fieldIdx);
                              this.changeTab(Math.min(tabIdx, fields.length - 2));
                            }}>
                            <CloseIcon gapLeft={2} />
                          </Confirm>
                        )}
                      </Nav.Link>
                    </Nav.Item>
                  );
                })}
              </Nav>

              <Tab.Content>
                {indices.map((fieldIdx, tabIdx) => {
                  const prefix = `${fields.name}[${fieldIdx}]`;

                  return (
                    <Tab.Pane key={`${id}-tab-${tabIdx}`} eventKey={tabIdx} mountOnEnter unmountOnExit>
                      <Card.Body>
                        <ContentComponent
                          {...props}
                          prefix={prefix}
                          data={tabDataSelector && tabDataSelector(fields.get(fieldIdx))}
                        />
                      </Card.Body>
                    </Tab.Pane>
                  );
                })}
              </Tab.Content>
            </Card>
          </Tab.Container>
        )}

        {fields.length === 0 && <InsetPanel>{emptyMessage}</InsetPanel>}
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
  intl: PropTypes.object.isRequired,
};

export default injectIntl(TabbedArrayField);
