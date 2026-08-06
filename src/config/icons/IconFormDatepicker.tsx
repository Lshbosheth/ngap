const IconFormDatepicker = (props: any) => {
    const { width = '40px', height = '40px' } = props;
    return (
        <div>
            <img src={new URL(`./IconFormDatepicker.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconFormDatepicker;
