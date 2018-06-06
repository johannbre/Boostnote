import React from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './ShowHistoryModal.styl'
import dataApi from 'browser/main/lib/dataApi'
import { hashHistory } from 'react-router'
import ee from 'browser/main/lib/eventEmitter'
import ModalEscButton from 'browser/components/ModalEscButton'
import AwsMobileAnalyticsConfig from 'browser/main/lib/AwsMobileAnalyticsConfig'
import i18n from 'browser/lib/i18n'
import HistoryList from '../ViewNoteHistory/HistoryList'
import ConfigManager from 'browser/main/lib/ConfigManager'
import localHistory from 'browser/main/lib/dataApi/localHistoryManagement'

class ShowHistoryModal extends React.Component {
  constructor(props) {
    super(props)

    debugger
    this.state = {
      revisionListWidth: props.config.revisionListWidth,
      revisions: localHistory.getNoteRevisions(props.note.storage, props.note.key)
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
      // debugger
      // const offset = this.refs.body.getBoundingClientRect().left
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
    var unidiff = require('unidiff')
    var diff = unidiff.diffLines(
      'a quick\nbrown\nfox\njumped\nover\nthe\nlazy\ndog\n',
      'a quick\nbrown\ncat\njumped\nat\nthe\nnot-so-lazy\nfox\n'
    )
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

        <HistoryList style={{ width: this.state.revisionListWidth }}
          revisions={this.state.revisions}
          {..._.pick(this.props, [
            'dispatch',
            'data',
            'config',
            'params',
            'location',
            'selectedNoteKeys'
          ])}
        />


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

ShowHistoryModal.propTypes = {
}

export default CSSModules(ShowHistoryModal, styles)
