import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  FormattedMessage,
  defineMessages,
  intlShape,
  injectIntl
} from 'react-intl';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Row, Col, Button } from 'react-bootstrap';

import withLinks from '../../helpers/withLinks';
import Page from '../../components/layout/Page';

import {
  fetchReferenceSolutionsIfNeeded,
  fetchReferenceSolutions,
  evaluateReferenceSolution
} from '../../redux/modules/referenceSolutions';
import { referenceSolutionsSelector } from '../../redux/selectors/referenceSolutions';
import ReferenceSolutionDetail from '../../components/ReferenceSolutions/ReferenceSolutionDetail';
import SourceCodeInfoBox from '../../components/widgets/SourceCodeInfoBox';
import SourceCodeViewerContainer from '../../containers/SourceCodeViewerContainer';
import { RefreshIcon, SendIcon } from '../../components/icons';
import ReferenceSolutionEvaluationsContainer from '../../containers/ReferenceSolutionEvaluationsContainer';
import SolutionArchiveInfoBox from '../../components/Submissions/SolutionArchiveInfoBox';
import { downloadSolutionArchive } from '../../redux/modules/referenceSolutionEvaluations';

const messages = defineMessages({
  title: {
    id: 'app.exercise.referenceSolutionTitle',
    defaultMessage: 'Reference solution overview'
  }
});

class ReferenceSolution extends Component {
  state = { openFileId: null };
  openFile = id => this.setState({ openFileId: id });
  hideFile = () => this.setState({ openFileId: null });

  static loadAsync = ({ exerciseId, referenceSolutionId }, dispatch) =>
    Promise.all([dispatch(fetchReferenceSolutionsIfNeeded(exerciseId))]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (
      this.props.params.referenceSolutionId !==
      newProps.params.referenceSolutionId
    ) {
      newProps.loadAsync();
    }
  }

  render() {
    const {
      referenceSolutions,
      params: { exerciseId, referenceSolutionId },
      refreshSolutionEvaluations,
      evaluateReferenceSolution,
      evaluateReferenceSolutionInDebugMode,
      downloadSolutionArchive,
      intl: { formatMessage },
      links: { EXERCISES_URI, EXERCISE_URI_FACTORY }
    } = this.props;
    const { openFileId } = this.state;

    return (
      <Page
        title={formatMessage(messages.title)}
        resource={referenceSolutions}
        description={
          <FormattedMessage
            id="app.exercise.description"
            defaultMessage="Exercise overview"
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.exercises.title"
                defaultMessage="Exercises"
              />
            ),
            iconName: 'puzzle-piece',
            link: EXERCISES_URI
          },
          {
            text: (
              <FormattedMessage
                id="app.exercise.description"
                defaultMessage="Exercise overview"
              />
            ),
            iconName: 'lightbulb-o',
            link: EXERCISE_URI_FACTORY(exerciseId)
          },
          {
            text: (
              <FormattedMessage
                id="app.exercise.referenceSolutionDetail"
                defaultMessage="Reference solution detail"
              />
            ),
            iconName: 'diamond'
          }
        ]}
      >
        {referenceSolutions => {
          const referenceSolution = referenceSolutions.find(
            solution => solution.id === referenceSolutionId
          );
          const permissionHints = referenceSolution.permissionHints;
          return (
            <div>
              <Row>
                <Col lg={6}>
                  <ReferenceSolutionDetail
                    {...referenceSolution}
                    exerciseId={exerciseId}
                  />
                  <Row>
                    {referenceSolution.solution.files.map(file =>
                      <Col lg={6} md={12} key={file.id}>
                        <a
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            this.openFile(file.id);
                          }}
                        >
                          <SourceCodeInfoBox {...file} />
                        </a>
                      </Col>
                    )}
                  </Row>
                  <Row>
                    <Col lg={6} md={12}>
                      <a href="#" onClick={downloadSolutionArchive}>
                        <SolutionArchiveInfoBox id={referenceSolution.id} />
                      </a>
                    </Col>
                  </Row>
                </Col>
                <Col lg={6}>
                  <Row>
                    <Col xs={12}>
                      <p>
                        <Button
                          bsStyle="default"
                          className="btn-flat"
                          onClick={refreshSolutionEvaluations}
                        >
                          <RefreshIcon />{' '}
                          <FormattedMessage
                            id="app.referenceSolutionDetail.refreshEvaluations"
                            defaultMessage="Refresh"
                          />
                        </Button>
                        {permissionHints &&
                          permissionHints.evaluate !== false &&
                          <Button
                            bsStyle="success"
                            className="btn-flat"
                            onClick={() =>
                              evaluateReferenceSolution().then(
                                refreshSolutionEvaluations
                              )}
                          >
                            <SendIcon />{' '}
                            <FormattedMessage
                              id="app.referenceSolutionDetail.resubmit"
                              defaultMessage="Resubmit"
                            />
                          </Button>}
                        {permissionHints &&
                          permissionHints.evaluate !== false &&
                          <Button
                            bsStyle="danger"
                            className="btn-flat"
                            onClick={() =>
                              evaluateReferenceSolutionInDebugMode().then(
                                refreshSolutionEvaluations
                              )}
                          >
                            <SendIcon />{' '}
                            <FormattedMessage
                              id="app.referenceSolutionDetail.resubmitDebug"
                              defaultMessage="Resubmit in Debug Mode"
                            />
                          </Button>}
                      </p>
                    </Col>
                  </Row>
                  <ReferenceSolutionEvaluationsContainer
                    referenceSolution={referenceSolution}
                    referenceSolutionId={referenceSolutionId}
                    exerciseId={exerciseId}
                  />
                </Col>
              </Row>

              <SourceCodeViewerContainer
                show={openFileId !== null}
                fileId={openFileId}
                onHide={() => this.hideFile()}
              />
            </div>
          );
        }}
      </Page>
    );
  }
}

ReferenceSolution.contextTypes = {
  router: PropTypes.object
};

ReferenceSolution.propTypes = {
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired,
    referenceSolutionId: PropTypes.string.isRequired
  }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  refreshSolutionEvaluations: PropTypes.func.isRequired,
  evaluateReferenceSolution: PropTypes.func.isRequired,
  evaluateReferenceSolutionInDebugMode: PropTypes.func.isRequired,
  referenceSolutions: ImmutablePropTypes.map,
  downloadSolutionArchive: PropTypes.func,
  intl: intlShape.isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(
  injectIntl(
    connect(
      (state, { params: { exerciseId, referenceSolutionId } }) => ({
        referenceSolutions: referenceSolutionsSelector(exerciseId)(state)
      }),
      (dispatch, { params }) => ({
        loadAsync: () => ReferenceSolution.loadAsync(params, dispatch),
        refreshSolutionEvaluations: () => {
          dispatch(fetchReferenceSolutions(params.exerciseId));
        },
        evaluateReferenceSolution: () =>
          dispatch(evaluateReferenceSolution(params.referenceSolutionId)),
        evaluateReferenceSolutionInDebugMode: () =>
          dispatch(evaluateReferenceSolution(params.referenceSolutionId, true)),
        downloadSolutionArchive: e => {
          e.preventDefault();
          dispatch(downloadSolutionArchive(params.referenceSolutionId));
        }
      })
    )(ReferenceSolution)
  )
);
