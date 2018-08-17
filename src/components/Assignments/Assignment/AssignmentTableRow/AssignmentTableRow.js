import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import AssignmentStatusIcon from '../AssignmentStatusIcon/AssignmentStatusIcon';
import { FormattedMessage } from 'react-intl';
import { ButtonGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import withLinks from '../../../../helpers/withLinks';
import { LocalizedExerciseName } from '../../../helpers/LocalizedNames';
import {
  EditIcon,
  ResultsIcon,
  MaybeBonusAssignmentIcon,
  MaybePublicIcon
} from '../../../icons';
import DeleteAssignmentButtonContainer from '../../../../containers/DeleteAssignmentButtonContainer';
import Button from '../../../widgets/FlatButton';
import DateTime from '../../../widgets/DateTime';
import EnvironmentsList from '../../../helpers/EnvironmentsList';
import ResourceRenderer from '../../../helpers/ResourceRenderer';

const AssignmentTableRow = ({
  showGroup,
  item: {
    id,
    name,
    group,
    localizedTexts,
    allowSecondDeadline,
    firstDeadline,
    secondDeadline,
    isBonus,
    isPublic,
    accepted
  },
  runtimeEnvironments = null,
  status,
  userId,
  stats,
  isAdmin,
  links: {
    ASSIGNMENT_DETAIL_URI_FACTORY,
    ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY,
    ASSIGNMENT_EDIT_URI_FACTORY,
    ASSIGNMENT_STATS_URI_FACTORY
  }
}) =>
  <tr>
    <td className="text-center">
      {isAdmin
        ? <MaybePublicIcon id={id} isPublic={isPublic} />
        : <AssignmentStatusIcon id={id} status={status} accepted={accepted} />}
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
        <LocalizedExerciseName entity={{ name, localizedTexts }} />
      </Link>
    </td>

    {showGroup &&
      <td>
        {group}
      </td>}

    {runtimeEnvironments &&
      <td>
        <ResourceRenderer resource={runtimeEnvironments} returnAsArray>
          {runtimes => <EnvironmentsList runtimeEnvironments={runtimes} />}
        </ResourceRenderer>
      </td>}

    {!isAdmin &&
      stats &&
      <td>
        {stats.points && stats.points.gained !== null
          ? <span>
              {stats.points.gained}
              {stats.points.bonus > 0 &&
                <span style={{ color: 'green' }}>
                  +{stats.points.bonus}
                </span>}
              {stats.points.bonus < 0 &&
                <span style={{ color: 'red' }}>
                  {stats.points.bonus}
                </span>}/{stats.points.total}
            </span>
          : <span />}
      </td>}
    <td>
      <DateTime unixts={firstDeadline} isDeadline />
    </td>
    <td>
      <DateTime
        unixts={allowSecondDeadline ? secondDeadline : null}
        isDeadline
      />
    </td>
    {isAdmin &&
      <td className="text-right">
        <ButtonGroup>
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
        </ButtonGroup>
      </td>}
  </tr>;

AssignmentTableRow.propTypes = {
  showGroup: PropTypes.bool,
  item: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    localizedTexts: PropTypes.array,
    firstDeadline: PropTypes.number,
    secondDeadline: PropTypes.number,
    groupId: PropTypes.string
  }).isRequired,
  runtimeEnvironments: PropTypes.array,
  status: PropTypes.string,
  userId: PropTypes.string,
  stats: PropTypes.object,
  isAdmin: PropTypes.bool,
  links: PropTypes.object
};

export default withLinks(AssignmentTableRow);
