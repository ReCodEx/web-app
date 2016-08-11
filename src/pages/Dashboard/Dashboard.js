import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import PageContent from '../../components/PageContent';
import UsersStats from '../../components/Users/UsersStats';
import { GROUP_URI_FACTORY } from '../../links';
import { isReady } from '../../redux/helpers/resourceManager';
import { loggedInUserId } from '../../redux/selectors/auth';
import { loggedInUserDataSelector } from '../../redux/selectors/users';
import { fetchUserIfNeeded } from '../../redux/modules/users';

const Dashboard = ({
  user
}) => (
  <PageContent
    title={<FormattedMessage id='app.dashboard.title' defaultMessage='Dashboard' />}
    description={
      user
        ? user.get('fullName')
        : <FormattedMessage id='app.dashboard.loading' defaultMessage='Loading ...' />
    }>

    <Row>
      {user && user.get('groupsStats') && user.get('groupsStats').map(
        group => (
          <Col xs={12} sm={6} lg={4} key={group.id}>
            <Link to={GROUP_URI_FACTORY(group.id)}>
              <UsersStats {...group} />
            </Link>
          </Col>
        ))}
    </Row>

  </PageContent>
);

Dashboard.propTypes = {
  user: PropTypes.object
};

export default connect(
  state => ({
    user: loggedInUserDataSelector(state)
  })
)(Dashboard);
