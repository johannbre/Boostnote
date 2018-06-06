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

class ShowHistoryModal extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  componentDidMount () {
  }

  handleCloseButtonClick (e) {
    this.props.close()
  }

  handleLeftSlideMouseDown(e) {
    debugger
    e.preventDefault()
    this.setState({
      isLeftSliderFocused: true
    })
  }

  handleMouseUp (e) {
    debugger
    // Change width of NoteList component.
    if (this.state.isRightSliderFocused) {
      this.setState({
        isRightSliderFocused: false
      }, () => {
        const { dispatch } = this.props
        const newListWidth = this.state.revisionListWidth
        // TODO: ConfigManager should dispatch itself.
        ConfigManager.set({revisionListWidth: newListWidth})
        dispatch({
          type: 'SET_LIST_WIDTH',
          listWidth: newListWidth
        })
      })
    }
  }

  handleMouseMove (e) {
    if (this.state.isLeftSliderFocused) {
      debugger
      let navWidth = e.pageX
      if (navWidth < 80) {
        navWidth = 80
      } else if (navWidth > 600) {
        navWidth = 600
      }
      this.setState({
        navWidth: navWidth
      })
    }
  }

  handleSnippetNoteButtonKeyDown (e) {
    if (e.keyCode === 9) {
      e.preventDefault()
      this.refs.markdownButton.focus()
    }
  }

  handleKeyDown (e) {
    if (e.keyCode === 27) {
      this.props.close()
    }
  }

  render () {
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

        <HistoryList style={{width: this.props.config.revisionListWidth}}
            {..._.pick(this.props, [
              'dispatch',
              'data',
              'config',
              'params',
              'location',
              'note',
              'selectedNoteKeys'
            ])}
        />

        <div styleName={this.state.isLeftSliderFocused ? 'slider--active' : 'slider'}
            style={{left: this.props.config.revisionListWidth - 1}}
            onMouseDown={(e) => this.handleLeftSlideMouseDown(e)}
            draggable='false'>
          <div styleName = 'slider-hitbox'/>
        </div>
        <div styleName='description'><i className='fa fa-arrows-h' />{i18n.__('Tab to switch format')}</div>
      </div>
    )
  }
}

ShowHistoryModal.propTypes = {
}

export default CSSModules(ShowHistoryModal, styles)
