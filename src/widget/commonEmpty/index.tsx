import empty from './imgs/empty.png'
import './index.less'

interface CommonEmptyProps {
    height?: string
}

const CommonEmpty = ({height = '100%'}) => {

    return <div className={'common-empty-wrap'} style={{height}}>
        <img className={'common-empty-image'}
             src={empty}/>

        <div className={'common-empty-desc'}>暂无数据</div>
    </div>
}

export default CommonEmpty
