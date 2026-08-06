const IconTag = (props: any) => {
    const { width = '25px', height = '25px' } = props;
    return (
        <div>
            <img src={new URL(`./IconTag.png`, import.meta.url).href} alt="" />
        </div>
    );
};
export default IconTag;
