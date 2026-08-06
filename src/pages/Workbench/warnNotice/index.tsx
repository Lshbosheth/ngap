import './index.less'
import '../index.less'

const WarnNotice = ()=>{
    const getImgUrl = (fileName: string) => {
        return new URL(`../img/${fileName}`, import.meta.url).href
    }
    return <div className={'warn-notice-wrap'}>
        <div className={'work-bench-title'}>预警提醒</div>

        <div className={'warn-notice-content'}>
            <img className={'warn-notice-img'} src={getImgUrl('building.png')}/>
            <div className={'warn-notice-desc'}>功能开发中,敬请期待</div>
        </div>

    </div>
}
export default WarnNotice
