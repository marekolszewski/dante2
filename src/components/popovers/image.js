
import React from 'react'
import ReactDOM from 'react-dom'

import { Entity, RichUtils, AtomicBlockUtils, EditorState, getVisibleSelectionRect } from 'draft-js'

import { getSelectionRect, getSelection } from "../../utils/selection.js"

import { getCurrentBlock, getNode } from '../../model/index.js'

class DanteImagePopover extends React.Component {

  constructor(props) {
    super(props)

    this.display = this.display.bind(this)
    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this._toggleScaled = this._toggleScaled.bind(this)
    this.scale = this.scale.bind(this)
    this.collapse = this.collapse.bind(this)
    this.relocate = this.relocate.bind(this)
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.state = {
      position: {
        top: 0,
        left: 0
      },
      show: true,
      scaled: false,
      buttons: [{ type: "left" }, 
                { type: "center"}, 
                { type: "fill" }, 
                { type: "wide" }]
    }
  }

  display(b) {
    if (b) {
      return this.show()
    } else {
      return this.hide()
    }
  }

  show() {
    return this.setState({
      show: true })
  }

  hide() {
//   return this.setState({
//     show: false })
  }

  setPosition(coords) {
    return this.setState({
      position: coords })
  }

  _toggleScaled(ev) {
    if (this.state.scaled) {
      return this.collapse()
    } else {
      return this.scale()
    }
  }

  scale() {
    return this.setState({
      scaled: true })
  }

  collapse() {
    return this.setState({
      scaled: false })
  }

  relocate() {
    let { editorState } = this.props

    if (editorState.getSelection().isCollapsed()) {
    /*
      const selection = editorState.getSelection()
      const contentState = editorState.getCurrentContent()
      const currentBlock = contentState.getBlockForKey(selection.getStartKey())
      //const currentBlock = getCurrentBlock(editorState)
      console.log('type', currentBlock.getType())

      if (currentBlock.getType() === 'image') {
        const node = getNode()
        const image = ReactDOM.findDOMNode(node)
        const imageBoundary = image.getBoundingClientRect()

        const selectionRect = getVisibleSelectionRect(window)
        const parent = ReactDOM.findDOMNode(this.props.editor)
        const parentBoundary = parent.getBoundingClientRect()
        const el = this.refs.image_popover
        const padd = el.offsetWidth / 2
        return this.setPosition({
          top: imageBoundary.top - parentBoundary.top,
          left: imageBoundary.left - parentBoundary.left + imageBoundary.width / 2 - padd
        })
      } 
      */

      let currentBlock = getCurrentBlock(editorState)
      let blockType = currentBlock.getType()

      let contentState = editorState.getCurrentContent()
      let selectionState = editorState.getSelection()

      let block = contentState.getBlockForKey(selectionState.anchorKey)

      let nativeSelection = getSelection(window)
      if (!nativeSelection.rangeCount) {
        return
      }

      let node = getNode()

      let selectionBoundary = getSelectionRect(nativeSelection)
      let coords = selectionBoundary

      let parent = ReactDOM.findDOMNode(this.props.editor)
      let parentBoundary = parent.getBoundingClientRect()

      this.display(blockType === "image")

      if (blockType === "image") {
        selectionBoundary = node.anchorNode.parentNode.parentNode
                                           .parentNode.getBoundingClientRect()
        let el = this.refs.image_popover
        let padd = el.offsetWidth / 2
        return this.setPosition({
          top: selectionBoundary.top - parentBoundary.top + 60,
          left: selectionBoundary.left + selectionBoundary.width / 2 - padd
        })
      }
    } else {
      return this.hide()
    }
  }

  componentWillReceiveProps(newProps) {
    return this.collapse()
  }

  getStyle() {
    if (!this.state.position) {
      return {}
    }
  }

  handleClick(item) {
    return this.props.editor.setDirection(item.type)
  }

  render() {
    return (
      <div
        ref="image_popover"
        className={ `dante-popover popover--Aligntooltip popover--top popover--animated ${ this.state.show ? 'is-active' : undefined }` }
        style={ 
          { top: this.state.position.top,
            left: this.state.position.left }
          }
      >
        <div className='popover-inner'>
          <ul className='dante-menu-buttons'>
            { this.state.buttons.map( (item, i) => {
                return  <DanteImagePopoverItem
                          item={ item }
                          handleClick={ this.handleClick }
                          key={ i }
                        />
              })
            }
          </ul>
        </div>
        <div className='popover-arrow' />
      </div>
    )
  }
}

class DanteImagePopoverItem extends React.Component {

  constructor(...args) {
    super(...args)
    this.handleClick = this.handleClick.bind(this)
    this.render = this.render.bind(this)
  }

  handleClick(e) {
    e.preventDefault()
    return this.props.handleClick(this.props.item)
  }

  render() {
    return <li 
      className={`dante-menu-button align-${ this.props.item.type }`} 
      onMouseDown={this.handleClick}>
        <span className={`tooltip-icon dante-icon-image-${ this.props.item.type }`} />
    </li>
  }
}

export default DanteImagePopover

