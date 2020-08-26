import React from 'react';
import * as d3 from 'd3';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard, faEdit } from '@fortawesome/free-solid-svg-icons';

import WorkspaceNode from './WorkspaceNode';
import WorkspaceTools from './WorkspaceTools';
import Constants from '../constants/constants';
import './Workspace.css';
import './react-contextmenu.css';

import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import SketchPicker from 'react-color';
import './node-modals/NodeColorModal.css';

class Workspace extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        nodes: [],
        scrolling: {
          enabled: false,
          xDis: 0,
          yDis: 0
        },
        horizontalBoxCount: Constants.WORKSPACE_SETTINGS.horizontalBoxes,
        verticalBoxCount: Constants.WORKSPACE_SETTINGS.verticalBoxes,
        colorModalShow: false,
        color: '#ffffff',
        newColor: '#ffffff',
        contextIndex: -1
    };

    let bindFunctions = [
      this.addNode,
      this.drawGrid,
      this.deleteNode,
      this.duplicateNode,
      this.shiftNode,
      this.startScroll,
      this.endScroll,
      this.updateNode,
      this.incZoom,
      this.decZoom,
      this.removeGrid,
      this.toggleGrid,
      this.storeCopiedNode,
      this.contextChange,
      this.changeColor,
      this.dummyMethod,
      this.pasteNode,
      this.resizeNode,
    ];
    
    for (let func of bindFunctions) {
      this[func.name] = this[func.name].bind(this);
    }
  }

  componentDidMount() {
    this.drawGrid();
    window.addEventListener('resize', this.drawGrid, false);
    window.addEventListener('resize', this.forceUpdate, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.drawGrid, false);
    window.removeEventListener('resize', this.forceUpdate, false);
  }

  startScroll(xDis, yDis) {
    this.setState({
      scrolling: {
        ...this.state.scrolling,
        enabled: true,
        xDis: xDis,
        yDis: yDis
      }
    });
  }

  endScroll() {
    this.setState({
      scrolling: {
        ...this.state.scrolling,
        enabled: false,
        xDis: 0,
        yDis: 0
      }
    });
  }

  incZoom() {
    if (Constants.WORKSPACE_SETTINGS.canInc()) {
      Constants.WORKSPACE_SETTINGS.incZoom();
      this.drawGrid();
      this.forceUpdate();
    }
  }

  decZoom() {
    if (Constants.WORKSPACE_SETTINGS.canDec()) {
      Constants.WORKSPACE_SETTINGS.decZoom()
      this.drawGrid();
      this.forceUpdate();
    }
  }

  drawGrid() {
    let gridDimension = Constants.ZOOM_SETTINGS;
    let gridWidth = this.state.horizontalBoxCount * gridDimension;
    let gridHeight = this.state.verticalBoxCount * gridDimension;
  
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    this.removeGrid();

    let gridSvg = d3.select('.grid')
      .style('width', gridWidth)
      .style('height', gridHeight);

    let widthTooSmall = windowWidth <= gridWidth;
    let heightTooSmall = windowHeight <= gridHeight;

    let translateX = widthTooSmall ? '0%' : '50%';
    d3.select('.workspace').style('width', `${widthTooSmall ? gridWidth : windowWidth}px`);
    gridSvg.style('left', translateX);

    let translateY = heightTooSmall ? '0%' : '50%';
    d3.select('.workspace').style('height', `${heightTooSmall ? gridHeight : windowHeight}px`);
    gridSvg.style('top', translateY);

    gridSvg.style('transform', `translate(-${translateX}, -${translateY})`)

    let offsetX = widthTooSmall ? 0 : parseFloat(windowWidth-gridWidth)/2;
    let offsetY = heightTooSmall ? 0 : parseFloat(windowHeight-gridHeight)/2;
    Constants.setGridOffset(offsetX, offsetY);

    if (Constants.gridEnabled) {
      gridSvg.selectAll('line')
      .data(d3.range(this.state.horizontalBoxCount+1))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', (d, i) => gridDimension * i)
      .attr('y1', 0)
      .attr('x2', (d, i) => gridDimension * i)
      .attr('y2', gridHeight)
      .attr('stroke', '#000000')
      .attr('stroke-width', '0.5')
      .exit()
      .data(d3.range(this.state.verticalBoxCount+1))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('y1', (d, i) => gridDimension * i)
      .attr('x2', gridWidth)
      .attr('y2', (d, i) => gridDimension * i)
      .attr('stroke', '#000000')
      .attr('stroke-width', '0.5');
    }

    this.forceUpdate();
  }

  removeGrid() {
    d3.select('.grid').selectAll('.grid-line').remove();
  }

  addNode(attributes) {
    attributes.key = Constants.getUniqueReactKey();
    console.log(attributes);
    let newNodes = this.state.nodes.concat(attributes);
    this.setState({
        nodes: newNodes
    });
  }

  duplicateNode(index) {
    let attributes = Object.assign({}, this.state.nodes[index]);
    let newX = attributes.x + 1;
    let newY = attributes.y + 1;
    let adjustedCoord = Constants.getAdjustedCoord(newX, newY, attributes.width, attributes.height);
    attributes.x = adjustedCoord.x;
    attributes.y = adjustedCoord.y;
    this.addNode(attributes);
  }

  shiftNode(index, moveToFront=true) {
    let newNodes = this.state.nodes.slice();
    if (moveToFront) {
      newNodes.push(newNodes.splice(index, 1)[0]);
    }
    else {
      newNodes.unshift(newNodes.splice(index, 1)[0]);
    }
    this.setState({
        nodes: newNodes
    });
  }

  deleteNode(index) {
    this.setState({nodes: this.state.nodes.filter((v, i) => {
      return i !== index;
    })});
  }

  updateNode(index, x, y) {
    let newNodes = this.state.nodes.slice();
    newNodes[index].x = x;
    newNodes[index].y = y;
    this.setState({nodes: newNodes});
  }

  getGraphJson() {
    return {
      nodes: this.state.nodes.slice(),
      settings: {
        zoom: Constants.ZOOM_SETTINGS,
        verticalBoxCount: this.state.verticalBoxCount,
        horizontalBoxCount: this.state.horizontalBoxCount
      }
    };
  }

  toggleGrid() {
    if (Constants.gridToggle()) {
      this.drawGrid();
      window.addEventListener('resize', this.drawGrid);
    } else {
      this.removeGrid();
      window.removeEventListener('resize', this.drawGrid);
    }
  }

  storeCopiedNode(index) {
    window.copiedNode = Object.assign({}, this.state.nodes[index]);
  }

  dummyMethod() {
    console.log('Dummy method');
  }

  pasteNode(e) {
    let copiedNode = Object.assign({}, window.copiedNode);
    if (copiedNode !== undefined) {
      let width = copiedNode.width * Constants.ZOOM_SETTINGS;
      let height = copiedNode.height * Constants.ZOOM_SETTINGS;
      let offset = Constants.getGridOffset();
      let xCoord, yCoord;

      if (Constants.gridEnabled) {
        let closestCoord = Constants.getClosestPosition(e.pageX, e.pageY);
        xCoord = Constants.getGridCoord(closestCoord.x, width, offset.x);
        yCoord = Constants.getGridCoord(closestCoord.y, height, offset.y);
      }
      else {
        xCoord = Constants.getGridCoord(e.pageX, width, offset.x)
        yCoord = Constants.getGridCoord(e.pageY, height, offset.y);
      }

      let adjustedCord = Constants.getAdjustedCoord(
        xCoord,
        yCoord,
        copiedNode.width,
        copiedNode.height
      );
      copiedNode.x = adjustedCord.x;
      copiedNode.y = adjustedCord.y;
      this.addNode(copiedNode);
    }
  }

  contextChange(index, action) {
    switch(action) {
      case "color":
        this.setState({ colorModalShow: true, contextIndex: index })
      break;
    }
  }

  changeColor() {
    this.setState({ colorModalShow: false, color: this.state.newColor, newColor: "#FFFFFF" }, () => {
      console.log(this.state.color);
      let newNodes = this.state.nodes.slice();
      newNodes[this.state.contextIndex].fillColor = this.state.color;
      this.setState({ nodes: newNodes });  
    }); 
  }

  resizeNode(index, multiplier) {
    let newNodes = this.state.nodes.slice();
    newNodes[index].multiplier = multiplier;
    this.setState({ nodes: newNodes });
  }

  render() {
    return (
      <div className="workspace">
          <WorkspaceTools
            incZoom={this.incZoom}
            decZoom={this.decZoom}
            toggleGrid={this.toggleGrid}/>
          <ContextMenuTrigger id="gridContextMenu" holdToDisplay={-1}>
          <svg className="grid"></svg>
        </ContextMenuTrigger>
        <ContextMenu id="gridContextMenu" className="react-contextmenu">
          <MenuItem disabled={window.copiedNode === undefined} className="react-contextmenu-item" onClick={this.pasteNode}>
              <FontAwesomeIcon icon={faClipboard} style={{paddingRight: 10}}/>
              Paste
          </MenuItem>
          <MenuItem className="react-contextmenu-item" onClick={this.dummyMethod}>
              <FontAwesomeIcon icon={faEdit} style={{paddingRight: 10}}/>
              Edit Grid
          </MenuItem>
        </ContextMenu>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className="modal"
          open={this.state.colorModalShow}
          onClose={() => this.setState({ colorModalShow: false })}
          closeAfterTransition
          disableEnforceFocus={true}
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={this.state.colorModalShow}>
            <div className="paper">
              <p id="transition-modal-title">Select Color</p>
              <SketchPicker color={this.state.newColor} onChange={(color) => this.setState({ newColor: color.hex })} disableAlpha={true} className="sketch"/>
              <span className="buttons">
                <Button variant="outlined" size="medium" color="primary" onClick={() => this.setState({ colorModalShow: false })} className="done">
                  CANCEL
                </Button>
                <Button variant="outlined" size="medium" color="primary" onClick={this.changeColor} className="done">
                  SUBMIT
                </Button>
              </span>
            </div>
          </Fade>
        </Modal>
          {this.state.nodes.map((item, i) =>
            <WorkspaceNode
              startScroll={this.startScroll}
              endScroll={this.endScroll}
              updateSelf={this.updateNode}
              onDelete={this.deleteNode}
              onDuplicate={this.duplicateNode}
              onShift={this.shiftNode}
              onContextChange={this.contextChange}
              onResize={this.resizeNode}
              copySelf={this.storeCopiedNode}
              index={i}
              menuId={item.key}
              key={item.key}
              attributes={item}
            />
          )}
      </div>
    );
  }
}

export default Workspace;