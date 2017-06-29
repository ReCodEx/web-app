import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isJSON from 'validator/lib/isJSON';

import { convertGraphToSvg } from '../../../helpers/dot';
import AddBoxForm from './AddBoxForm';

import style from './pipeline.less';

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
      for (let portIn of old.portsIn) {
        for (let portOut of node.portsOut) {
          if (portIn === portOut) {
            candidates.push({
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
            candidates.push({
              from: old.name,
              to: node.name,
              name: portIn
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
          candidate.to === candidate.to
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
    const svg = convertGraphToSvg(graph);

    return (
      <div>
        <div
          className={style.pipeline}
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
