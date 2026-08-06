const IconIframe = (props: any) => {
    const { width = '40px', height = '40px' } = props;
    return (
        <div>
            <img src={new URL(`./IconIframe.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconIframe;
