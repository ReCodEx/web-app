import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import AssignmentStatusIcon from '../AssignmentStatusIcon/AssignmentStatusIcon';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { LinkContainer } from 'react-router-bootstrap';

import withLinks from '../../../../helpers/withLinks';
import { LocalizedExerciseName } from '../../../helpers/LocalizedNames';
import { EditIcon, ResultsIcon, MaybeBonusAssignmentIcon, MaybeVisibleAssignmentIcon } from '../../../icons';
import DeleteAssignmentButtonContainer from '../../../../containers/DeleteAssignmentButtonContainer';
import Button from '../../../widgets/FlatButton';
import DateTime from '../../../widgets/DateTime';
import EnvironmentsList from '../../../helpers/EnvironmentsList';
import ResourceRenderer from '../../../helpers/ResourceRenderer';
import { getGroupCanonicalLocalizedName } from '../../../../helpers/localizedData';

const AssignmentTableRow = ({
  item: {
    id,
    groupId,
    localizedTexts,
    allowSecondDeadline,
    firstDeadline,
    maxPointsBeforeFirstDeadline,
    secondDeadline,
    maxPointsBeforeSecondDeadline,
    isBonus,
    isPublic,
    visibleFrom,
    accepted,
  },
  runtimeEnvironments = null,
  status,
  userId,
  stats,
  isAdmin,
  showNames = true,
  showGroups = false,
  groupsAccessor = null,
  intl: { locale },
  links: {
    ASSIGNMENT_DETAIL_URI_FACTORY,
    ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY,
    ASSIGNMENT_EDIT_URI_FACTORY,
    ASSIGNMENT_STATS_URI_FACTORY,
    GROUP_DETAIL_URI_FACTORY,
  },
}) => (
  <tr>
    <td className="text-nowrap shrink-col">
      {isAdmin ? (
        <MaybeVisibleAssignmentIcon id={id} isPublic={isPublic} visibleFrom={visibleFrom} />
      ) : (
        <AssignmentStatusIcon id={id} status={status} accepted={accepted} />
      )}
      <MaybeBonusAssignmentIcon gapLeft id={id} isBonus={isBonus} />
    </td>

    {showNames && (
      <td>
        <Link to={userId ? ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY(id, userId) : ASSIGNMENT_DETAIL_URI_FACTORY(id)}>
          <LocalizedExerciseName entity={{ name: '??', localizedTexts }} />
        </Link>
      </td>
    )}

    {showGroups && groupsAccessor && (
      <td>
        <Link to={GROUP_DETAIL_URI_FACTORY(groupId)}>
          {getGroupCanonicalLocalizedName(groupId, groupsAccessor, locale)}
        </Link>
      </td>
    )}

    {runtimeEnvironments && (
      <td>
        <ResourceRenderer resource={runtimeEnvironments} returnAsArray>
          {runtimes => <EnvironmentsList runtimeEnvironments={runtimes} />}
        </ResourceRenderer>
      </td>
    )}

    {!isAdmin && stats && (
      <td className="text-center text-nowrap">
        {stats.points && stats.points.gained !== null ? (
          <span>
            {stats.points.gained}
            {stats.points.bonus > 0 && <span style={{ color: 'green' }}>+{stats.points.bonus}</span>}
            {stats.points.bonus < 0 && <span style={{ color: 'red' }}>{stats.points.bonus}</span>}
          </span>
        ) : null}
      </td>
    )}
    <td className="text-nowrap">
      <DateTime unixts={firstDeadline} isDeadline />
    </td>
    <td className="text-center text-nowrap shrink-col">{maxPointsBeforeFirstDeadline}</td>
    <td className="text-nowrap">
      <DateTime unixts={allowSecondDeadline ? secondDeadline : null} isDeadline />
    </td>
    <td className="text-center text-nowrap shrink-col">{allowSecondDeadline ? maxPointsBeforeSecondDeadline : ''}</td>
    {isAdmin && (
      <td className="text-right">
        <LinkContainer to={ASSIGNMENT_STATS_URI_FACTORY(id)}>
          <Button bsSize="xs" bsStyle="primary">
            <ResultsIcon gapRight />
            <FormattedMessage id="generic.results" defaultMessage="Results" />
          </Button>
        </LinkContainer>
        <LinkContainer to={ASSIGNMENT_EDIT_URI_FACTORY(id)}>
          <Button bsSize="xs" bsStyle="warning">
            <EditIcon gapRight />
            <FormattedMessage id="generic.edit" defaultMessage="Edit" />
          </Button>
        </LinkContainer>
        <DeleteAssignmentButtonContainer id={id} bsSize="xs" />
      </td>
    )}
  </tr>
);

AssignmentTableRow.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    localizedTexts: PropTypes.array,
    firstDeadline: PropTypes.number,
    secondDeadline: PropTypes.number,
  }).isRequired,
  runtimeEnvironments: PropTypes.array,
  status: PropTypes.string,
  userId: PropTypes.string,
  stats: PropTypes.object,
  isAdmin: PropTypes.bool,
  showNames: PropTypes.bool,
  showGroups: PropTypes.bool,
  groupsAccessor: PropTypes.func,
  links: PropTypes.object,
  intl: intlShape.isRequired,
};

export default injectIntl(withLinks(AssignmentTableRow));
