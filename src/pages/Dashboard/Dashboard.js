import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Helmet from 'react-helmet';

import PageContent from '../../components/PageContent';
import Box from '../../components/Box';
import AssignmentsTable from '../../components/AssignmentsTable/AssignmentsTable';

const assignments = [
  {
    id: 1,
    status: 'failed',
    percent: 80,
    name: 'Excel',
    group: 'Jazyk C# a programování pro .NET',
    deadline: 1462888755,
    passingTests: 8,
    totalTests: 10
  },
  {
    id: 2,
    status: 'done',
    percent: 100,
    name: 'Hello world',
    group: 'Programování I',
    deadline: 1462888855,
    passingTests: 10,
    totalTests: 10
  },
  {
    id: 8,
    status: 'done',
    percent: 90,
    name: 'Hanoiské věže',
    group: 'Programování I',
    deadline: 1462888855,
    passingTests: 8,
    totalTests: 9
  },
  {
    id: 3,
    status: 'work-in-progress',
    percent: 20,
    name: 'Fibonacci',
    group: 'Programování II',
    deadline: 1462888955,
    passingTests: 1,
    totalTests: 6
  },
  {
    id: 3,
    status: 'assigned',
    percent: 0,
    name: 'Fibonacci 2',
    group: 'Programování II',
    deadline: 1462888955,
    passingTests: 0,
    totalTests: 10
  }
];

const Dashboard = ({
  user
}) => (
  <PageContent
    title='Celkový přehled'
    description={`ReCodEx - ${user.fullName}`}>
    <Box title='Úlohy s blížícím se termínem odevzdání'>
      <AssignmentsTable
        assignments={assignments}
        showGroup={true} />
    </Box>
  </PageContent>
);

Dashboard.propTypes = {
  user: PropTypes.object
};

export default connect(state =>
  ({
    user: state.auth.user
  })
)(Dashboard);
