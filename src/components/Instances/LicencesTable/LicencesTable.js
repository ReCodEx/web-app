import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, FormattedRelative } from 'react-intl';
import { Table } from 'react-bootstrap';
import { MaybeSucceededIcon } from '../../icons';
import Box from '../../widgets/Box';

const LicencesTable = ({ instance, licences }) =>
  <Box
    title={
      <FormattedMessage
        id="app.instance.licencesTitle"
        defaultMessage="Licences"
      />
    }
  >
    <div>
      <p>
        <FormattedMessage
          id="app.instance.hasValidLicence"
          defaultMessage="{name} has a valid licence: "
          values={{ name: instance.name }}
        />
        &nbsp;
        <MaybeSucceededIcon success={instance.hasValidLicence} />
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
                defaultMessage="Is valid"
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
                    ? <strike>{note}</strike>
                    : note}
                </td>
                <td className="text-center">
                  <MaybeSucceededIcon success={isValid} />
                </td>
                <td>
                  <FormattedDate value={validUntil * 1000} />
                  {' '}
                  (
                  <FormattedRelative value={validUntil * 1000} />
                  )
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
    </div>
  </Box>;

LicencesTable.propTypes = {
  instance: PropTypes.shape({
    hasValidLicence: PropTypes.bool.isRequired
  }).isRequired,
  licences: PropTypes.array.isRequired
};

export default LicencesTable;
