import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments.js';
import { getAssignment } from '../../redux/selectors/assignments.js';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import { LoadingIcon } from '../../components/icons';
import withLinks from '../../helpers/withLinks.js';

class AssignmentNameContainer extends Component {
  componentDidMount() {
    AssignmentNameContainer.loadData(this.props);
  }

  componentDidUpdate(prevProps) {
    if (this.props.assignmentId !== prevProps.assignmentId) {
      AssignmentNameContainer.loadData(this.props);
    }
  }

  static loadData = ({ loadAssignmentIfNeeded }) => {
    loadAssignmentIfNeeded();
  };

  render() {
    const {
      assignment,
      noLink,
      links: { ASSIGNMENT_DETAIL_URI_FACTORY },
    } = this.props;
    return (
      <ResourceRenderer
        resource={assignment}
        loading={
          <>
            <LoadingIcon gapRight />
            <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
          </>
        }>
        {({ id, name, localizedTexts }) =>
          noLink ? (
            <LocalizedExerciseName entity={{ name: '??', localizedTexts }} />
          ) : (
            <Link to={ASSIGNMENT_DETAIL_URI_FACTORY(id)}>
              <LocalizedExerciseName entity={{ name: '??', localizedTexts }} />
            </Link>
          )
        }
      </ResourceRenderer>
    );
  }
}

AssignmentNameContainer.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  assignment: ImmutablePropTypes.map,
  noLink: PropTypes.bool,
  loadAssignmentIfNeeded: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(
  connect(
    (state, { assignmentId }) => ({
      assignment: getAssignment(state, assignmentId),
    }),
    (dispatch, { assignmentId }) => ({
      loadAssignmentIfNeeded: () => dispatch(fetchAssignmentIfNeeded(assignmentId)),
    })
  )(AssignmentNameContainer)
);
