import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Icon from '../../icons';
import DateTime from '../../widgets/DateTime';

const TermsListItem = ({ data, createActions }) => (
  <tr>
    <td>
      {data.beginning * 1000 <= Date.now() && Date.now() <= data.end * 1000 && (
        <Icon icon={['far', 'lightbulb']} gapLeft gapRight />
      )}
    </td>
    <td>{data.year}</td>
    <td>
      {data.term === 1 && <FormattedMessage id="app.termsList.winter" defaultMessage="Winter" />}
      {data.term === 2 && <FormattedMessage id="app.termsList.summer" defaultMessage="Summer" />}
      {data.term !== 1 && data.term !== 2 && <span>{data.term}</span>}
    </td>
    <td>
      <DateTime unixts={data.beginning} showTime={false} />
    </td>
    <td>
      <DateTime unixts={data.end} showTime={false} />
    </td>
    <td>
      <DateTime unixts={data.advertiseUntil} showTime={false} isDeadline showRelative />
    </td>
    <td className="text-right">{createActions && createActions(data.id, data)}</td>
  </tr>
);

TermsListItem.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    year: PropTypes.number.isRequired,
    term: PropTypes.number.isRequired,
    beginning: PropTypes.number,
    end: PropTypes.number,
    advertiseUntil: PropTypes.number,
  }),
  createActions: PropTypes.func,
};

export default TermsListItem;
