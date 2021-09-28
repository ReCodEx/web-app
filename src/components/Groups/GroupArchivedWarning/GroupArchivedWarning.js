import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import Callout from '../../widgets/Callout';

const GroupArchivedWarning = ({
  archived = false,
  directlyArchived = false,
  parentGroupsIds = [],
  groupsDataAccessor = null,
  linkFactory = null,
}) => {
  const directlyArchivedAncestors =
    archived &&
    !directlyArchived &&
    groupsDataAccessor &&
    parentGroupsIds.filter(id => groupsDataAccessor(id) && groupsDataAccessor(id).get('directlyArchived'));

  return archived ? (
    <Row>
      <Col lg={12}>
        <Callout variant="warning">
          <FormattedMessage
            id="app.group.archivedExplain"
            defaultMessage="This group is archived, so it cannot be modified."
          />
          <br />
          {!directlyArchived && (
            <>
              <FormattedMessage
                id="app.group.notDirectlyArchived"
                defaultMessage="This group inherits the archived flag from one of its parent groups."
              />
              {directlyArchivedAncestors && directlyArchivedAncestors.length > 0 && (
                <ul>
                  {directlyArchivedAncestors.map(id => (
                    <li key={id}>
                      {linkFactory ? (
                        <Link to={linkFactory(id)}>
                          <GroupsNameContainer groupId={id} fullName />
                        </Link>
                      ) : (
                        <GroupsNameContainer groupId={id} fullName links />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Callout>
      </Col>
    </Row>
  ) : null;
};

GroupArchivedWarning.propTypes = {
  archived: PropTypes.bool,
  directlyArchived: PropTypes.bool,
  parentGroupsIds: PropTypes.array,
  groupsDataAccessor: PropTypes.func,
  linkFactory: PropTypes.func,
};

export default GroupArchivedWarning;
