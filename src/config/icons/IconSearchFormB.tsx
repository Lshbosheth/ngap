const IconSearchForm = (props: any) => {
    const { width = '50px', height = '50px' } = props;
    return (
        <div>
            <img src={new URL(`./IconSearchFormB.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconSearchForm;
