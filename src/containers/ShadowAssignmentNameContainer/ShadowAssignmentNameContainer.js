import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { fetchShadowAssignmentIfNeeded } from '../../redux/modules/shadowAssignments.js';
import { getShadowAssignment } from '../../redux/selectors/shadowAssignments.js';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LocalizedExerciseName } from '../../components/helpers/LocalizedNames';
import { LoadingIcon } from '../../components/icons';
import withLinks from '../../helpers/withLinks.js';

class ShadowAssignmentNameContainer extends Component {
  componentDidMount() {
    ShadowAssignmentNameContainer.loadData(this.props);
  }

  componentDidUpdate(prevProps) {
    if (this.props.shadowAssignmentId !== prevProps.shadowAssignmentId) {
      ShadowAssignmentNameContainer.loadData(this.props);
    }
  }

  static loadData = ({ loadAssignmentIfNeeded }) => {
    loadAssignmentIfNeeded();
  };

  render() {
    const {
      assignment,
      noLink,
      links: { SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY },
    } = this.props;
    return (
      <ResourceRenderer
        resource={assignment}
        loading={
          <>
            <LoadingIcon gapRight={2} />
            <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
          </>
        }>
        {({ id, name, localizedTexts }) =>
          noLink ? (
            <LocalizedExerciseName entity={{ name: '??', localizedTexts }} />
          ) : (
            <Link to={SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY(id)}>
              <LocalizedExerciseName entity={{ name: '??', localizedTexts }} />
            </Link>
          )
        }
      </ResourceRenderer>
    );
  }
}

ShadowAssignmentNameContainer.propTypes = {
  shadowAssignmentId: PropTypes.string.isRequired,
  assignment: ImmutablePropTypes.map,
  noLink: PropTypes.bool,
  loadAssignmentIfNeeded: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(
  connect(
    (state, { shadowAssignmentId }) => ({
      assignment: getShadowAssignment(state)(shadowAssignmentId),
    }),
    (dispatch, { shadowAssignmentId }) => ({
      loadAssignmentIfNeeded: () => dispatch(fetchShadowAssignmentIfNeeded(shadowAssignmentId)),
    })
  )(ShadowAssignmentNameContainer)
);
