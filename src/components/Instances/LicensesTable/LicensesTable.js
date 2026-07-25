import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';

import { SuccessOrFailureIcon } from '../../icons';
import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';

const LicensesTable = ({ instance, licenses }) => {
  const [now] = useState(() => Date.now());

  return (
    <Box title={<FormattedMessage id="app.instance.licensesTitle" defaultMessage="Licenses" />}>
      <>
        <p>
          <FormattedMessage
            id="app.instance.hasValidLicense"
            defaultMessage="{name} has a valid license: "
            values={{ name: instance.name }}
          />
          &nbsp;
          <SuccessOrFailureIcon success={instance.hasValidLicence} />
        </p>
        <Table size="sm" hover className="card-table">
          <thead>
            <tr>
              <th>
                <FormattedMessage id="app.licensesTable.note" defaultMessage="Note" />
              </th>
              <th>
                <FormattedMessage id="app.licensesTable.isValid" defaultMessage="Without revocation" />
              </th>
              <th>
                <FormattedMessage id="app.licensesTable.validUntil" defaultMessage="Valid until" />
              </th>
            </tr>
          </thead>
          <tbody>
            {licenses
              .sort((a, b) => (a.validUntil < b.validUntil ? 1 : -1))
              .map(({ id, validUntil, isValid, note }) => (
                <tr key={id}>
                  <td>{!isValid || validUntil * 1000 < now ? <strike>{note}</strike> : note}</td>
                  <td className="text-center">
                    <SuccessOrFailureIcon success={isValid} />
                  </td>
                  <td>
                    <DateTime unixTs={validUntil} showTime={false} showRelative isDeadline />
                  </td>
                </tr>
              ))}

            {licenses.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <FormattedMessage id="app.licensesTable.noLicenses" defaultMessage="There are no licenses." />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </>
    </Box>
  );
};

LicensesTable.propTypes = {
  instance: PropTypes.shape({
    hasValidLicence: PropTypes.bool.isRequired,
    name: PropTypes.string,
  }).isRequired,
  licenses: PropTypes.array.isRequired,
};

export default LicensesTable;
