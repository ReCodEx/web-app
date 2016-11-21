import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import { Table } from 'react-bootstrap';
import SupervisorsStudentsListItem from './SupervisorsStudentsListItem';
import LoadingStudentsListItem from './LoadingStudentsListItem';
import { isReady, getJsData } from '../../../redux/helpers/resourceManager';

const SupervisorsStundetsList = ({
  groupId,
  users = [],
  isLoaded = true,
  stats,
  ...rest
}) => (
  <Table>
    <tbody>
    {users.map((user, i) => (
      <SupervisorsStudentsListItem
        key={i}
        {...user}
        groupId={groupId}
        stats={
          isReady(stats)
            ? getJsData(stats).find(item => item.userId === user.id)
            : null
        } />
    ))}

    {users.length === 0 && isLoaded && (
      <tr>
        <td className='text-center'>
          <FormattedMessage id='app.supervisorsStudentsList.noStudents' defaultMessage='There are no students in this list.' />
        </td>
      </tr>
    )}

    {!isLoaded && (
      <LoadingStudentsListItem />
    )}
    </tbody>
  </Table>
);

SupervisorsStundetsList.propTypes = {
  groupId: PropTypes.string.isRequired,
  users: PropTypes.array,
  isLoaded: PropTypes.bool,
  stats: PropTypes.object
};

export default SupervisorsStundetsList;
