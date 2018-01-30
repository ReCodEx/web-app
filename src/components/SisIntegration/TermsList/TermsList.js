import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import TermsListItem from '../TermsListItem';

const TermsList = ({ terms = [], createActions, intl, ...rest }) =>
  <Table hover striped>
    <thead>
      <tr>
        <th>
          <FormattedMessage id="app.termsList.year" defaultMessage="Year" />
        </th>
        <th>
          <FormattedMessage id="app.termsList.term" defaultMessage="Term" />
        </th>
        <th>
          <FormattedMessage id="app.termsList.start" defaultMessage="Start" />
        </th>
        <th>
          <FormattedMessage id="app.termsList.end" defaultMessage="End" />
        </th>
        <th>
          <FormattedMessage
            id="app.termsList.advertiseUntil"
            defaultMessage="Advertise Until"
          />
        </th>
        <th />
      </tr>
    </thead>
    <tbody>
      {terms.map((term, i) =>
        <TermsListItem key={i} data={term} createActions={createActions} />
      )}

      {terms.length === 0 &&
        <tr>
          <td className="text-center">
            <FormattedMessage
              id="app.termsList.noTerms"
              defaultMessage="There are no SIS terms in this list."
            />
          </td>
        </tr>}
    </tbody>
  </Table>;

TermsList.propTypes = {
  terms: PropTypes.array,
  createActions: PropTypes.func,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(TermsList);
