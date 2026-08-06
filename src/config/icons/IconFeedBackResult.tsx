const IconFeedBackResult = (props: any) => {
    const { width = '50px', height = '50px' } = props;
    return (
        <div>
            <img src={new URL(`./IconFeedBackResult.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconFeedBackResult;
