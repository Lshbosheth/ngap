const IconFlex = (props: any) => {
    const { width = '40px', height = '40px' } = props;
    return (
        <div>
            <img src={new URL(`./IconFlex.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconFlex;
