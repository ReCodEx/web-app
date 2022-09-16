import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import Icon, { GroupIcon, AssignmentsIcon } from '../../icons';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import { getGroupCanonicalLocalizedName } from '../../../helpers/localizedData';
import { identity } from '../../../helpers/common';
import withLinks from '../../../helpers/withLinks';

const AssignmentFormMultiassignSuccess = ({
  assignedToGroups,
  groups,
  groupsAccessor,
  acknowledgeSuccess,
  intl: { locale },
  links: { GROUP_INFO_URI_FACTORY, GROUP_ASSIGNMENTS_URI_FACTORY },
}) => (
  <>
    <Callout variant="success">
      <h4>
        <FormattedMessage id="app.multiAssignForm.successHeading" defaultMessage="Exercise Assigned" />
      </h4>
      <p>
        <FormattedMessage
          id="app.multiAssignForm.successDescription"
          defaultMessage="The exercise was successfuly assigned to the following groups."
        />
      </p>
    </Callout>
    <Table>
      <tbody>
        {assignedToGroups
          .map(gId => groups.find(({ id }) => id === gId))
          .filter(identity)
          .map(group => (
            <tr key={group.id}>
              <td className="text-nowrap shrink-col">
                <Icon icon="check" />
              </td>
              <td>{getGroupCanonicalLocalizedName(group, groupsAccessor, locale)}</td>
              <td className="text-right">
                <TheButtonGroup>
                  <Link to={GROUP_INFO_URI_FACTORY(group.id)}>
                    <Button size="xs" variant="primary">
                      <GroupIcon gapRight />
                      <FormattedMessage id="app.group.info" defaultMessage="Group Info" />
                    </Button>
                  </Link>
                  <Link to={GROUP_ASSIGNMENTS_URI_FACTORY(group.id)}>
                    <Button size="xs" variant="primary">
                      <AssignmentsIcon gapRight />
                      <FormattedMessage id="app.group.assignments" defaultMessage="Assignments" />
                    </Button>
                  </Link>
                </TheButtonGroup>
              </td>
            </tr>
          ))}
      </tbody>
    </Table>

    <div className="text-center">
      <Button variant="warning" onClick={acknowledgeSuccess}>
        <Icon icon={['far', 'smile']} gapRight />
        <FormattedMessage id="generic.acknowledge" defaultMessage="Acknowledge" />
      </Button>
    </div>
  </>
);

AssignmentFormMultiassignSuccess.propTypes = {
  assignedToGroups: PropTypes.array.isRequired,
  groups: PropTypes.array.isRequired,
  groupsAccessor: PropTypes.func.isRequired,
  acknowledgeSuccess: PropTypes.func,
  intl: PropTypes.object.isRequired,
  links: PropTypes.object.isRequired,
};

export default injectIntl(withLinks(AssignmentFormMultiassignSuccess));
