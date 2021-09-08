import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Col, Row } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import { fetchShadowAssignmentIfNeeded } from '../../redux/modules/shadowAssignments';
import { getShadowAssignment } from '../../redux/selectors/shadowAssignments';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

import Page from '../../components/layout/Page';
import { ShadowAssignmentNavigation } from '../../components/layout/Navigation';
import ShadowAssignmentPointsContainer from '../../containers/ShadowAssignmentPointsContainer';
import ShadowAssignmentDetail from '../../components/Assignments/ShadowAssignment/ShadowAssignmentDetail';
import ShadowAssignmentPointsDetail from '../../components/Assignments/ShadowAssignmentPointsDetail';
import LocalizedTexts from '../../components/helpers/LocalizedTexts';

import { getLocalizedName } from '../../helpers/localizedData';
import { hasPermissions, EMPTY_OBJ } from '../../helpers/common';

const findPoints = defaultMemoize((points, loggedUserId) => {
  return points.find(p => p.awardeeId === loggedUserId) || EMPTY_OBJ;
});

class ShadowAssignment extends Component {
  static loadAsync = ({ shadowId }, dispatch) => dispatch(fetchShadowAssignmentIfNeeded(shadowId));

  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.shadowId !== prevProps.match.params.shadowId) {
      this.props.loadAsync();
    }
  }

  render() {
    const {
      shadowAssignment,
      loggedUserId,
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={shadowAssignment}
        title={shadowAssignment => getLocalizedName(shadowAssignment, locale)}
        description={<FormattedMessage id="app.shadowAssignment.title" defaultMessage="Shadow Assignment" />}>
        {shadowAssignment => (
          <div>
            <ShadowAssignmentNavigation
              shadowId={shadowAssignment.id}
              groupId={shadowAssignment.groupId}
              canEdit={hasPermissions(shadowAssignment, 'update')}
            />

            <Row>
              <Col lg={6}>
                {shadowAssignment.localizedTexts.length > 0 && (
                  <div>
                    <LocalizedTexts locales={shadowAssignment.localizedTexts} />
                  </div>
                )}
              </Col>
              <Col lg={6}>
                <ShadowAssignmentDetail {...shadowAssignment} />
                {!hasPermissions(shadowAssignment, 'viewAllPoints') && (
                  <ShadowAssignmentPointsDetail {...findPoints(shadowAssignment.points, loggedUserId)} />
                )}
              </Col>
            </Row>

            {hasPermissions(shadowAssignment, 'viewAllPoints') && (
              <Row>
                <Col xs={12}>
                  <ShadowAssignmentPointsContainer {...shadowAssignment} />
                </Col>
              </Row>
            )}
          </div>
        )}
      </Page>
    );
  }
}

ShadowAssignment.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      shadowId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  shadowAssignment: PropTypes.object,
  loggedUserId: PropTypes.string,
  group: PropTypes.func,
  loadAsync: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default connect(
  (
    state,
    {
      match: {
        params: { shadowId },
      },
    }
  ) => {
    return {
      shadowAssignment: getShadowAssignment(state)(shadowId),
      loggedUserId: loggedInUserIdSelector(state),
    };
  },
  (
    dispatch,
    {
      match: {
        params: { shadowId },
      },
    }
  ) => ({
    loadAsync: () => ShadowAssignment.loadAsync({ shadowId }, dispatch),
  })
)(injectIntl(ShadowAssignment));
