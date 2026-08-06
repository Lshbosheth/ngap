const IconGridForm = (props: any) => {
    const { width = '40px', height = '40px' } = props;
    return (
        <div>
            <img src={new URL(`./IconGridFormB.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconGridForm;
