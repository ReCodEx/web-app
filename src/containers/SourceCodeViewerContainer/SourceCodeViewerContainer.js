import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { fetchFileIfNeeded, fetchContentIfNeeded } from '../../redux/modules/files';
import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';
import SourceCodeViewer from '../../components/SourceCodeViewer';

class SourceCodeViewerContainer extends Component {

  state = { showLineNumbers: false };

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
      return <p>Načítám zdrojový kód ...</p>;
    } else if (hasFailed(file)) {
      return <p>Chyba stahování zdrojového kódu.</p>;
    } else {
      return (
        <div>
          <div className='form-group'>
            <label>
              <input type='checkbox' onChange={this.toggleLineNumbers} checked={showLineNumbers} /> Číslování řádků
            </label>
          </div>
          <SourceCodeViewer {...file.data} onCloseSourceViewer={this.close} lineNumbers={showLineNumbers} />
        </div>
      );
    }
  }

}

SourceCodeViewerContainer.contextTypes = {
  router: PropTypes.object.isRequired
};

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
    file: state.files.getIn(['resources', props.params.fileId])
  }),
  dispatch => ({
    loadFile: (fileId) => {
      dispatch(fetchFileIfNeeded(fileId));
      dispatch(fetchContentIfNeeded(fileId));
    }
  })
)(SourceCodeViewerContainer);
