import React, { PropTypes, Component } from 'react';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { Tabs, Tab } from 'react-bootstrap';

import Box from '../../widgets/Box';
import EvaluationTable from '../EvaluationTable';

const messages = defineMessages({
  titlePrefix: {
    id: 'app.referenceSolutionEvaluation.titlePrefix',
    defaultMessage: 'Evaluations for runtime:'
  }
});

class ReferenceSolutionEvaluation extends Component {
  state = { activeTab: 0 };
  changeTab = n => this.setState({ activeTab: n });

  render() {
    const {
      environment,
      evaluations,
      referenceSolutionId,
      renderButtons,
      intl: { formatMessage }
    } = this.props;

    return (
      <Box
        title={
          formatMessage(messages.titlePrefix) +
            ' ' +
            environment.runtimeEnvironmentId
        }
        noPadding={true}
        collapsable={true}
        isOpen={true}
      >
        <Tabs
          id={environment.runtimeEnvironmentId}
          className="nav-tabs-custom"
          activeKey={this.state.activeTab}
          onSelect={this.changeTab}
        >
          {Object.keys(evaluations).map((hwGroup, i) => (
            <Tab key={i} eventKey={i} title={hwGroup}>
              <EvaluationTable
                evaluations={evaluations[hwGroup]}
                referenceSolutionId={referenceSolutionId}
                renderButtons={renderButtons}
              />
            </Tab>
          ))}
        </Tabs>
      </Box>
    );
  }
}

ReferenceSolutionEvaluation.propTypes = {
  environment: PropTypes.object.isRequired,
  evaluations: PropTypes.object,
  referenceSolutionId: PropTypes.string.isRequired,
  renderButtons: PropTypes.func,
  intl: intlShape.isRequired
};

export default injectIntl(ReferenceSolutionEvaluation);
