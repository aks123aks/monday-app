import React from 'react';
import * as d3 from 'd3';
import "./WorkspaceNode.css";
import Shapes from '../assets/Shapes';

class WorkspaceNode extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // add svg to node
    // use attributes to create svg using d3
  }

  render() {
    return (
      <div className="work-node" style={{
        top: this.props.attributes.y,
        left: this.props.attributes.x,
        width: this.props.attributes.width,
        height: this.props.attributes.height
      }}>
        <svg viewBox="0 0 100 100">
          {Shapes.renderShape(this.props.attributes.type, false)}
        </svg>
      </div>
    );
  }
}

export default WorkspaceNode;