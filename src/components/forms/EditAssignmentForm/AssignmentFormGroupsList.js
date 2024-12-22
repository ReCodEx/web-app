import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import { CheckboxField } from '../Fields';
import Icon, { SquareIcon } from '../../icons';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import { getGroupCanonicalLocalizedName } from '../../../helpers/localizedData.js';

const AssignmentFormGroupsList = ({
  groups,
  groupsAccessor,
  isOpen,
  toggleOpenState,
  selectAllGroupsHandler,
  clearAllGroupsHandler,
  intl: { locale },
}) => (
  <>
    {groups.map((group, i) => (
      <Field
        key={group.id}
        name={`groups.id${group.id}`}
        component={CheckboxField}
        label={getGroupCanonicalLocalizedName(group, groupsAccessor, locale)}
      />
    ))}

    <div className="text-center">
      <TheButtonGroup>
        {Boolean(selectAllGroupsHandler) && (
          <Button onClick={selectAllGroupsHandler} variant="primary" size="sm">
            <SquareIcon checked gapRight={2} />
            <FormattedMessage id="generic.selectAll" defaultMessage="Select All" />
          </Button>
        )}
        {Boolean(clearAllGroupsHandler) && (
          <Button onClick={clearAllGroupsHandler} variant="primary" size="sm">
            <SquareIcon gapRight={2} />
            <FormattedMessage id="generic.clearAll" defaultMessage="Clear All" />
          </Button>
        )}
        {toggleOpenState !== null && (
          <Button size="sm" variant="secondary" onClick={toggleOpenState}>
            {isOpen ? (
              <span>
                <Icon icon="minus-square" gapRight={2} />
                <FormattedMessage id="app.multiAssignForm.showMyGroups" defaultMessage="Show My Groups Only" />
              </span>
            ) : (
              <span>
                <Icon icon="plus-square" gapRight={2} />
                <FormattedMessage id="app.multiAssignForm.showAllGroups" defaultMessage="Show All Groups" />
              </span>
            )}
          </Button>
        )}
      </TheButtonGroup>
    </div>
    <hr />
  </>
);

AssignmentFormGroupsList.propTypes = {
  groups: PropTypes.array.isRequired,
  groupsAccessor: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleOpenState: PropTypes.func,
  selectAllGroupsHandler: PropTypes.func,
  clearAllGroupsHandler: PropTypes.func,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(AssignmentFormGroupsList);
