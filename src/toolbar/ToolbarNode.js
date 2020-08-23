import React from 'react';

import Shapes from '../assets/Shapes';
import "./ToolbarNode.css";

class ToolbarNode extends React.Component {
  static onMouseDown;

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div data-type={this.props.type} className="toolbar-node" onMouseDown={ToolbarNode.onMouseDown}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {Shapes.renderShape(this.props.type)}
        </svg>
      </div>
    );
  }
}

export default ToolbarNode;