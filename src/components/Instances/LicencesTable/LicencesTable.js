import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';

import { SuccessOrFailureIcon } from '../../icons';
import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';

const LicencesTable = ({ instance, licences }) =>
  <Box
    title={
      <FormattedMessage
        id="app.instance.licencesTitle"
        defaultMessage="Licences"
      />
    }
  >
    <React.Fragment>
      <p>
        <FormattedMessage
          id="app.instance.hasValidLicence"
          defaultMessage="{name} has a valid licence: "
          values={{ name: instance.name }}
        />
        &nbsp;
        <SuccessOrFailureIcon success={instance.hasValidLicence} />
      </p>
      <Table condensed hover>
        <thead>
          <tr>
            <th>
              <FormattedMessage
                id="app.licencesTable.note"
                defaultMessage="Note"
              />
            </th>
            <th>
              <FormattedMessage
                id="app.licencesTable.isValid"
                defaultMessage="Without revocation"
              />
            </th>
            <th>
              <FormattedMessage
                id="app.licencesTable.validUntil"
                defaultMessage="Valid until"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {licences
            .sort((a, b) => (a.validUntil < b.validUntil ? 1 : -1))
            .map(({ id, validUntil, isValid, note }) =>
              <tr key={id}>
                <td>
                  {!isValid || validUntil * 1000 < Date.now()
                    ? <strike>
                        {note}
                      </strike>
                    : note}
                </td>
                <td className="text-center">
                  <SuccessOrFailureIcon success={isValid} />
                </td>
                <td>
                  <DateTime
                    unixts={validUntil}
                    showTime={false}
                    showRelative
                    isDeadline
                  />
                </td>
              </tr>
            )}

          {licences.length === 0 &&
            <tr>
              <td colSpan={3}>
                <FormattedMessage
                  id="app.licencesTable.noLicences"
                  defaultMessage="There are no licences."
                />
              </td>
            </tr>}
        </tbody>
      </Table>
    </React.Fragment>
  </Box>;

LicencesTable.propTypes = {
  instance: PropTypes.shape({
    hasValidLicence: PropTypes.bool.isRequired
  }).isRequired,
  licences: PropTypes.array.isRequired
};

export default LicencesTable;
