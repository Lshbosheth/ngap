const IconBottomBanner = (props: any) => {
    const { width = '50px', height = '50px' } = props;
    return (
        <div>
            <img src={new URL(`./IconBottomBanner.png`, import.meta.url).href} alt="" />
        </div>
    );
};
export default IconBottomBanner;
