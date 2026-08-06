const IconDiv = (props: any) => {
    const { width = '60px', height = '60px' } = props;
    return (
        <div>
            <img src={new URL(`./IconDiv.png`, import.meta.url).href} alt="" />
        </div>
    );
};
export default IconDiv;
