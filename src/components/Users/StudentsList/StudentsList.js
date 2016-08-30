import React from 'react';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import { isReady } from '../../../redux/helpers/resourceManager';
import StudentsListItem from '../StudentsListItem';

const StudentsList = ({
  users = [],
  stats,
  ...rest
}) => (
  <Table>
    <tbody>
    {users.map((user, i) => (
      <StudentsListItem
        key={i}
        {...user}
        stats={
          isReady(stats)
            ? stats.get('data').toJS().find(item => item.userId === user.id)
            : null
        } />
    ))}

    {users.length === 0 && (
      <tr>
        <td className='text-center'>
          <FormattedMessage id='app.studentsList.noStudents' defaultMessage='There are no students in this list.' />
        </td>
      </tr>
    )}

    </tbody>
  </Table>
);

StudentsList.propTypes = {
};

export default StudentsList;
