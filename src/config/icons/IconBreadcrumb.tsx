const IconBreadcrumb = (props: any) => {
    const { width = '50px', height = '50px' } = props;
    return (
        <div>
            <img src={new URL(`./IconBreadcrumb.png`, import.meta.url).href} alt="" />
        </div>
    );
};
export default IconBreadcrumb;
