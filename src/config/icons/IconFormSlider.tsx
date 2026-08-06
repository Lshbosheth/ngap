const IconFormSlider = (props: any) => {
    const { width = '50px', height = '50px' } = props;
    return (
        <div>
            <img src={new URL(`./IconFormSlider.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconFormSlider;
