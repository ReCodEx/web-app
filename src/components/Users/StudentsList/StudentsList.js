import React, { PropTypes } from 'react';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import { isReady, getJsData } from '../../../redux/helpers/resourceManager';
import StudentsListItem, { LoadingStudentsListItem } from '../StudentsListItem';

const StudentsList = ({
  users = [],
  isLoaded = true,
  stats,
  renderActions,
  ...rest
}) => (
  <Table hover>
    <tbody>
    {users.map((user, i) => (
      <StudentsListItem
        key={i}
        {...user}
        renderActions={renderActions}
        stats={
          isReady(stats)
            ? getJsData(stats).find(item => item.userId === user.id)
            : null
        } />
    ))}

    {users.length === 0 && isLoaded && (
      <tr>
        <td className='text-center'>
          <FormattedMessage id='app.studentsList.noStudents' defaultMessage='There are no students in this list.' />
        </td>
      </tr>
    )}

    {!isLoaded && (
      <LoadingStudentsListItem withActions={Boolean(renderActions)} />
    )}
    </tbody>
  </Table>
);

StudentsList.propTypes = {
  users: PropTypes.array,
  isLoaded: PropTypes.bool,
  stats: PropTypes.object,
  renderActions: PropTypes.func
};

export default StudentsList;
