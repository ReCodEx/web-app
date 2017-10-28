import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, getFormValues, initialize } from 'redux-form';
import moment from 'moment';
import PageContent from '../../components/layout/PageContent';

import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import EditAssignmentForm from '../../components/forms/EditAssignmentForm';
import DeleteAssignmentButtonContainer from '../../containers/DeleteAssignmentButtonContainer';
import Box from '../../components/widgets/Box';
import { LoadingIcon, WarningIcon } from '../../components/icons';

import {
  fetchAssignment,
  editAssignment
} from '../../redux/modules/assignments';
import { getAssignment } from '../../redux/selectors/assignments';
import { canSubmitSolution } from '../../redux/selectors/canSubmit';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { isReady, getJsData } from '../../redux/helpers/resourceManager';

import withLinks from '../../hoc/withLinks';

class EditAssignment extends Component {
  componentWillMount = () => this.props.loadAsync();
  componentWillReceiveProps = props => {
    if (this.props.params.assignmentId !== props.params.assignmentId) {
      props.reset();
      props.loadAsync();
    }

    if (isReady(props.assignment)) {
      this.groupId = getJsData(props.assignment).groupId;
    }
  };

  static loadAsync = ({ assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchAssignment(assignmentId)),
      dispatch(fetchRuntimeEnvironments())
    ]);

  getInitialValues = ({
    firstDeadline,
    secondDeadline,
    pointsPercentualThreshold,
    ...rest
  }) => ({
    firstDeadline: moment.unix(firstDeadline),
    secondDeadline: moment.unix(secondDeadline),
    pointsPercentualThreshold: pointsPercentualThreshold * 100,
    ...rest
  });

  render() {
    const {
      links: { ASSIGNMENT_DETAIL_URI_FACTORY, GROUP_URI_FACTORY },
      params: { assignmentId },
      push,
      assignment,
      editAssignment,
      formValues
    } = this.props;

    return (
      <PageContent
        title={
          <FormattedMessage
            id="app.editAssignment.title"
            defaultMessage="Edit assignment settings"
          />
        }
        description={
          <FormattedMessage
            id="app.editAssignment.description"
            defaultMessage="Change assignment settings and limits"
          />
        }
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.assignment.title" />,
            iconName: 'puzzle-piece',
            link: ASSIGNMENT_DETAIL_URI_FACTORY(assignmentId)
          },
          {
            text: <FormattedMessage id="app.editAssignment.title" />,
            iconName: 'pencil'
          }
        ]}
      >
        <div>
          <ResourceRenderer
            loading={
              <Box
                title={
                  <FormattedMessage
                    id="app.editAssignment.loading"
                    defaultMessage="Loading ..."
                  />
                }
              >
                <p>
                  <LoadingIcon />{' '}
                  <FormattedMessage
                    id="app.editAssignment.loadingDescription"
                    defaultMessage="Loading latest assignment settings ..."
                  />
                </p>
              </Box>
            }
            failed={
              <Box
                title={
                  <FormattedMessage
                    id="app.editAssignment.failed"
                    defaultMessage="Failed loading assignment settings"
                  />
                }
              >
                <p>
                  <WarningIcon />{' '}
                  <FormattedMessage
                    id="app.editAssignment.failedDescription"
                    defaultMessage="Assignment settings could not have been loaded."
                  />
                </p>
              </Box>
            }
            resource={assignment}
          >
            {data =>
              <div>
                <EditAssignmentForm
                  assignment={data}
                  initialValues={data ? this.getInitialValues(data) : {}}
                  onSubmit={formData => editAssignment(data.version, formData)}
                  formValues={formValues}
                />
              </div>}
          </ResourceRenderer>
          <br />
          <Box
            type="danger"
            title={
              <FormattedMessage
                id="app.editAssignment.deleteAssignment"
                defaultMessage="Delete the assignment"
              />
            }
          >
            <div>
              <p>
                <FormattedMessage
                  id="app.editAssignment.deleteAssignmentWarning"
                  defaultMessage="Deleting an assignment will remove all the students submissions and you will have to contact the administrator of ReCodEx if you wanted to restore the assignment in the future."
                />
              </p>
              <p className="text-center">
                <DeleteAssignmentButtonContainer
                  id={assignmentId}
                  onDeleted={() => push(GROUP_URI_FACTORY(this.groupId))}
                />
              </p>
            </div>
          </Box>
        </div>
      </PageContent>
    );
  }
}

EditAssignment.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired
  }).isRequired,
  assignment: ImmutablePropTypes.map,
  runtimeEnvironments: ImmutablePropTypes.map,
  editAssignment: PropTypes.func.isRequired,
  formValues: PropTypes.object,
  links: PropTypes.object
};

export default withLinks(
  connect(
    (state, { params: { assignmentId } }) => {
      const assignmentSelector = getAssignment(assignmentId);
      const userId = loggedInUserIdSelector(state);
      return {
        assignment: assignmentSelector(state),
        runtimeEnvironments: runtimeEnvironmentsSelector(state),
        submitting: isSubmitting(state),
        userId,
        canSubmit: canSubmitSolution(assignmentId)(state),
        formValues: getFormValues('editAssignment')(state)
      };
    },
    (dispatch, { params: { assignmentId } }) => ({
      push: url => dispatch(push(url)),
      reset: () => dispatch(reset('editAssignment')),
      loadAsync: () => EditAssignment.loadAsync({ assignmentId }, dispatch),
      editAssignment: (version, data) => {
        // convert deadline times to timestamps
        const processedData = Object.assign({}, data, {
          firstDeadline: moment(data.firstDeadline).unix(),
          secondDeadline: moment(data.secondDeadline).unix(),
          submissionsCountLimit: Number(data.submissionsCountLimit),
          version
        });
        if (!processedData.allowSecondDeadline) {
          delete processedData.secondDeadline;
          delete processedData.maxPointsBeforeSecondDeadline;
        }
        return dispatch(editAssignment(assignmentId, processedData));
        /*
        return dispatch(editAssignment(assignmentId, processedData)).then(() =>
          dispatch(
            initialize('editAssignment', { ...data, version: version + 1 })
          )
        );
*/
      }
    })
  )(EditAssignment)
);
