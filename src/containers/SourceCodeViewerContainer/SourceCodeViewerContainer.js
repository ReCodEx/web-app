import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { FormGroup, Checkbox } from 'react-bootstrap';

import { fetchFileIfNeeded, fetchContentIfNeeded } from '../../redux/modules/files';
import { getSourceCode } from '../../redux/selectors/files';
import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';
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

  render() {
    const { file } = this.props;
    const { showLineNumbers } = this.state;

    if (isLoading(file)) {
      return <p><FormattedMessage id='app.sourceCode.loading' defaultMessage='Loading source code ...' /></p>;
    } else if (hasFailed(file)) {
      return <p><FormattedMessage id='app.sourceCode.loadingFailed' defaultMessage='Cannot load the source code.' /></p>;
    } else {
      return (
        <div>
          <FormGroup>
            <Checkbox onChange={this.toggleLineNumbers} checked={showLineNumbers}>
              <FormattedMessage id='app.sourceCode.showLineNumbers' defaultMessage='Show line numbers' />
            </Checkbox>
          </FormGroup>
          <SourceCodeViewer {...file.data} onCloseSourceViewer={this.close} lineNumbers={showLineNumbers} />
        </div>
      );
    }
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
