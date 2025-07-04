import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Table } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import UsersName from '../../Users/UsersName';
import IpAddress from '../../widgets/IpAddress/IpAddress';
import ExamUnlockButtonContainer from '../../../containers/ExamUnlockButtonContainer';
import { createUserNameComparator } from '../../helpers/users.js';

const sortStudents = lruMemoize((lockedStudents, locale) => {
  const sorted = [...lockedStudents];
  return sorted.sort(createUserNameComparator(locale));
});

const LockedStudentsTable = ({ groupId, lockedStudents, currentUser, intl: { locale } }) =>
  lockedStudents && lockedStudents.length > 0 ? (
    <Table className="m-0" hover>
      <tbody>
        {sortStudents(lockedStudents, locale).map(student => (
          <tr key={student.id}>
            <td>
              <UsersName
                {...student}
                currentUserId={currentUser.id}
                showEmail="icon"
                showExternalIdentifiers
                listItem
              />
            </td>
            <td>{student.privateData?.ipLock && <IpAddress ip={student.privateData.ipLock} />}</td>
            <td className="text-end">
              <ExamUnlockButtonContainer groupId={groupId} userId={student.id} size="xs" />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  ) : (
    <div className="text-center text-body-secondary p-4">
      <em>
        <FormattedMessage
          id="app.lockedStudentsTable.noLockedStudents"
          defaultMessage="There are no locked students yet."
        />
      </em>
    </div>
  );

LockedStudentsTable.propTypes = {
  groupId: PropTypes.string.isRequired,
  lockedStudents: PropTypes.array,
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
  intl: PropTypes.object.isRequired,
};

export default injectIntl(LockedStudentsTable);
