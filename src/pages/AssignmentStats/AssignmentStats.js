import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { LinkContainer } from 'react-router-bootstrap';

import Button from '../../components/widgets/FlatButton';
import { usersSelector } from '../../redux/selectors/users';
import { groupSelector, studentsOfGroup } from '../../redux/selectors/groups';
import {
  getAssignment,
  assignmentEnvironmentsSelector
} from '../../redux/selectors/assignments';

import { fetchStudents } from '../../redux/modules/users';
import { isReady, getJsData, getId } from '../../redux/helpers/resourceManager';
import SolutionsTableContainer from '../../containers/SolutionsTableContainer';
import {
  fetchAssignmentIfNeeded,
  downloadBestSolutionsArchive
} from '../../redux/modules/assignments';
import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';

import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { ResubmitAllSolutionsContainer } from '../../containers/ResubmitSolutionContainer';
import HierarchyLineContainer from '../../containers/HierarchyLineContainer';
import { EditIcon, DownloadIcon } from '../../components/icons';

import { safeGet } from '../../helpers/common';
import withLinks from '../../helpers/withLinks';
import { getLocalizedName } from '../../helpers/getLocalizedData';

class AssignmentStats extends Component {
  static loadAsync = ({ assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchAssignmentIfNeeded(assignmentId))
        .then(res => res.value)
        .then(assignment =>
          Promise.all([
            dispatch(fetchGroupIfNeeded(assignment.groupId)),
            dispatch(fetchStudents(assignment.groupId))
          ])
        ),
      dispatch(fetchRuntimeEnvironments())
    ]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.assignmentId !== newProps.assignmentId) {
      newProps.loadAsync();
    }
  }

  getArchiveFileName = assignment => {
    const { assignmentId, intl: { locale: pageLocale } } = this.props;
    const name =
      assignment &&
      safeGet(
        assignment,
        ['localizedTexts', ({ locale }) => locale === pageLocale, 'name'],
        assignment.name
      );
    const safeName =
      name && name.normalize('NFD').replace(/[^-_a-zA-Z0-9.()[\] ]/g, '');
    return `${safeName || assignmentId}.zip`;
  };

  render() {
    const {
      assignmentId,
      assignment,
      getStudents,
      getGroup,
      runtimeEnvironments,
      downloadBestSolutionsArchive,
      intl: { locale },
      links: { ASSIGNMENT_EDIT_URI_FACTORY }
    } = this.props;

    return (
      <Page
        resource={assignment}
        title={assignment => getLocalizedName(assignment, locale)}
        description={
          <FormattedMessage
            id="app.assignmentStats.title"
            defaultMessage="Assignment statistics"
          />
        }
        breadcrumbs={[
          {
            resource: assignment,
            iconName: 'users',
            breadcrumb: assignment => ({
              text: (
                <FormattedMessage
                  id="app.group.title"
                  defaultMessage="Group detail"
                />
              ),
              link: ({ GROUP_DETAIL_URI_FACTORY }) =>
                GROUP_DETAIL_URI_FACTORY(assignment.groupId)
            })
          },
          {
            resource: assignment,
            iconName: 'puzzle-piece',
            breadcrumb: assignment => ({
              text: (
                <FormattedMessage
                  id="app.exercise.title"
                  defaultMessage="Exercise"
                />
              ),
              link: ({ EXERCISE_URI_FACTORY }) =>
                EXERCISE_URI_FACTORY(assignment.exerciseId)
            })
          },
          {
            resource: assignment,
            iconName: 'hourglass-start',
            breadcrumb: assignment => ({
              text: (
                <FormattedMessage
                  id="app.assignment.title"
                  defaultMessage="Exercise assignment"
                />
              ),
              link: ({ ASSIGNMENT_DETAIL_URI_FACTORY }) =>
                ASSIGNMENT_DETAIL_URI_FACTORY(assignment.id)
            })
          },
          {
            text: (
              <FormattedMessage
                id="app.assignmentStats.title"
                defaultMessage="Assignment statistics"
              />
            ),
            iconName: 'chart-line'
          }
        ]}
      >
        {assignment =>
          <div>
            <Row>
              <Col xs={12}>
                <HierarchyLineContainer groupId={assignment.groupId} />
                <p>
                  <LinkContainer
                    to={ASSIGNMENT_EDIT_URI_FACTORY(assignment.id)}
                  >
                    <Button bsStyle="warning">
                      <EditIcon gapRight />
                      <FormattedMessage
                        id="app.assignment.editSettings"
                        defaultMessage="Edit Assignment Settings"
                      />
                    </Button>
                  </LinkContainer>
                  <a
                    href="#"
                    onClick={downloadBestSolutionsArchive(
                      this.getArchiveFileName(assignment)
                    )}
                  >
                    <Button bsStyle="primary">
                      <DownloadIcon gapRight />
                      <FormattedMessage
                        id="app.assignment.downloadBestSolutionsArchive"
                        defaultMessage="Download Best Solutions"
                      />
                    </Button>
                  </a>
                  <ResubmitAllSolutionsContainer assignmentId={assignment.id} />
                </p>
              </Col>
            </Row>
            <ResourceRenderer
              resource={[getGroup(assignment.groupId), ...runtimeEnvironments]}
            >
              {(group, ...runtimes) =>
                <div>
                  {getStudents(group.id)
                    .sort((a, b) => {
                      const aName = a.name.lastName + ' ' + a.name.firstName;
                      const bName = b.name.lastName + ' ' + b.name.firstName;
                      return aName.localeCompare(bName, locale);
                    })
                    .map(user =>
                      <Row key={user.id}>
                        <Col sm={12}>
                          <SolutionsTableContainer
                            title={user.fullName}
                            userId={user.id}
                            assignmentId={assignmentId}
                            runtimeEnvironments={runtimes}
                            noteMaxlen={160}
                          />
                        </Col>
                      </Row>
                    )}
                </div>}
            </ResourceRenderer>
          </div>}
      </Page>
    );
  }
}

AssignmentStats.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  assignment: PropTypes.object,
  getStudents: PropTypes.func.isRequired,
  getGroup: PropTypes.func.isRequired,
  runtimeEnvironments: PropTypes.array,
  loadAsync: PropTypes.func.isRequired,
  downloadBestSolutionsArchive: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(
  connect(
    (state, { params: { assignmentId } }) => {
      const assignment = getAssignment(state)(assignmentId);
      const getStudentsIds = groupId => studentsOfGroup(groupId)(state);
      const readyUsers = usersSelector(state).toList().filter(isReady);

      return {
        assignmentId,
        assignment,
        getStudentsIds,
        getStudents: groupId =>
          readyUsers
            .filter(user => getStudentsIds(groupId).includes(getId(user)))
            .map(getJsData),
        getGroup: id => groupSelector(id)(state),
        runtimeEnvironments: assignmentEnvironmentsSelector(state)(assignmentId)
      };
    },
    (dispatch, { params: { assignmentId } }) => ({
      loadAsync: () => AssignmentStats.loadAsync({ assignmentId }, dispatch),
      downloadBestSolutionsArchive: name => ev => {
        ev.preventDefault();
        dispatch(downloadBestSolutionsArchive(assignmentId, name));
      }
    })
  )(injectIntl(AssignmentStats))
);
