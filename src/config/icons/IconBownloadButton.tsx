const IconBownloadButton = (props: any) => {
    const { width = '40px', height = '40px' } = props;
    return (
        <div>
            <img src={new URL(`./IconDownloadButton.png`, import.meta.url).href} alt="" style={{width: '30px', height: '30px'}} />
        </div>
    );
};
export default IconBownloadButton;
