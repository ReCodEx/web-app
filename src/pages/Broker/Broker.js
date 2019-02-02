import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import Page from '../../components/layout/Page';
import { fetchBrokerStats } from '../../redux/modules/brokerStats';
import { brokerStatsSelector } from '../../redux/selectors/brokerStats';
import { FormattedMessage } from 'react-intl';
import Box from '../../components/widgets/Box';

class Broker extends Component {
  static loadAsync = (params, dispatch) =>
    Promise.all([dispatch(fetchBrokerStats())]);

  componentWillMount = () => this.props.loadAsync();

  render() {
    const { stats } = this.props;
    return (
      <Page
        title={
          <FormattedMessage
            id="app.broker.title"
            defaultMessage="Broker Management"
          />
        }
        description={
          <FormattedMessage
            id="app.broker.description"
            defaultMessage="Management of broker backend service"
          />
        }
        resource={stats}
      >
        {stats =>
          <Row>
            <Col lg={6}>
              <Box
                title={
                  <FormattedMessage
                    id="app.broker.stats"
                    defaultMessage="Current Statistics"
                  />
                }
              >
                <table>
                  <tbody>
                    {Object.keys(stats).map(name =>
                      <tr key={name}>
                        <td>
                          <i>
                            {name}
                          </i>
                        </td>
                        <td className="em-padding-left">
                          <code>
                            {String(stats[name])}
                          </code>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Box>
            </Col>
          </Row>}
      </Page>
    );
  }
}

Broker.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  stats: ImmutablePropTypes.map
};

export default connect(
  state => ({
    stats: brokerStatsSelector(state)
  }),
  dispatch => ({
    loadAsync: () => Broker.loadAsync({}, dispatch)
  })
)(Broker);
