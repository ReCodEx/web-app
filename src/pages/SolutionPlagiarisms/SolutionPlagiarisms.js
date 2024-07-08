import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Card, Table, Row, Col } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import PageContent from '../../components/layout/PageContent';
import Callout from '../../components/widgets/Callout';
import { AssignmentSolutionNavigation } from '../../components/layout/Navigation';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import PlagiarismCodeBoxWithSelector from '../../components/Solutions/PlagiarismCodeBoxWithSelector';
import Icon, { BanIcon, PlagiarismIcon, UserIcon } from '../../components/icons';
import UsersNameContainer from '../../containers/UsersNameContainer';

import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments.js';
import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments.js';
import { fetchSolutionIfNeeded, fetchUsersSolutions } from '../../redux/modules/solutions.js';
import { fetchAssignmentSolutionFilesIfNeeded } from '../../redux/modules/solutionFiles.js';
import { addComment, updateComment, removeComment } from '../../redux/modules/solutionReviews.js';
import { download } from '../../redux/modules/files.js';
import { fetchContentIfNeeded } from '../../redux/modules/filesContent.js';
import { fetchPlagiarismsIfNeeded } from '../../redux/modules/plagiarisms.js';
import { fetchByIds as fetchUsersByIds } from '../../redux/modules/users.js';
import { getSolution } from '../../redux/selectors/solutions.js';
import { getSolutionFiles } from '../../redux/selectors/solutionFiles.js';
import { getSolutionReviewComments } from '../../redux/selectors/solutionReviews.js';
import { getAssignment, getUserSolutionsSortedData } from '../../redux/selectors/assignments.js';
import { getFilesContentSelector } from '../../redux/selectors/files.js';
import { plagiarismsSelector } from '../../redux/selectors/plagiarisms.js';
import { isReady } from '../../redux/helpers/resourceManager/index.js';

import { hasPermissions, unique, avg } from '../../helpers/common.js';
import withLinks from '../../helpers/withLinks.js';
import withRouter from '../../helpers/withRouter.js';

import { preprocessFiles } from '../SolutionSourceCodes/functions.js';

const fileNameAndEntry = file => [file.parentId || file.id, file.entryName || null];
const fileFullId = file => (file.parentId || file.id) + '/' + (file.entryName || '');

const _getPlagiarismAuthors = plagiarisms => unique(plagiarisms.map(({ authorId }) => authorId));
const _getPlagiarismFiles = plagiarisms =>
  unique(
    plagiarisms.reduce(
      (acc, { files }) => [...acc, ...files.map(({ solutionFile }) => [solutionFile.id, solutionFile.fileEntry])],
      []
    )
  );

const indexPlagiarismsBySourceFiles = lruMemoize(plagiarisms => {
  const res = {};
  plagiarisms.forEach(record => {
    if (record && record.files && record.files.length > 0) {
      res[record.solutionFileId + '/' + record.fileEntry] = record;
    }
  });
  return res;
});

class SolutionPlagiarisms extends Component {
  state = {
    selectedPlagiarism: null,
    openSelection: false,
  };

  static loadAsync = ({ solutionId, assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchSolutionIfNeeded(solutionId))
        .then(res => res.value)
        .then(solution =>
          Promise.all([
            dispatch(fetchUsersSolutions(solution.authorId, assignmentId)),
            solution.plagiarism
              ? dispatch(fetchPlagiarismsIfNeeded(solution.plagiarism, solutionId))
                  .then(res => res.value)
                  .then(plagiarisms =>
                    Promise.all([
                      dispatch(fetchUsersByIds(_getPlagiarismAuthors(plagiarisms))),
                      ..._getPlagiarismFiles(plagiarisms).map(
                        ([id, entry]) => dispatch(fetchContentIfNeeded(id, entry, solutionId)) // solutionId is necessary for ACL checks
                      ),
                    ])
                  )
              : Promise.resolve(),
          ])
        ),
      dispatch(fetchAssignmentIfNeeded(assignmentId)),
      dispatch(fetchAssignmentSolutionFilesIfNeeded(solutionId))
        .then(res => preprocessFiles(res.value))
        .then(files => Promise.all(files.map(file => dispatch(fetchContentIfNeeded(...fileNameAndEntry(file)))))),
    ]);

  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.solutionId !== prevProps.params.solutionId) {
      this.props.loadAsync();
      this.setState({ selectedPlagiarism: null });
    }
  }

  openPlagiarismSelection = () => this.setState({ openSelection: true });

  selectPlagiarismSource = selectedPlagiarism => this.setState({ selectedPlagiarism, openSelection: false });

  getSelectedSource = plagiarisms => {
    if (this.state.selectedPlagiarism !== null && plagiarisms[this.state.selectedPlagiarism]) {
      return this.state.selectedPlagiarism;
    }

    const authors = Object.keys(plagiarisms);
    return authors.length === 1 ? authors[0] : null;
  };

  render() {
    const {
      assignment,
      solution,
      files,
      fileContentsSelector,
      download,
      plagiarisms,
      params: { assignmentId },
    } = this.props;

    const canViewPlagiarism =
      solution && isReady(solution) && solution.getIn(['data', 'permissionHints', 'viewDetectedPlagiarisms'], null);

    return canViewPlagiarism ? (
      <Page
        resource={[solution, assignment, plagiarisms]}
        icon={<PlagiarismIcon />}
        title={
          <FormattedMessage
            id="app.solutionPlagiarisms.title"
            defaultMessage="Similarities Detected — Suspected Plagiarism"
          />
        }>
        {(solution, assignment, plagiarisms) => {
          const selectedSource = this.getSelectedSource(plagiarisms);
          const selectedPlagiarism = selectedSource && plagiarisms[selectedSource];
          const indexedPlagiarismFiles = selectedPlagiarism && indexPlagiarismsBySourceFiles(selectedPlagiarism);
          return (
            <div>
              <AssignmentSolutionNavigation
                solutionId={solution.id}
                assignmentId={assignmentId}
                exerciseId={assignment.exerciseId}
                userId={solution.authorId}
                groupId={assignment.groupId}
                attemptIndex={solution.attemptIndex}
                plagiarism={Boolean(solution.plagiarism) && hasPermissions(solution, 'viewDetectedPlagiarisms')}
                canViewSolutions={hasPermissions(assignment, 'viewAssignmentSolutions')}
                canViewExercise={
                  hasPermissions(
                    assignment,
                    'viewAssignmentSolutions'
                  ) /* this is not the actual permission, but close enough */
                }
                canViewUserProfile={hasPermissions(assignment, 'viewAssignmentSolutions')}
              />

              <Card className="elevation-2">
                <Card.Header>
                  <Card.Title>
                    <UserIcon gapRight className="text-muted" />
                    {!selectedSource || this.state.openSelection ? (
                      <FormattedMessage
                        id="app.solutionPlagiarisms.selectSuspectedSource"
                        defaultMessage="Select one of the suspected sources to display"
                      />
                    ) : (
                      <>
                        <FormattedMessage
                          id="app.solutionPlagiarisms.suspectedSource"
                          defaultMessage="Suspected source"
                        />

                        {Object.keys(plagiarisms).length > 1 && (
                          <>
                            <span className="text-muted ml-2">
                              {' '}
                              <FormattedMessage
                                id="app.solutionPlagiarisms.suspectedSourcesAvailable"
                                defaultMessage="of {count} available"
                                values={{ count: Object.keys(plagiarisms).length }}
                              />
                            </span>
                            <span className="text-primary clickable ml-2" onClick={this.openPlagiarismSelection}>
                              {' '}
                              (
                              <FormattedMessage
                                id="app.solutionPlagiarisms.changeSelectedSource"
                                defaultMessage="change selected source"
                              />
                              )
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </Card.Title>
                </Card.Header>

                {!selectedSource || this.state.openSelection ? (
                  <Card.Body className="p-0">
                    <Table hover>
                      <tbody>
                        {Object.keys(plagiarisms).map(plagiarismSource => (
                          <tr
                            key={plagiarismSource}
                            className={'clickable' + (plagiarismSource === selectedSource ? ' table-primary' : '')}
                            onClick={() => this.selectPlagiarismSource(plagiarismSource)}>
                            <td className="text-nowrap">
                              <Icon icon="person-dots-from-line" className="text-muted" />
                            </td>
                            <td className="text-nowrap">
                              <strong>
                                <UsersNameContainer userId={plagiarismSource} noAvatar noAutoload />
                              </strong>
                            </td>
                            <td className="text-nowrap text-muted small">
                              <FormattedMessage
                                id="app.solutionPlagiarisms.selectSourceTable.files"
                                defaultMessage="{count} {count, plural, one {file} other {files}}"
                                values={{ count: plagiarisms[plagiarismSource].length }}
                              />
                            </td>

                            {plagiarisms[plagiarismSource].length === 0 ? (
                              <td colSpan={2} className="text-nowrap text-muted small">
                                {plagiarisms[plagiarismSource][0].similarity * 100} %
                              </td>
                            ) : (
                              <>
                                <td className="text-nowrap text-muted small">
                                  <FormattedMessage
                                    id="app.solutionPlagiarisms.selectSourceTable.max"
                                    defaultMessage="max"
                                  />
                                  : {Math.max(...plagiarisms[plagiarismSource].map(p => p.similarity)) * 100} %
                                </td>
                                <td className="text-nowrap text-muted small">
                                  <FormattedMessage
                                    id="app.solutionPlagiarisms.selectSourceTable.avg"
                                    defaultMessage="average"
                                  />
                                  : {avg(plagiarisms[plagiarismSource], p => p.similarity) * 100} %
                                </td>
                              </>
                            )}

                            <td className="full-width" />
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {}
                  </Card.Body>
                ) : (
                  <Card.Footer>
                    <UsersNameContainer userId={selectedSource} showExternalIdentifiers showEmail="icon" noAutoload />

                    <span className="float-right text-muted">
                      <FormattedMessage
                        id="app.solutionPlagiarisms.displayedOnRight"
                        defaultMessage="displayed on the right"
                      />
                    </span>
                  </Card.Footer>
                )}
              </Card>

              {selectedSource && (
                <ResourceRenderer resource={files} bulkyLoading>
                  {files =>
                    preprocessFiles(files).map(file => (
                      <PlagiarismCodeBoxWithSelector
                        key={file.id}
                        file={file}
                        solutionId={solution.id}
                        download={download}
                        fileContentsSelector={fileContentsSelector}
                        selectedPlagiarismSource={indexedPlagiarismFiles[fileFullId(file)]}
                        authorId={solution.authorId}
                        sourceAuthorId={selectedSource}
                      />
                    ))
                  }
                </ResourceRenderer>
              )}
            </div>
          );
        }}
      </Page>
    ) : (
      <PageContent
        icon={<PlagiarismIcon />}
        title={
          <FormattedMessage
            id="app.solutionPlagiarisms.title"
            defaultMessage="Similarities Detected — Suspected Plagiarism"
          />
        }>
        <Row>
          <Col sm={12}>
            <Callout variant="warning" className="larger" icon={<BanIcon />}>
              <FormattedMessage
                id="generic.accessDenied"
                defaultMessage="You do not have permissions to see this page. If you got to this page via a seemingly legitimate link or button, please report a bug."
              />
            </Callout>
          </Col>
        </Row>
      </PageContent>
    );
  }
}

SolutionPlagiarisms.propTypes = {
  assignment: ImmutablePropTypes.map,
  children: PropTypes.element,
  solution: ImmutablePropTypes.map,
  files: ImmutablePropTypes.map,
  plagiarisms: ImmutablePropTypes.map,
  fileContentsSelector: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
  params: PropTypes.shape({ assignmentId: PropTypes.string, solutionId: PropTypes.string }).isRequired,
};

export default withRouter(
  withLinks(
    connect(
      (state, { params: { solutionId, assignmentId } }) => {
        const solution = getSolution(state, solutionId);
        return {
          solution,
          files: getSolutionFiles(state, solutionId),
          reviewComments: getSolutionReviewComments(state, solutionId),
          fileContentsSelector: getFilesContentSelector(state),
          userSolutionsSelector: getUserSolutionsSortedData(state),
          assignment: getAssignment(state, assignmentId),
          plagiarisms: solution ? plagiarismsSelector(state, solution.getIn(['data', 'plagiarism']), solutionId) : null,
        };
      },
      (dispatch, { params }) => ({
        loadAsync: () => SolutionPlagiarisms.loadAsync(params, dispatch),
        download: (...args) => dispatch(download(...args)),
        addComment: comment => dispatch(addComment(params.solutionId, comment)),
        updateComment: comment => dispatch(updateComment(params.solutionId, comment)),
        removeComment: id => dispatch(removeComment(params.solutionId, id)),
      })
    )(SolutionPlagiarisms)
  )
);
