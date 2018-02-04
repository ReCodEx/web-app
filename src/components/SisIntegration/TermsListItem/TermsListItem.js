import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';

const TermsListItem = ({ data, createActions }) =>
  <tr>
    <td>
      {data.year}
    </td>
    <td>
      {data.term === 1 &&
        <FormattedMessage id="app.termsList.winter" defaultMessage="Winter" />}
      {data.term === 2 &&
        <FormattedMessage id="app.termsList.summer" defaultMessage="Summer" />}
      {data.term !== 1 &&
        data.term !== 2 &&
        <span>
          {data.term}
        </span>}
    </td>
    <td>
      {data.beginning
        ? <FormattedDate value={new Date(data.beginning * 1000)} />
        : <span>&mdash;</span>}
    </td>
    <td>
      {data.end
        ? <FormattedDate value={new Date(data.end * 1000)} />
        : <span>&mdash;</span>}
    </td>
    <td>
      {data.advertiseUntil
        ? <span>
            <FormattedDate value={new Date(data.advertiseUntil * 1000)} />
            {', '}
            <FormattedTime value={new Date(data.advertiseUntil * 1000)} />
          </span>
        : <span>&mdash;</span>}
    </td>
    <td className="text-right">
      {createActions && createActions(data.id, data)}
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
