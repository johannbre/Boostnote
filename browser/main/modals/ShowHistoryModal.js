import PropTypes from 'prop-types'
import React from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './ShowHistoryModal.styl'
import dataApi from 'browser/main/lib/dataApi'
import { hashHistory } from 'react-router'
import ee from 'browser/main/lib/eventEmitter'
import ModalEscButton from 'browser/components/ModalEscButton'
import AwsMobileAnalyticsConfig from 'browser/main/lib/AwsMobileAnalyticsConfig'
import i18n from 'browser/lib/i18n'
import NoteRevisionList from '../ViewNoteHistory/RevisionList'
import ConfigManager from 'browser/main/lib/ConfigManager'
import localHistory from 'browser/main/lib/dataApi/localHistoryManagement'
import { parseDiff, Diff } from 'react-diff-view'
import { diffAsText }  from 'unidiff'
import 'style!css!../../../node_modules/react-diff-view/src/Diff.css'
import 'style!css!../../../node_modules/react-diff-view/src/Hunk.css'
import 'style!css!../../../node_modules/react-diff-view/src/Change.css'

function findNotesByKeys(notes, noteKeys) {
  return notes.filter((note) => noteKeys.includes(note.key))
}

class ShowHistoryModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      revisionListWidth: props.config.revisionListWidth,
      selectedNoteKeys: []
    }

    this.baseNote = props.note
    this.revisions = localHistory.getNoteRevisions(this.baseNote.storage, this.baseNote.key)
    if (this.revisions != null && this.revisions.length > 0) {
      let { selectedNoteKeys } = this.state
      selectedNoteKeys.push(this.revisions[0].key)
    }
  }

  componentDidMount() {

  }

  handleCloseButtonClick(e) {
    this.props.close()
  }

  handleLeftSlideMouseDown(e) {
    e.preventDefault()
    this.setState({
      isLeftSliderFocused: true
    })
  }

  handleMouseUp(e) {
    // Change width of NoteList component.
    if (this.state.isLeftSliderFocused) {
      this.setState({
        isLeftSliderFocused: false
      }, () => {
        const { dispatch } = this.props
        const newListWidth = this.state.revisionListWidth
        // TODO: ConfigManager should dispatch itself.
        ConfigManager.set({ revisionListWidth: newListWidth })
        dispatch({
          type: 'SET_LIST_WIDTH',
          listWidth: newListWidth
        })
      })
    }
  }

  handleMouseMove(e) {
    if (this.state.isLeftSliderFocused) {
      let newListWidth = e.pageX - 40
      if (newListWidth < 80) {
        newListWidth = 80
      } else if (newListWidth > 600) {
        newListWidth = 600
      }
      this.setState({
        revisionListWidth: newListWidth
      })
    }
  }

  handleSnippetNoteButtonKeyDown(e) {
    if (e.keyCode === 9) {
      e.preventDefault()
      this.refs.markdownButton.focus()
    }
  }

  handleKeyDown(e) {
    if (e.keyCode === 27) {
      this.props.close()
    }
  }

  render() {
    let { selectedNoteKeys } = this.state
    var selectedRevision = findNotesByKeys(this.revisions, selectedNoteKeys)

    var diff = diffAsText(
      this.baseNote.content,
      selectedRevision[0].content,
      {context: 20})

    var files = parseDiff("diff --git a/current b/previous\nindex 0..0\n" + diff)
    return (
      <div styleName='root'
        tabIndex='-1'
        onMouseMove={(e) => this.handleMouseMove(e)}
        onMouseUp={(e) => this.handleMouseUp(e)}
        onKeyDown={(e) => this.handleKeyDown(e)}>

        <div styleName='header'>
          <div styleName='title'>{i18n.__('Note history')}</div>
        </div>
        <ModalEscButton handleEscButtonClick={(e) => this.handleCloseButtonClick(e)} />

        <NoteRevisionList style={{ width: this.state.revisionListWidth }}
          revisions={this.revisions}
          selectedNoteKeys={this.state.selectedNoteKeys}
          {..._.pick(this.props, [
            'dispatch',
            'data',
            'config',
            'params',
            'location'
          ])}
        />

        <div styleName='diff' style={{left: this.state.revisionListWidth}}> 
          {files.map(({hunks}, i) => <Diff key = {i} hunks = {hunks} viewType="split" /> )} 
        </div>

        <div styleName={this.state.isLeftSliderFocused ? 'slider--active' : 'slider'}
          style={{ left: this.state.revisionListWidth - 1 }}
          onMouseDown={(e) => this.handleLeftSlideMouseDown(e)}
          draggable='false'>
          <div styleName='slider-hitbox' />
        </div>
        <div styleName='description'><i className='fa fa-arrows-h' />{i18n.__('Tab to switch format')}</div>
      </div>
    )
  }
}

ShowHistoryModal.propTypes = {}

ShowHistoryModal.contextTypes = {
}

export default CSSModules(ShowHistoryModal, styles)