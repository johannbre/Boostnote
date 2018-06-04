import PropTypes from 'prop-types'
import React from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './ShowHistoryButton.styl'
import i18n from 'browser/lib/i18n'

const ShowHistoryButton = ({
  onClick
}) => (
  <button styleName='control-showHistoryButton'
    onClick={(e) => onClick(e)}
  >
    <img className='showHistoryButton' src='../resources/icon/icon-info.svg' />
    <span styleName='tooltip'>{i18n.__('History')}</span>
  </button>
)

ShowHistoryButton.propTypes = {
  onClick: PropTypes.func.isRequired
}

export default CSSModules(ShowHistoryButton, styles)
