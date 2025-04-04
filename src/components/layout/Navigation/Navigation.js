import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';

import AssignmentNameContainer from '../../../containers/AssignmentNameContainer';
import ExercisesNameContainer from '../../../containers/ExercisesNameContainer';
import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import ShadowAssignmentNameContainer from '../../../containers/ShadowAssignmentNameContainer';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import PipelineNameContainer from '../../../containers/PipelineNameContainer';
import { AssignmentIcon, ExerciseIcon, PipelineIcon, ShadowAssignmentIcon } from '../../icons';

import * as styles from './Navigation.less';

const defaultLinkMatch = (link, pathname, search) => link === pathname + search;

const groupIconTooltip = group => {
  if (group.exam) {
    return <FormattedMessage id="app.navigation.examGroup" defaultMessage="Exam group" />;
  }
  if (group.organizational) {
    return <FormattedMessage id="app.navigation.organizationalGroup" defaultMessage="Organizational group" />;
  }
  return <FormattedMessage id="app.navigation.group" defaultMessage="Group" />;
};

const NavigationLink = ({
  link,
  href,
  caption,
  icon = null,
  location: { pathname, search },
  className,
  match = defaultLinkMatch,
}) =>
  match(link, pathname, search) ? (
    <strong className={`text-success ${className}`}>
      {icon}
      {caption}
    </strong>
  ) : href ? (
    <a href={href} className={className}>
      {icon}
      {caption}
    </a>
  ) : (
    <Link to={link} className={className}>
      {icon}
      {caption}
    </Link>
  );

NavigationLink.propTypes = {
  link: PropTypes.string,
  href: PropTypes.string,
  caption: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  icon: PropTypes.element,
  className: PropTypes.string,
  match: PropTypes.func,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
  }).isRequired,
};

const Navigation = ({
  groupId = null,
  exerciseId = null,
  assignmentId = null,
  shadowId = null,
  pipelineId = null,
  userId = null,
  emphasizeUser = false,
  links,
  secondaryLinks,
  titlePrefix = null,
  titleSuffix = null,
}) => {
  const location = useLocation();
  links = Array.isArray(links) ? links.filter(link => link) : [];
  secondaryLinks = Array.isArray(secondaryLinks) ? secondaryLinks.filter(link => link) : [];
  const onlyUser = Boolean(userId && !groupId && !exerciseId && !assignmentId && !shadowId);

  return (
    <Card className="shadow-sm mb-3">
      <Card.Header>
        <Card.Title className={styles.title}>
          {userId && emphasizeUser && (
            <div className="mb-3">
              <UsersNameContainer
                userId={userId}
                large={onlyUser}
                showEmail={onlyUser ? 'full' : 'icon'}
                showExternalIdentifiers
                showRoleIcon={onlyUser}
              />
            </div>
          )}

          {titlePrefix && <span>{titlePrefix}</span>}

          {groupId && (
            <span>
              <GroupsNameContainer
                groupId={groupId}
                fullName
                translations
                admins
                ancestorLinks
                showIcon
                iconTooltip={groupIconTooltip}
              />
            </span>
          )}

          {assignmentId && (
            <span>
              <AssignmentIcon
                gapRight={2}
                className="text-body-secondary"
                tooltipId="assignmentIconTooltip"
                tooltipPlacement="bottom"
                tooltip={<FormattedMessage id="app.navigation.assignment" defaultMessage="Assignment" />}
              />
              <AssignmentNameContainer assignmentId={assignmentId} noLink />
            </span>
          )}

          {exerciseId && (
            <span>
              <ExerciseIcon
                gapRight={2}
                className="text-body-secondary"
                tooltipId="exerciseIconTooltip"
                tooltipPlacement="bottom"
                tooltip={<FormattedMessage id="app.navigation.exercise" defaultMessage="Exercise" />}
              />
              <ExercisesNameContainer exerciseId={exerciseId} noLink />
            </span>
          )}

          {shadowId && (
            <span>
              <ShadowAssignmentIcon
                gapRight={2}
                className="text-body-secondary"
                tooltipId="shadowIconTooltip"
                tooltipPlacement="bottom"
                tooltip={<FormattedMessage id="app.navigation.shadowAssignment" defaultMessage="Shadow Assignment" />}
              />
              <ShadowAssignmentNameContainer shadowAssignmentId={shadowId} noLink />
            </span>
          )}

          {pipelineId && (
            <span>
              <PipelineIcon
                gapRight={2}
                className="text-body-secondary"
                tooltipId="pipelineIconTooltip"
                tooltipPlacement="bottom"
                tooltip={<FormattedMessage id="app.navigation.pipeline" defaultMessage="Pipeline" />}
              />
              <PipelineNameContainer pipelineId={pipelineId} noLink />
            </span>
          )}

          {userId && !emphasizeUser && (
            <UsersNameContainer
              userId={userId}
              large={onlyUser}
              showEmail={onlyUser ? 'full' : 'icon'}
              showExternalIdentifiers
              showRoleIcon={onlyUser}
            />
          )}

          {titleSuffix && <span>{titleSuffix}</span>}
        </Card.Title>
      </Card.Header>

      {(links.length > 0 || secondaryLinks.length > 0) && (
        <Card.Footer className={styles.links}>
          {links.map(link => (
            <NavigationLink key={link.link || link.href} {...link} location={location} />
          ))}

          {secondaryLinks.map(link => (
            <NavigationLink key={link.link || link.href} {...link} className={styles.secondary} location={location} />
          ))}
        </Card.Footer>
      )}
    </Card>
  );
};

Navigation.propTypes = {
  groupId: PropTypes.string,
  exerciseId: PropTypes.string,
  assignmentId: PropTypes.string,
  shadowId: PropTypes.string,
  pipelineId: PropTypes.string,
  userId: PropTypes.string,
  emphasizeUser: PropTypes.bool,
  links: PropTypes.array,
  secondaryLinks: PropTypes.array,
  titlePrefix: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  titleSuffix: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

export default Navigation;
