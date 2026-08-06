import './index.less'

interface ItemProps {
    data: any;
    index: number
}

const Item: React.FC<ItemProps> = ({data, index}) => {

    const getImgUrl = (fileName: string) => {
        return new URL(`../img/${fileName}`, import.meta.url).href
    }

    return <div className={'create-recent-item-wrap'} style={{marginLeft: index === 0 ? 0 : 20}}>

        <div className={'create-recent-item-top'}>
            <img className={'create-recent-item-icon'} src={getImgUrl('app-logo.png')}/>

            <div className={'create-recent-item-content'}>
                <div className={'create-recent-item-title'}>{data.title}</div>
                <div className={'create-recent-item-desc'}>{data.desc}</div>
            </div>
        </div>

        <div className={'create-recent-item-bottom'}>

            <div className={'create-recent-item-value-wrap'}>
                <div className={'create-recent-item-value-title'}>已上线应用量</div>
                <div className={'create-recent-item-value'}>{data.online}</div>
            </div>
            <div className={'create-recent-item-value-divider'}/>
            <div className={'create-recent-item-value-wrap'}>
                <div className={'create-recent-item-value-title'}>总应用量</div>
                <div className={'create-recent-item-value'}>{data.total}</div>
            </div>

        </div>
    </div>
}
export default Item
