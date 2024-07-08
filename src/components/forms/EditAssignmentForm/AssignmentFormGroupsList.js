import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import { CheckboxField } from '../Fields';
import Icon from '../../icons';
import Button from '../../widgets/TheButton';
import { getGroupCanonicalLocalizedName } from '../../../helpers/localizedData.js';

const AssignmentFormGroupsList = ({ groups, groupsAccessor, isOpen, toggleOpenState, intl: { locale } }) => (
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
      {toggleOpenState !== null && (
        <Button size="xs" variant="primary" onClick={toggleOpenState}>
          {isOpen ? (
            <span>
              <Icon icon="minus-square" gapRight />
              <FormattedMessage id="app.multiAssignForm.showMyGroups" defaultMessage="Show My Groups Only" />
            </span>
          ) : (
            <span>
              <Icon icon="plus-square" gapRight />
              <FormattedMessage id="app.multiAssignForm.showAllGroups" defaultMessage="Show All Groups" />
            </span>
          )}
        </Button>
      )}
    </div>
    <hr />
  </>
);

AssignmentFormGroupsList.propTypes = {
  groups: PropTypes.array.isRequired,
  groupsAccessor: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleOpenState: PropTypes.func,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(AssignmentFormGroupsList);
