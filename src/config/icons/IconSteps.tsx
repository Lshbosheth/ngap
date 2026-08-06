const IconSteps = (props: any) => {
    const { width = '25px', height = '25px' } = props;
    return (
        <div>
            <img src={new URL(`./IconSteps.png`, import.meta.url).href} alt="" />
        </div>
    );
};
export default IconSteps;
