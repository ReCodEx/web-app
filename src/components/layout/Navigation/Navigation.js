import React from 'react';
import PropTypes from 'prop-types';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import AssignmentNameContainer from '../../../containers/AssignmentNameContainer';
import ExercisesNameContainer from '../../../containers/ExercisesNameContainer';
import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import ShadowAssignmentNameContainer from '../../../containers/ShadowAssignmentNameContainer';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import { AssignmentIcon, ExerciseIcon, GroupIcon, ShadowAssignmentIcon } from '../../icons';

import styles from './Navigation.less';

const NavigationLink = ({ link, href, caption, icon = null, location: { pathname, search }, className }) =>
  link === pathname + search ? (
    <strong className={className}>
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
  userId = null,
  emphasizeUser = false,
  links,
  secondaryLinks,
  location,
}) => {
  links = Array.isArray(links) ? links.filter(link => link) : [];
  secondaryLinks = Array.isArray(secondaryLinks) ? secondaryLinks.filter(link => link) : [];
  const onlyUser = Boolean(userId && !groupId && !exerciseId && !assignmentId && !shadowId);

  return (
    <Card className="elevation-2">
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

          {groupId && (
            <span>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="groupIconTooltip">
                    <FormattedMessage id="app.navigation.group" defaultMessage="Group" />
                  </Tooltip>
                }>
                <GroupIcon gapRight className="text-muted" />
              </OverlayTrigger>
              <GroupsNameContainer groupId={groupId} fullName translations admins ancestorLinks />
            </span>
          )}

          {assignmentId && (
            <span>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="assignmentIconTooltip">
                    <FormattedMessage id="app.navigation.assignment" defaultMessage="Assignment" />
                  </Tooltip>
                }>
                <AssignmentIcon gapRight className="text-muted" />
              </OverlayTrigger>
              <AssignmentNameContainer assignmentId={assignmentId} noLink />
            </span>
          )}

          {exerciseId && (
            <span>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="exerciseIconTooltip">
                    <FormattedMessage id="app.navigation.exercise" defaultMessage="Exercise" />
                  </Tooltip>
                }>
                <ExerciseIcon gapRight className="text-muted" />
              </OverlayTrigger>
              <ExercisesNameContainer exerciseId={exerciseId} noLink />
            </span>
          )}

          {shadowId && (
            <span>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="shadowIconTooltip">
                    <FormattedMessage id="app.navigation.shadowAssignment" defaultMessage="Shadow Assignment" />
                  </Tooltip>
                }>
                <ShadowAssignmentIcon gapRight className="text-muted" />
              </OverlayTrigger>
              <ShadowAssignmentNameContainer shadowAssignmentId={shadowId} noLink />
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
  userId: PropTypes.string,
  emphasizeUser: PropTypes.bool,
  links: PropTypes.array,
  secondaryLinks: PropTypes.array,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
  }).isRequired,
};

export default withRouter(Navigation);
