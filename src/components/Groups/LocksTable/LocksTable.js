import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import DateTime from '../../widgets/DateTime';
import { LockIcon, UnlockIcon } from '../../icons';

const sortLocks = lruMemoize(locks => [...locks].sort(({ createdAt: c1 }, { createdAt: c2 }) => c1 - c2));

const LocksTable = ({ locks }) =>
  locks.length > 0 ? (
    <Table className="m-0" hover>
      <tbody>
        {sortLocks(locks).map(lock => (
          <tr key={lock.id}>
            <td>
              <UsersNameContainer userId={lock.studentId} showEmail="icon" showExternalIdentifiers />
            </td>
            <td>
              <LockIcon className="text-body-secondary" gapRight />
              <DateTime unixts={lock.createdAt} showSeconds />
            </td>
            <td>
              {lock.unlockedAt && (
                <>
                  <UnlockIcon className="text-warning" gapRight />
                  <DateTime unixts={lock.unlockedAt} showSeconds />
                </>
              )}
            </td>
            <td className="shrink-col text-nowrap">
              <code>{lock.remoteAddr}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  ) : (
    <div className="text-center text-body-secondary p-4">
      <em>
        <FormattedMessage
          id="app.locksTable.noLockedStudents"
          defaultMessage="There are no lock records for the selected exam."
        />
      </em>
    </div>
  );

LocksTable.propTypes = {
  locks: PropTypes.array.isRequired,
};

export default LocksTable;
