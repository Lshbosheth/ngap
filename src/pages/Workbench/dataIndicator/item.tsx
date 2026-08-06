interface ItemProps {
    data: any;
    index: number;
}

const Item = ({data, index}: ItemProps) => {

    return <div className={'data-indicator-item-wrap'} style={{marginLeft: index === 0 ? 0 : 20}}>
        <div>{data.title}</div>
        <div className={'data-indicator-item-value'}>{data.value}</div>

        <div className={'high-line'}/>
    </div>
}

export default Item
