import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Helmet from 'react-helmet';

import PageContent from '../../components/PageContent';
import Box from '../../components/Box';

import { loggedInUserId } from '../../redux/selectors/auth';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { fetchUserIfNeeded } from '../../redux/modules/users';

const Dashboard = ({
  user
}) => (
  <PageContent
    title='Celkový přehled'
    description={user ? `ReCodEx - ${user.fullName}` : 'ReCodEx'}>

  </PageContent>
);

Dashboard.propTypes = {
  user: PropTypes.object
};

export default connect(
  state => ({
    user: loggedInUserSelector(state)
  })
)(Dashboard);
