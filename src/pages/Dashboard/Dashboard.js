import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import Helmet from 'react-helmet';

import PageContent from '../../components/PageContent';

import { loggedInUserId } from '../../redux/selectors/auth';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { fetchUserIfNeeded } from '../../redux/modules/users';

const Dashboard = ({
  user
}) => (
  <PageContent
    title={<FormattedMessage id='app.dashboard.title' defaultMessage='Dashboard' />}
    description={
      user
        ? user.fullName
        : <FormattedMessage id='app.dashboard.loading' defaultMessage='Loading ...' />
    }>

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
