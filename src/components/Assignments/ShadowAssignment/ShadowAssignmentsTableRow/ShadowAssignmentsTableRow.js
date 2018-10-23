import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { LinkContainer } from 'react-router-bootstrap';

import withLinks from '../../../../helpers/withLinks';
import { LocalizedExerciseName } from '../../../helpers/LocalizedNames';
import {
  EditIcon,
  MaybeBonusAssignmentIcon,
  VisibleIcon
} from '../../../icons';
import DeleteAssignmentButtonContainer from '../../../../containers/DeleteAssignmentButtonContainer';
import Button from '../../../widgets/FlatButton';
import DateTime from '../../../widgets/DateTime';

const ShadowAssignmentsTableRow = ({
  item: { id, localizedTexts, createdAt, isBonus, isPublic },
  userId,
  stats,
  isAdmin,
  links: {
    SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY,
    //ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY,
    SHADOW_ASSIGNMENT_EDIT_URI_FACTORY
  }
}) =>
  <tr>
    {isAdmin &&
      <td className="text-center shrink-col">
        <VisibleIcon visible={isPublic} />
      </td>}

    <td>
      <MaybeBonusAssignmentIcon id={id} isBonus={isBonus} />
      <Link to={SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY(id)}>
        <LocalizedExerciseName
          entity={{ name: '-- undefined --', localizedTexts }}
        />
      </Link>
    </td>
    <td>
      <DateTime unixts={createdAt} />
    </td>

    {!isAdmin &&
      stats &&
      <td>
        {/* TODO stats.points && stats.points.gained !== null
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
              : <span /> */}
      </td>}

    {isAdmin &&
      <td className="text-right">
        <LinkContainer to={SHADOW_ASSIGNMENT_EDIT_URI_FACTORY(id)}>
          <Button bsSize="xs" bsStyle="warning">
            <EditIcon gapRight />
            <FormattedMessage id="generic.edit" defaultMessage="Edit" />
          </Button>
        </LinkContainer>
        <DeleteAssignmentButtonContainer id={id} bsSize="xs" />
      </td>}
  </tr>;

ShadowAssignmentsTableRow.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    localizedTexts: PropTypes.array,
    createdAt: PropTypes.number
  }).isRequired,
  userId: PropTypes.string,
  stats: PropTypes.object,
  isAdmin: PropTypes.bool,
  links: PropTypes.object
};

export default withLinks(ShadowAssignmentsTableRow);
