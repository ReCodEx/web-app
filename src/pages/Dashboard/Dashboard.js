import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import Page from '../../components/Page';
import ResourceRenderer from '../../components/ResourceRenderer';
import UsersStats from '../../components/Users/UsersStats';
import { isReady } from '../../redux/helpers/resourceManager';
import { loggedInUserId } from '../../redux/selectors/auth';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { fetchUserIfNeeded } from '../../redux/modules/users';

const Dashboard = ({
  user
}, {
  links: { GROUP_URI_FACTORY }
}) => (
  <Page
    resource={user}
    title={() => <FormattedMessage id='app.dashboard.title' defaultMessage='Dashboard' />}
    description={(user) => user.fullName}>
    {user => (
      <Row>
        {user.groupsStats && user.groupsStats.map(
          group => (
            <Col xs={12} sm={6} lg={4} key={group.id}>
              <Link to={GROUP_URI_FACTORY(group.id)}>
                <UsersStats {...group} />
              </Link>
            </Col>
          ))}
      </Row>
    )}
  </Page>
);

Dashboard.propTypes = {
  user: ImmutablePropTypes.map
};

Dashboard.contextTypes = {
  links: PropTypes.object
};

export default connect(
  state => ({
    user: loggedInUserSelector(state)
  })
)(Dashboard);
