import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reset, formValueSelector, SubmissionError } from 'redux-form';
import { lruMemoize } from 'reselect';
import moment from 'moment';

import Page from '../../components/layout/Page';
import { ShadowAssignmentNavigation } from '../../components/layout/Navigation';
import EditShadowAssignmentForm from '../../components/forms/EditShadowAssignmentForm';
import DeleteShadowAssignmentButtonContainer from '../../containers/DeleteShadowAssignmentButtonContainer';
import Box from '../../components/widgets/Box';
import { getLocalizedTextsInitialValues, transformLocalizedTextsFormData } from '../../helpers/localizedData.js';
import { EditShadowAssignmentIcon } from '../../components/icons';

import {
  fetchShadowAssignment,
  editShadowAssignment,
  validateShadowAssignment,
} from '../../redux/modules/shadowAssignments.js';
import { getShadowAssignment } from '../../redux/selectors/shadowAssignments.js';
import { isReady, getJsData } from '../../redux/helpers/resourceManager';

import { hasPermissions } from '../../helpers/common.js';
import withLinks from '../../helpers/withLinks.js';
import { withRouterProps } from '../../helpers/withRouter.js';

const LOCALIZED_TEXT_DEFAULTS = {
  name: '',
  text: '',
  link: '',
};

class EditShadowAssignment extends Component {
  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.shadowId !== prevProps.params.shadowId) {
      this.props.reset();
      this.props.loadAsync();
    }

    if (isReady(this.props.shadowAssignment)) {
      this.groupId = getJsData(this.props.shadowAssignment).groupId;
    }
  }

  static loadAsync = ({ shadowId }, dispatch) => dispatch(fetchShadowAssignment(shadowId));

  getInitialValues = lruMemoize(({ localizedTexts, isPublic, isBonus, maxPoints, deadline }) => ({
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
      params: { shadowId },
      navigate,
      links: { GROUP_ASSIGNMENTS_URI_FACTORY },
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
                  <Row className="align-items-center">
                    <Col xs={false} sm="auto">
                      <DeleteShadowAssignmentButtonContainer
                        id={shadowId}
                        size="lg"
                        className="m-2"
                        onDeleted={() => navigate(GROUP_ASSIGNMENTS_URI_FACTORY(this.groupId), { replace: true })}
                      />
                    </Col>
                    <Col xs={12} sm className="text-muted">
                      <FormattedMessage
                        id="app.editShadowAssignment.deleteAssignmentWarning"
                        defaultMessage="Deleting shadow assignment will remove all student points as well."
                      />
                    </Col>
                  </Row>
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
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  params: PropTypes.shape({
    shadowId: PropTypes.string.isRequired,
  }).isRequired,
  shadowAssignment: ImmutablePropTypes.map,
  editShadowAssignment: PropTypes.func.isRequired,
  isPublic: PropTypes.bool,
  validateShadowAssignment: PropTypes.func.isRequired,
  links: PropTypes.object,
  navigate: withRouterProps.navigate,
};

const editAssignmentFormSelector = formValueSelector('editShadowAssignment');

export default connect(
  (state, { params: { shadowId } }) => {
    const shadowAssignment = getShadowAssignment(state)(shadowId);
    return {
      shadowAssignment,
      isPublic: editAssignmentFormSelector(state, 'isPublic'),
    };
  },
  (dispatch, { params: { shadowId } }) => ({
    reset: () => dispatch(reset('editShadowAssignment')),
    loadAsync: () => EditShadowAssignment.loadAsync({ shadowId }, dispatch),
    editShadowAssignment: data => dispatch(editShadowAssignment(shadowId, data)),
    validateShadowAssignment: version => dispatch(validateShadowAssignment(shadowId, version)),
  })
)(withLinks(EditShadowAssignment));
