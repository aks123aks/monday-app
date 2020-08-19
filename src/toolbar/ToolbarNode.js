import React from 'react';
import "./ToolbarNode.css";
import Shapes from '../assets/Shapes';

// TODO: Top row bleeds into bottom left spot
// possibly an attribute of column-count

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