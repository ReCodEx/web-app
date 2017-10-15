import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import AssignmentStatusIcon from '../AssignmentStatusIcon/AssignmentStatusIcon';
import { FormattedDate, FormattedTime } from 'react-intl';

import withLinks from '../../../../hoc/withLinks';
import { MaybeBonusAssignmentIcon } from '../../../icons';

const getLocalizedName = (texts, locale, defaultName) => {
  const localizedText = texts.find(text => text.locale === locale);
  return localizedText ? localizedText.shortText : defaultName;
};

const AssignmentTableRow = (
  {
    showGroup,
    item: {
      id,
      name,
      localizedTexts,
      group,
      allowSecondDeadline,
      firstDeadline,
      secondDeadline,
      isBonus,
      accepted
    },
    status,
    userId,
    links: {
      ASSIGNMENT_DETAIL_URI_FACTORY,
      ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY
    }
  },
  { lang }
) =>
  <tr>
    <td className="text-center">
      <AssignmentStatusIcon id={id} status={status} accepted={accepted} />
    </td>
    <td>
      <MaybeBonusAssignmentIcon id={id} isBonus={isBonus} />
      <Link
        to={
          userId
            ? ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY(id, userId)
            : ASSIGNMENT_DETAIL_URI_FACTORY(id)
        }
      >
        {getLocalizedName(localizedTexts, lang, name)}
      </Link>
    </td>
    {showGroup &&
      <td>
        {group}
      </td>}
    <td>
      <FormattedDate value={new Date(firstDeadline * 1000)} />
      {', '}
      <FormattedTime value={new Date(firstDeadline * 1000)} />
    </td>
    <td>
      {allowSecondDeadline
        ? <span>
            <FormattedDate value={new Date(secondDeadline * 1000)} />
            {', '}
            <FormattedTime value={new Date(secondDeadline * 1000)} />
          </span>
        : <span>-</span>}
    </td>
  </tr>;

AssignmentTableRow.propTypes = {
  showGroup: PropTypes.bool,
  item: PropTypes.shape({
    id: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired,
    firstDeadline: PropTypes.number.isRequired,
    secondDeadline: PropTypes.number.isRequired,
    groupId: PropTypes.string
  }),
  status: PropTypes.string,
  userId: PropTypes.string,
  links: PropTypes.object
};

AssignmentTableRow.contextTypes = {
  lang: PropTypes.string.isRequired
};

export default withLinks(AssignmentTableRow);
