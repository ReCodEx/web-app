import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Well } from 'react-bootstrap';

import Button from '../../widgets/FlatButton';
import { AddIcon } from '../../icons';

import AddBoxForm from '../BoxForm/AddBoxForm';
import EditBoxForm from '../BoxForm/EditBoxForm';
import PipelineVisualisation from '../PipelineVisualisation';

import {
  addNode,
  replaceNode,
  removeNode,
  createGraphFromNodes,
} from '../../../helpers/pipelineGraph';

import './pipeline.css';

class PipelineVisualEditor extends Component {
  state = {
    graph: { dependencies: [], nodes: [] },
    addItem: false,
    nodeToEdit: null,
  };

  componentWillMount = () => {
    // initialize the graph, if the source is valid
    const { source } = this.props;
    const graph = createGraphFromNodes(source);

    this.setState({ graph });
  };

  componentDidMount = () => {
    const { editorWrapper } = this;
    editorWrapper.addEventListener('click', e => this.onClick(e.target));
  };

  componentWillUnmount = () => {
    const { editorWrapper } = this;
    editorWrapper.removeEventListener('click', this.onClick);
  };

  onClick = target => {
    let boxId = this.findTopmostCluster(target);
    const nodeToEdit = boxId
      ? this.state.graph.nodes.find(node => node.name === boxId)
      : null;

    this.setState({ nodeToEdit });
  };

  findTopmostCluster = el => {
    let cluster = null;
    while (el !== null && el.nodeName !== 'svg') {
      if (el.classList.contains('cluster')) {
        cluster = el.id.substr(2); // remove prefix ("B-", "I-", "O-")
        break;
      }
      el = el.parentElement;
    }

    return cluster;
  };

  addNode = (name, portsIn, portsOut, type) => {
    const node = { name, portsIn, portsOut, type };
    const graph = addNode(this.state.graph, node);

    this.save(graph);
  };

  editNode = (oldNode, newNode) => {
    const graph = replaceNode(this.state.graph, oldNode, newNode);
    this.save(graph);
  };

  deleteNode = node => {
    const graph = removeNode(this.state.graph, node);
    this.save(graph);
  };

  showAddNodeForm = () => {
    this.setState({ addItem: true });
  };

  save = graph => {
    const { onChange } = this.props;
    onChange(graph.nodes);
    this.setState({ graph });
  };

  onHideModal = () => {
    this.setState({ addItem: false, nodeToEdit: null });
  };

  render() {
    const { graph, nodeToEdit, addItem } = this.state;
    return (
      <div
        ref={el => {
          this.editorWrapper = el;
        }}>
        <Well className="pipeline">
          {graph.nodes.length > 0 && <PipelineVisualisation graph={graph} />}
          <p className="text-center">
            <Button onClick={this.showAddNodeForm}>
              <AddIcon />
              <FormattedMessage
                id="app.pipelineVisualEditor.addBoxButton"
                defaultMessage="Add box"
              />
            </Button>
          </p>
        </Well>
        <AddBoxForm
          add={this.addNode}
          show={addItem}
          onHide={this.onHideModal}
        />
        <EditBoxForm
          item={nodeToEdit}
          edit={data => this.editNode(nodeToEdit, data)}
          show={Boolean(nodeToEdit)}
          onHide={this.onHideModal}
          onDelete={() => this.deleteNode(nodeToEdit)}
        />
      </div>
    );
  }
}

PipelineVisualEditor.propTypes = {
  source: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PipelineVisualEditor;
