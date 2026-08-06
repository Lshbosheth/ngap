const IconFormSwitch = (props: any) => {
    const { width = '50px', height = '50px' } = props;
    return (
        <div>
            <img src={new URL(`./IconFormSwitch.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconFormSwitch;
