import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import User from '../User';

const Dashboard = ({ userId }) =>
  <User params={{ userId }} />;

Dashboard.propTypes = {
  userId: PropTypes.string.isRequired
};

export default connect(
  state => ({ userId: loggedInUserIdSelector(state) })
)(Dashboard);
