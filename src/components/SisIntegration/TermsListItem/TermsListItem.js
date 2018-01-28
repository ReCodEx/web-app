import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';

const TermsListItem = ({
  data: { id, year, term, beginning, end, advertiseUntil },
  createActions
}) =>
  <tr>
    <td>
      {year}
    </td>
    <td>
      {term === 1 &&
        <FormattedMessage id="app.termsList.winter" defaultMessage="Winter" />}
      {term === 2 &&
        <FormattedMessage id="app.termsList.summer" defaultMessage="Summer" />}
      {term !== 1 &&
        term !== 2 &&
        <span>
          {term}
        </span>}
    </td>
    <td>
      {beginning
        ? <FormattedDate value={new Date(beginning * 1000)} />
        : <span>&mdash;</span>}
    </td>
    <td>
      {end
        ? <FormattedDate value={new Date(end * 1000)} />
        : <span>&mdash;</span>}
    </td>
    <td>
      {advertiseUntil
        ? <span>
            <FormattedDate value={new Date(advertiseUntil * 1000)} />
            {', '}
            <FormattedTime value={new Date(advertiseUntil * 1000)} />
          </span>
        : <span>&mdash;</span>}
    </td>
    <td className="text-right">
      {createActions && createActions(id)}
    </td>
  </tr>;

TermsListItem.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    year: PropTypes.number.isRequired,
    term: PropTypes.number.isRequired,
    beginning: PropTypes.number,
    end: PropTypes.number,
    advertiseUntil: PropTypes.number
  }),
  createActions: PropTypes.func
};

export default TermsListItem;
