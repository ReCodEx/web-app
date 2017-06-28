import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isJSON from 'validator/lib/isJSON';

import {
  DiagramEngine,
  DiagramModel,
  DiagramWidget,
  DefaultLinkFactory,
  DefaultNodeFactory,
  DefaultNodeInstanceFactory,
  DefaultPortInstanceFactory,
  LinkInstanceFactory,
  DefaultNodeModel,
  DefaultPortModel
} from 'storm-react-diagrams';

import 'storm-react-diagrams/dist/style.css';

class PipelineVisualEditor extends Component {
  state = { source: null, engine: null };

  componentWillMount = () => {
    const engine = new DiagramEngine();
    engine.registerNodeFactory(new DefaultNodeFactory());
    engine.registerLinkFactory(new DefaultLinkFactory());
    engine.registerInstanceFactory(new DefaultNodeInstanceFactory());
    engine.registerInstanceFactory(new DefaultPortInstanceFactory());
    engine.registerInstanceFactory(new LinkInstanceFactory());

    const { source } = this.props;
    this.changeSource(engine, source);
  };

  // componentWillReceiveProps = nextProps => {
  //   const { source, engine } = this.state;
  //   if (source !== nextProps.source) {
  //     this.changeSource(engine, nextProps.source);
  //   }
  // };

  changeSource = (engine, source) => {
    if (isJSON(source)) {
      const model = new DiagramModel();
      model.deSerializeDiagram(JSON.parse(source), engine);
      model.addListener({
        nodesUpdated: this.onChange,
        linksUpdated: this.onChange
      });
      engine.setDiagramModel(model);
      this.setState({ source, engine });
    }
  };

  addNode = (name, portsIn, portsOut, color = 'rgb(0,192,255)') => {
    const node = new DefaultNodeModel(name, color);
    for (let port of portsIn) {
      node.addPort(new DefaultPortModel(true, port));
    }

    for (let port of portsOut) {
      node.addPort(new DefaultPortModel(false, port));
    }

    const { engine } = this.state;
    const model = engine.getDiagramModel();
    model.addNode(node);
  };

  onChange = () => {
    const { engine } = this.state;
    const { onChange } = this.props;
    const model = engine.getDiagramModel();
    const source = JSON.stringify(model.serializeDiagram());
    onChange(source);
  };

  render() {
    const { engine } = this.state;
    return (
      <div>
        <div
          style={{
            height: 400,
            width: '100%',
            display: 'flex',
            background: 'rgb(60,60,60)'
          }}
        >
          <DiagramWidget diagramEngine={engine} allowLooseLinks={false} />
        </div>
        <p>
          <button
            onClick={e => {
              this.addNode(
                'Compile',
                ['source_file', 'header_file'],
                ['binary_file']
              );
              e.preventDefault();
            }}
          >
            Add compile box
          </button>
        </p>
      </div>
    );
  }
}

PipelineVisualEditor.propTypes = {
  source: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default PipelineVisualEditor;
