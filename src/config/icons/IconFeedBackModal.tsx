const IconFeedBackModal = (props: any) => {
    const { width = '50px', height = '50px' } = props;
    return (
        <div>
            <img src={new URL(`./IconFeedBackModal.png`, import.meta.url).href} alt="" />
        </div>
    );
};

export default IconFeedBackModal;
