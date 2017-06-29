import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isJSON from 'validator/lib/isJSON';
import Viz from 'viz.js/viz-lite';

import AddBoxForm from './AddBoxForm';
class PipelineVisualEditor extends Component {
  state = { source: null, graph: null };

  componentWillMount = () => {
    const { source } = this.props;
    this.changeSource(source);
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
    const graph = { nodes: [], dependencies: [] };
    // @todo
    return graph;
  };

  addDependencies = (graph, node) => {
    const newDependencies = [];
    for (let old of graph.nodes) {
      for (let portIn of old.portsIn) {
        for (let portOut of node.portsOut) {
          if (portIn === portOut) {
            newDependencies.push({
              from: node.name,
              to: old.name,
              name: portIn
            });
          }
        }
      }
      for (let portIn of node.portsIn) {
        for (let portOut of old.portsOut) {
          if (portIn === portOut) {
            newDependencies.push({
              from: old.name,
              to: node.name,
              name: portIn
            });
          }
        }
      }
    }

    return {
      ...graph,
      dependencies: [...graph.dependencies, ...newDependencies]
    };
  };

  addNode = (name, portsIn, portsOut, type) => {
    const { source, graph } = this.state;
    const color = this.getColorByType(type);
    const node = { name, portsIn, portsOut, type, color };

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

  getColorByType = type => 'blue';

  convertToDot = graph => {
    const dependencies = graph.dependencies;
    const commands = dependencies.map(
      ({ from, to, name }) => `${from} -> ${to} [label="${name}"]`
    );
    const nodes = graph.nodes.map(({ name, color }) => `${name} [shape=rect]`);
    return `digraph { rankdir=LR; ${nodes.join(';')} ${commands.join(';')} }`;
  };

  render() {
    const { graph } = this.state;
    const dot = this.convertToDot(graph);
    const svg = Viz(dot);
    // const svg = '';
    return (
      <div>
        <div
          style={{
            width: '100%',
            margin: '20px 0'
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
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
