import React from 'react';
import { asyncConnect } from 'redux-connect';
import { Row, Col } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

import Box from '../../components/Box';
import PageContent from '../../components/PageContent';
import UsersList from '../../components/UsersList';
import AssignmentsTable from '../../components/AssignmentsTable';

import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';

const Group = ({
  group,
  assignments
}) => (
  <PageContent
    title={!group || group.isFetching ? 'Detail skupiny' : group.data.name}
    description='Přehled informací a výsledků'>
    {group && group.isFetching === false && (
      <div>
        <h1>Přehled skupiny</h1>

        <ReactMarkdown source={group.data.description} />

        <Row>
          <Col lg={6}>
            <Box title='Cvičící'>
              <UsersList users={group.data.supervisors} fill />
            </Box>
            <Box title='Studenti'>
              <UsersList users={[]} fill />
            </Box>
          </Col>

          <Col lg={6}>
            <Box title='Zadané úlohy'>
              <AssignmentsTable
                assignments={assignments}
                showGroup={false} />
            </Box>
          </Col>
        </Row>
      </div>
    )}
  </PageContent>
);

export default asyncConnect(
  [
    {
      promise: ({ params, store: { dispatch } }) =>
        dispatch(fetchGroupIfNeeded(params.groupId))
    },
    {
      promise: ({ params, store: { dispatch } }) =>
        dispatch(fetchAssignmentsForGroup(params.groupId)) // @todo !!!
    }
  ],
  (state, { params }) => {
    const group = state.groups.get(params.groupId); // @todo use a selector
    return {
      group,
      assignments: group.data.assignments.map(id => state.assignments.get(id).data) // @todo use a selector
    };
  }
)(Group);
