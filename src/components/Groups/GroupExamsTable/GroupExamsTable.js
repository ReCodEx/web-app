import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { lruMemoize } from 'reselect';

import DateTime from '../../widgets/DateTime';
import Button from '../../widgets/TheButton';
import { VisibleIcon } from '../../icons';

const sortExams = lruMemoize(exams => {
  const sorted = [...exams];
  return sorted.sort((a, b) => a.end - b.end || a.begin - b.begin);
});

const GroupExamsTable = ({ exams = null, selected = null, linkFactory = null }) =>
  exams && exams.length > 0 ? (
    <Table className="mb-0" hover>
      <thead>
        <tr>
          <th />
          <th>
            <FormattedMessage id="app.groupExamsTable.begin" defaultMessage="Begun at" />
          </th>
          <th>
            <FormattedMessage id="app.groupExamsTable.end" defaultMessage="Ended at" />
          </th>
          <th>
            <FormattedMessage id="app.groupExamsTable.lockType" defaultMessage="Lock type" />
          </th>
          {linkFactory && <th />}
        </tr>
      </thead>
      <tbody>
        {sortExams(exams).map((exam, idx) => (
          <tr key={exam.id} className={selected === String(exam.id) ? 'table-primary' : ''}>
            <td className="fw-bold">#{idx + 1}</td>
            <td>
              <DateTime unixts={exam.begin} showSeconds />
            </td>
            <td>
              <DateTime unixts={exam.end} showSeconds />
            </td>
            <td>
              <em>
                {exam.strict ? (
                  <FormattedMessage id="app.groupExams.lockStrict" defaultMessage="strict" />
                ) : (
                  <FormattedMessage id="app.groupExams.lockRegular" defaultMessage="regular" />
                )}
              </em>
            </td>
            {linkFactory && (
              <td className="text-end">
                <Link to={linkFactory(exam.id) || ''}>
                  <Button
                    size="xs"
                    variant={selected === String(exam.id) ? 'secondary' : 'primary'}
                    disabled={!linkFactory(exam.id)}>
                    <VisibleIcon visible={selected !== String(exam.id)} className="text-light" gapRight={2} />
                    {selected === String(exam.id) ? (
                      <FormattedMessage id="app.groupExamsTable.unselectButton" defaultMessage="Unselect" />
                    ) : (
                      <FormattedMessage id="app.groupExamsTable.selectButton" defaultMessage="Detail" />
                    )}
                  </Button>
                </Link>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  ) : (
    <div className="text-center text-body-secondary p-2">
      <em>
        <FormattedMessage
          id="app.groupExamsTable.noPreviousExams"
          defaultMessage="There are no previous exams recorded."
        />
      </em>
    </div>
  );

GroupExamsTable.propTypes = {
  exams: PropTypes.array,
  selected: PropTypes.string,
  linkFactory: PropTypes.func,
};

export default GroupExamsTable;
