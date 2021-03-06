// @flow

import styled from 'styled-components'

const CenterScreen = styled<{}, {}, 'div'>('div')`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`
export default CenterScreen
