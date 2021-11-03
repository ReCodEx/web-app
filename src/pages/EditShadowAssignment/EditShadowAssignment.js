import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reset, formValueSelector, SubmissionError } from 'redux-form';
import { defaultMemoize } from 'reselect';
import moment from 'moment';

import Page from '../../components/layout/Page';
import { ShadowAssignmentNavigation } from '../../components/layout/Navigation';
import EditShadowAssignmentForm from '../../components/forms/EditShadowAssignmentForm';
import DeleteShadowAssignmentButtonContainer from '../../containers/DeleteShadowAssignmentButtonContainer';
import Box from '../../components/widgets/Box';
import { getLocalizedTextsInitialValues, transformLocalizedTextsFormData } from '../../helpers/localizedData';
import { EditShadowAssignmentIcon } from '../../components/icons';

import {
  fetchShadowAssignment,
  editShadowAssignment,
  validateShadowAssignment,
} from '../../redux/modules/shadowAssignments';
import { getShadowAssignment } from '../../redux/selectors/shadowAssignments';
import { isReady, getJsData } from '../../redux/helpers/resourceManager';

import { hasPermissions } from '../../helpers/common';
import withLinks from '../../helpers/withLinks';

const LOCALIZED_TEXT_DEFAULTS = {
  name: '',
  text: '',
  link: '',
};

class EditShadowAssignment extends Component {
  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.shadowId !== prevProps.match.params.shadowId) {
      this.props.reset();
      this.props.loadAsync();
    }

    if (isReady(this.props.shadowAssignment)) {
      this.groupId = getJsData(this.props.shadowAssignment).groupId;
    }
  }

  static loadAsync = ({ shadowId }, dispatch) => dispatch(fetchShadowAssignment(shadowId));

  getInitialValues = defaultMemoize(({ localizedTexts, isPublic, isBonus, maxPoints, deadline }) => ({
    sendNotification: true,
    isPublic,
    isBonus,
    maxPoints,
    deadline: deadline ? moment.unix(deadline) : null,
    localizedTexts: getLocalizedTextsInitialValues(localizedTexts, LOCALIZED_TEXT_DEFAULTS),
  }));

  editShadowAssignmentSubmitHandler = formData => {
    const { shadowAssignment, editShadowAssignment, validateShadowAssignment } = this.props;
    const version = shadowAssignment.getIn(['data', 'version']);

    // validate assignment version
    return validateShadowAssignment(version)
      .then(res => res.value)
      .then(({ versionIsUpToDate }) => {
        if (versionIsUpToDate === false) {
          throw new SubmissionError({
            _error: (
              <FormattedMessage
                id="app.editShadowAssignment.validation.versionDiffers"
                defaultMessage="Somebody has changed the shadow assignment while you have been editing it. Please reload the page and apply your changes once more."
              />
            ),
          });
        }
      })
      .then(() => {
        // prepare the data and submit them
        const { localizedTexts, deadline, ...data } = formData;
        return editShadowAssignment({
          ...data,
          deadline: deadline ? moment(deadline).unix() : null,
          localizedTexts: transformLocalizedTextsFormData(formData.localizedTexts),
          version,
        });
      });
  };

  render() {
    const {
      shadowAssignment,
      isPublic,
      match: {
        params: { shadowId },
      },
      history: { replace },
      links: { GROUP_DETAIL_URI_FACTORY },
    } = this.props;

    return (
      <Page
        resource={shadowAssignment}
        icon={<EditShadowAssignmentIcon />}
        title={
          <FormattedMessage id="app.editShadowAssignment.title" defaultMessage="Change Shadow Assignment Settings" />
        }>
        {shadowAssignment =>
          shadowAssignment && (
            <>
              <ShadowAssignmentNavigation
                shadowId={shadowAssignment.id}
                groupId={shadowAssignment.groupId}
                canEdit={hasPermissions(shadowAssignment, 'update')}
              />

              <EditShadowAssignmentForm
                initialValues={shadowAssignment ? this.getInitialValues(shadowAssignment) : {}}
                onSubmit={this.editShadowAssignmentSubmitHandler}
                beingPublished={!shadowAssignment.isPublic && isPublic}
              />

              {shadowAssignment.permissionHints.remove && (
                <Box
                  type="danger"
                  title={
                    <FormattedMessage
                      id="app.editShadowAssignment.deleteAssignment"
                      defaultMessage="Delete the shadow assignment"
                    />
                  }>
                  <div>
                    <p>
                      <FormattedMessage
                        id="app.editShadowAssignment.deleteAssignmentWarning"
                        defaultMessage="Deleting shadow assignment will remove all student points as well."
                      />
                    </p>
                    <p className="text-center">
                      <DeleteShadowAssignmentButtonContainer
                        id={shadowId}
                        onDeleted={() => replace(GROUP_DETAIL_URI_FACTORY(this.groupId))}
                      />
                    </p>
                  </div>
                </Box>
              )}
            </>
          )
        }
      </Page>
    );
  }
}

EditShadowAssignment.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      shadowId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  shadowAssignment: ImmutablePropTypes.map,
  editShadowAssignment: PropTypes.func.isRequired,
  isPublic: PropTypes.bool,
  validateShadowAssignment: PropTypes.func.isRequired,
  links: PropTypes.object,
};

const editAssignmentFormSelector = formValueSelector('editShadowAssignment');

export default connect(
  (
    state,
    {
      match: {
        params: { shadowId },
      },
    }
  ) => {
    const shadowAssignment = getShadowAssignment(state)(shadowId);
    return {
      shadowAssignment,
      isPublic: editAssignmentFormSelector(state, 'isPublic'),
    };
  },
  (
    dispatch,
    {
      match: {
        params: { shadowId },
      },
    }
  ) => ({
    reset: () => dispatch(reset('editShadowAssignment')),
    loadAsync: () => EditShadowAssignment.loadAsync({ shadowId }, dispatch),
    editShadowAssignment: data => dispatch(editShadowAssignment(shadowId, data)),
    validateShadowAssignment: version => dispatch(validateShadowAssignment(shadowId, version)),
  })
)(withLinks(EditShadowAssignment));
