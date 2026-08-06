const IconVideo = (props: any) => {
    const { width = '40px', height = '40px' } = props;
    return (
        <div>
            <img src={new URL(`./IconVideo.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconVideo;
