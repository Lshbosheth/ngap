const IconText = (props: any) => {
    const { width = '50px', height = '50px' } = props;

    return (
        <div>
            <img src={new URL(`./IconText.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconText;
