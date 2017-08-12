import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isJSON from 'validator/lib/isJSON';

import AddBoxForm from '../BoxForm/AddBoxForm';
import PipelineVisualisation from '../PipelineVisualisation';

class PipelineVisualEditor extends Component {
  state = { source: '[]', graph: { dependencies: [], nodes: [] } };

  componentWillMount = () => {
    const { source } = this.props;
    this.changeSource(source);
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
    let cluster = this.findTopmostCluster(target);

    if (!cluster) {
      return;
    }

    return null;
    // const boxId = cluster.attr;
    // this.editBox(boxId);
  };

  findTopmostCluster = el => {
    console.log(el);
    let cluster = null;
    while (el !== null && el.nodeName !== 'svg') {
      console.log(el);
      if (el === el.closest('.cluster')) {
        cluster = el;
      }
      el = el.parentElement;
    }

    return cluster;
  };

  componentWillReceiveProps = nextProps => {
    const { source } = this.state;
    if (source !== nextProps.source) {
      this.changeSource(nextProps.source);
    }
  };

  changeSource = source => {
    if (isJSON(source)) {
      const graph = this.createGraphFromSource(source);
      this.setState({ source, graph }); // @todo: this might be a problem - the graph strucuture is not 1:1
    }
  };

  createGraphFromSource = source => {
    let graph = { nodes: JSON.parse(source), dependencies: [] };
    for (let node of graph.nodes) {
      graph = this.addDependencies(graph, node);
    }

    return graph;
  };

  addDependencies = (graph, node) => {
    const dependencies = graph.dependencies;
    const candidates = [];

    for (let old of graph.nodes) {
      for (let portInName of Object.keys(old.portsIn)) {
        const portIn = old.portsIn[portInName];
        for (let portOutName of Object.keys(node.portsOut)) {
          const portOut = node.portsOut[portOutName];
          if (portIn.value === portOut.value) {
            candidates.push({
              from: node.name,
              to: old.name,
              name: portIn.value
            });
          }
        }
      }

      for (let portInName of Object.keys(node.portsIn)) {
        const portIn = node.portsIn[portInName];
        for (let portOutName of Object.keys(old.portsOut)) {
          const portOut = old.portsOut[portOutName];
          if (portIn.value === portOut.value) {
            candidates.push({
              from: old.name,
              to: node.name,
              name: portIn.value
            });
          }
        }
      }
    }

    for (let candidate of candidates) {
      let unique = true;
      for (let dependency of dependencies) {
        if (
          candidate.name === dependency.name &&
          candidate.from === dependency.from &&
          candidate.to === dependency.to
        ) {
          unique = false;
          break;
        }
      }

      if (unique === true) {
        dependencies.push(candidate);
      }
    }

    return {
      nodes: graph.nodes,
      dependencies
    };
  };

  addNode = (name, portsIn, portsOut, type) => {
    const { source, graph } = this.state;
    const node = { name, portsIn, portsOut, type };

    const obj = JSON.parse(source);
    obj.push(node);
    const updatedSource = JSON.stringify(obj);

    graph.nodes.push(node);

    this.setState({
      source: updatedSource,
      graph: this.addDependencies(graph, node)
    });

    const { onChange } = this.props;
    onChange(updatedSource);
  };

  render() {
    const { graph } = this.state;
    return (
      <div
        ref={el => {
          this.editorWrapper = el;
        }}
      >
        <PipelineVisualisation graph={graph} />
        <AddBoxForm add={this.addNode} />
      </div>
    );
  }
}

PipelineVisualEditor.propTypes = {
  source: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default PipelineVisualEditor;
