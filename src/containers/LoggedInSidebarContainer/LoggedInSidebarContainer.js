import React from 'react';
import { connect } from 'react-redux';
import LoggedIn from '../../components/Sidebar/LoggedIn';
import { studentOfSelector, supervisorOfSelector } from '../../redux/selectors/groups';
import { notificationsSelector } from '../../redux/selectors/users';

const mapStateToProps = state => ({
  studentOf: studentOfSelector(state),
  supervisorOf: supervisorOfSelector(state),
  notifications: notificationsSelector(state)
});

export default connect(mapStateToProps)(LoggedIn);
