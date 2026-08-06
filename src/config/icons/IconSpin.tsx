const IconSpin = (props: any) => {
    const { width = '25px', height = '25px' } = props;
    return (
        <div>
            <img src={new URL(`./IconSpin.png`, import.meta.url).href} alt="" />
        </div>
    );
};
export default IconSpin;
