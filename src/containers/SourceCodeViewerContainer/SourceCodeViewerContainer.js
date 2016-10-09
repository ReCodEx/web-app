import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Modal, FormGroup, Checkbox } from 'react-bootstrap';

import { fetchFileIfNeeded, fetchContentIfNeeded } from '../../redux/modules/files';
import { getSourceCode } from '../../redux/selectors/files';
import { isReady, isLoading, hasFailed, getJsData } from '../../redux/helpers/resourceManager';
import ResourceRenderer from '../../components/ResourceRenderer';
import SourceCodeViewer from '../../components/SourceCodeViewer';

class SourceCodeViewerContainer extends Component {

  state = { showLineNumbers: true };

  toggleLineNumbers = () => this.setState({ showLineNumbers: !this.state.showLineNumbers });

  componentWillMount() {
    SourceCodeViewerContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.fileId === newProps.params.fileId) {
      SourceCodeViewerContainer.loadData(newProps);
    }
  }

  static loadData = ({
    params: { fileId },
    loadFile
  }) => {
    loadFile(fileId);
  };

  renderBody() {
    const { file } = this.props;
    const { showLineNumbers } = this.state;

    return (
      <ResourceRenderer
        resource={file}
        loading={<p><FormattedMessage id='app.sourceCode.loading' defaultMessage='Loading source code ...' /></p>}
        failed={<p><FormattedMessage id='app.sourceCode.loadingFailed' defaultMessage='Cannot load the source code.' /></p>}>
        {file => (
          <div>
            <FormGroup>
              <Checkbox onChange={this.toggleLineNumbers} checked={showLineNumbers}>
                <FormattedMessage id='app.sourceCode.showLineNumbers' defaultMessage='Show line numbers' />
              </Checkbox>
            </FormGroup>
            <SourceCodeViewer {...file} onCloseSourceViewer={this.close} lineNumbers={showLineNumbers} />
          </div>
        )}
      </ResourceRenderer>
    );
  }

  render() {
    const { show, onCloseSourceViewer, file } = this.props;
    return (
      <Modal
        show={show}
        onHide={onCloseSourceViewer}
        bsSize='large'>
        <Modal.Header closeButton>
          <Modal.Title>
            {isReady(file) ? file.getIn(['data', 'name']) : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderBody()}
        </Modal.Body>
      </Modal>
    );
  }

}

SourceCodeViewerContainer.propTypes = {
  file: PropTypes.object,
  loadFile: PropTypes.func.isRequired,
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired,
    submissionId: PropTypes.string.isRequired,
    fileId: PropTypes.string.isRequired
  })
};

export default connect(
  (state, props) => ({
    file: getSourceCode(props.params.fileId)(state)
  }),
  dispatch => ({
    loadFile: (fileId) => {
      dispatch(fetchFileIfNeeded(fileId));
      dispatch(fetchContentIfNeeded(fileId));
    }
  })
)(SourceCodeViewerContainer);
