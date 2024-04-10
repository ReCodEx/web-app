import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import DateTime from '../../widgets/DateTime';
import Button from '../../widgets/TheButton';
import { VisibleIcon } from '../../icons';

const sortExams = defaultMemoize(exams => {
  const sorted = [...exams];
  return sorted.sort((a, b) => a.end - b.end);
});

const GroupExamsTable = ({ exams = null, selected = null, setSelected = null }) =>
  exams && exams.length > 0 ? (
    <Table className="mb-0">
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
          {setSelected && <th />}
        </tr>
      </thead>
      <tbody>
        {sortExams(exams).map((exam, idx) => (
          <tr key={exam.id} className={selected === exam.id ? 'table-primary' : ''}>
            <td className="text-bold">#{idx + 1}</td>
            <td>
              <DateTime unixts={exam.begin} showRelative showSeconds />
            </td>
            <td>
              <DateTime unixts={exam.end} showRelative showSeconds />
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
            {setSelected && (
              <td>
                <Button
                  size="xs"
                  variant="primary"
                  disabled={selected === exam.id}
                  onClick={() => setSelected(exam.id)}>
                  <VisibleIcon visible gapRight />
                  <FormattedMessage id="app.groupExamsTable.selectButton" defaultMessage="Detail" />
                </Button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  ) : (
    <div className="text-center text-muted p-2">
      <em>
        <FormattedMessage id="app.groupExams.noPreviousExams" defaultMessage="There are no previous exams recorded." />
      </em>
    </div>
  );

GroupExamsTable.propTypes = {
  exams: PropTypes.array,
  selected: PropTypes.string,
  setSelected: PropTypes.func,
};

export default GroupExamsTable;
