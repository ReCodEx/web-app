import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Table } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import UsersName from '../../Users/UsersName';
import DateTime from '../../widgets/DateTime/DateTime';
import Icon from '../../icons';
import { createUserNameComparator } from '../../helpers/users.js';

const sortStudents = lruMemoize((notLockedStudents, locale) => {
  const sorted = [...notLockedStudents];
  return sorted.sort(createUserNameComparator(locale));
});

const NotLockedStudentsTable = ({ notLockedStudents, currentUser, intl: { locale } }) =>
  notLockedStudents && notLockedStudents.length > 0 ? (
    <Table className="m-0" hover>
      <tbody>
        {sortStudents(notLockedStudents, locale).map(student => (
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
            <td className="text-nowrap shrink-col small text-body-secondary align-middle">
              {student.privateData?.lastAuthenticationAt && (
                <>
                  <Icon
                    icon="right-to-bracket"
                    gapRight
                    tooltipId={student.id}
                    tooltipPlacement="bottom"
                    tooltip={
                      <FormattedMessage
                        id="app.notLockedStudentsTable.lastAuthentication"
                        defaultMessage="Last time the user was authenticated"
                      />
                    }
                  />
                  <DateTime unixTs={student.privateData.lastAuthenticationAt} showSeconds />
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  ) : (
    <div className="text-center text-body-secondary p-4">
      <em>
        <FormattedMessage
          id="app.notLockedStudentsTable.noNotLockedStudents"
          defaultMessage="There are no remaining unlocked students."
        />
      </em>
    </div>
  );

NotLockedStudentsTable.propTypes = {
  notLockedStudents: PropTypes.array,
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
  intl: PropTypes.object.isRequired,
};

export default injectIntl(NotLockedStudentsTable);
