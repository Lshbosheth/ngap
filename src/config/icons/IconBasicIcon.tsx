const IconBasicIcon = (props: any) => {
    const { width = '50px', height = '50px' } = props;
    return (
        <div>
            <img src={new URL(`./IconBasicIcon.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconBasicIcon;
