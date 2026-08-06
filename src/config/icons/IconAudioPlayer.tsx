const IconAudioPlayer = (props: any) => {
    const { width = '40px', height = '40px' } = props;
    return (
        <div>
            <img src={new URL(`./IconAudioPlayer.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconAudioPlayer;
