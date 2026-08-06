const IconWatermark = (props: any) => {
    const { width = '40px', height = '40px' } = props;
    return (
        <div>
            <img src={new URL(`./IconWatermark.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconWatermark;
